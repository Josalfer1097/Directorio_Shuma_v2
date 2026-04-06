"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, GitBranch } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { FeaturedEmployees } from "@/components/featured-employees";
import { getEmployees, getCompanies, getCompanyStats } from "@/lib/data";
import { AdminTrigger } from "@/components/admin/admin-trigger";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { PinModal } from "@/components/admin/pin-modal";
import { AdminProvider } from "@/components/admin/admin-context";

export default function HomePage() {
  const employees = getEmployees();
  const companies = getCompanies().filter(c => !c.disabled);
  const companyStats = getCompanyStats().filter(c => {
    const company = companies.find(comp => comp.id === c.id);
    return company && !company.disabled;
  });

  const featuredEmployees = employees.filter(emp => {
    const company = companies.find(c => c.id === emp.company);
    return company && !company.disabled && (
      emp.position.toLowerCase().includes("director") ||
      emp.position.toLowerCase().includes("gerente")
    );
  });

  return (
    <AdminProvider>
      <div className="min-h-screen bg-[--bg-base] relative overflow-x-hidden">
        <div className="dot-grid fixed inset-0" />
        
        {/* Ambient Blobs */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] z-[-1] opacity-15 bg-[radial-gradient(circle,rgba(59,130,246,0.15),transparent)]" />
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] z-[-1] opacity-15 bg-[radial-gradient(circle,rgba(139,92,246,0.15),transparent)]" />

        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-32 md:pt-48 pb-20 px-4">
          <div className="container mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 
                className="text-4xl md:text-7xl mb-6 tracking-tight"
                style={{ 
                  fontFamily: "'Neuropol', sans-serif",
                  fontSize: "clamp(64px, 10vw, 120px)",
                  letterSpacing: "-0.03em"
                }}
              >
                <span className="text-[#F2F0EC]" style={{ fontFamily: "'Neuropol', sans-serif" }}>SHU</span>
                <span style={{
                  fontFamily: "'Neuropol', sans-serif",
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)',
                  backgroundSize: '300% 300%',
                  animation: 'gradientShift 4s ease infinite',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>MA</span>
              </h1>
              <p className="font-dm-sans text-[#64647A] text-lg md:text-xl max-w-2xl mx-auto mb-12">
                Conectando el talento de nuestras empresas. Acceso rápido a información de contacto y estructura organizacional.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/directorio" className="w-full sm:w-auto">
                <button 
                  className="w-full group flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-text-primary text-bg-base text-xs tracking-widest transition-all hover:scale-105 active:scale-95"
                  style={{ fontFamily: "'Neuropol', sans-serif" }}
                >
                  Ver Directorio
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/organigrama" className="w-full sm:w-auto">
                <button 
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-border-strong text-text-primary text-xs tracking-widest transition-all hover:bg-white/5 active:scale-95"
                  style={{ fontFamily: "'Neuropol', sans-serif" }}
                >
                  <GitBranch className="w-4 h-4" />
                  Estructura
                </button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Companies Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {companyStats.map((company, index) => {
                const colors = {
                  "comercializadora-shuma": {
                    border: "#0066CC",
                    bg: "rgba(0,102,204,0.12)",
                    icon: "#00AAFF",
                    glow: "rgba(0,102,204,0.20)"
                  },
                  "acabados-shuma": {
                    border: "#C0152A",
                    bg: "rgba(192,21,42,0.15)",
                    icon: "#FF4D5E",
                    glow: "rgba(192,21,42,0.25)"
                  },
                  "ferrecapital": {
                    border: "#2A2A2A",
                    borderAccent: "#CC0000",
                    bg: "rgba(204,0,0,0.10)",
                    icon: "#CC0000",
                    glow: "rgba(204,0,0,0.12)"
                  }
                }[company.id] || {
                  border: company.colors?.primary,
                  bg: `${company.colors?.primary}20`,
                  icon: company.colors?.primary,
                  glow: "rgba(0,0,0,0.2)"
                };

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/directorio?empresa=${company.id}`}>
                      <div 
                        className="group relative p-8 rounded-[14px] bg-[--bg-surface] border border-[--border-subtle] overflow-hidden transition-all duration-[250ms] ease hover:-translate-y-2 hover:shadow-[0_0_40px_var(--glow-color)]"
                        style={{ 
                          borderLeft: `4px solid ${colors.border}`,
                          boxShadow: company.id === 'ferrecapital' ? 'inset 1px 0 0 #CC0000' : 'none',
                          ['--glow-color' as any]: colors.glow
                        }}
                      >
                        <div className="relative z-10">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                            style={{ backgroundColor: colors.bg }}
                          >
                            <Building2 className="w-6 h-6" style={{ color: colors.icon }} />
                          </div>
                          <h3 
                            className="text-lg text-text-primary mb-2 leading-tight"
                            style={{ fontFamily: "'Neuropol', sans-serif" }}
                          >
                            {company.shortName || company.name}
                          </h3>
                          <div className="flex items-center gap-2 text-text-muted">
                            <Users className="w-4 h-4" />
                            <span className="font-dm-sans text-sm">{company.employeeCount} Colaboradores</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Section */}
        <section className="py-20 px-4 bg-bg-surface/30">
          <div className="container mx-auto">
            <FeaturedEmployees employees={featuredEmployees} companies={companies} />
          </div>
        </section>

        {/* Admin Components */}
        <AdminTrigger />
        <AdminToolbar />
        <PinModal />
      </div>
    </AdminProvider>
  );
}
