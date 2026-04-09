"use client";

import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, GitBranch, Layers } from "lucide-react";
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
      <div className="min-h-screen bg-[--bg-base] relative overflow-x-hidden page-transition">
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
                className="mb-6 tracking-tight"
                style={{ 
                  fontFamily: "'Neuropol', sans-serif",
                  fontSize: "clamp(2.5rem, 10vw, 5rem)",
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
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {companyStats.map((company, index) => {
                // Company color config
                const colorConfig: Record<string, { primary: string; glow: string; highlight: string; initial: string }> = {
                  comercializadora: { primary: "#0047AB", glow: "rgba(0,71,171,0.25)", highlight: "#4D9FFF", initial: "C" },
                  acabados: { primary: "#C0152A", glow: "rgba(192,21,42,0.25)", highlight: "#FF4D5E", initial: "A" },
                  ferrecapital: { primary: "#2C3338", glow: "rgba(44,51,56,0.35)", highlight: "#CC0000", initial: "F" },
                  arkiramica: { primary: "#F5C400", glow: "rgba(245,196,0,0.22)", highlight: "#FFE566", initial: "Ar" },
                };
                
                const config = colorConfig[company.id] || {
                  primary: company.colors?.primary || "#C9A84C",
                  glow: "rgba(201,168,76,0.25)",
                  highlight: company.colors?.accent || "#E0C060",
                  initial: company.shortName?.[0] || "S"
                };

                return (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Link href={`/directorio?empresa=${company.id}`}>
                      <div 
                        className="relative p-6 sm:p-8 rounded-[14px] overflow-hidden transition-all duration-[250ms] ease-out"
                        style={{ 
                          borderLeft: `4px solid ${config.primary}`,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderLeftWidth: '4px',
                          borderLeftColor: config.primary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = `0 0 40px ${config.glow}`;
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                          e.currentTarget.style.borderLeftColor = config.highlight;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                          e.currentTarget.style.borderLeftColor = config.primary;
                        }}
                      >
                        {/* Top gradient overlay */}
                        <div 
                          className="absolute top-0 left-0 right-0 h-16 opacity-30 pointer-events-none"
                          style={{ 
                            background: `linear-gradient(180deg, ${config.glow} 0%, transparent 100%)` 
                          }}
                        />
                        
                        {/* Large decorative initial watermark */}
                        <div 
                          className="absolute -top-4 -right-2 pointer-events-none select-none"
                          style={{ 
                            fontFamily: "'Neuropol', sans-serif",
                            fontSize: '80px',
                            fontWeight: 700,
                            opacity: 0.07,
                            color: config.primary,
                            lineHeight: 1,
                          }}
                        >
                          {config.initial}
                        </div>
                        
                        <div className="relative z-10">
                          {/* Company icon */}
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                            style={{ backgroundColor: `${config.primary}20` }}
                          >
                            <Building2 className="w-6 h-6" style={{ color: config.primary }} />
                          </div>
                          
                          {/* Company name */}
                          <h3 
                            className="text-base sm:text-lg text-text-primary mb-3 leading-tight font-bold"
                            style={{ fontFamily: "'Neuropol', sans-serif" }}
                          >
                            {company.shortName || company.name}
                          </h3>
                          
                          {/* Stats */}
                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center gap-2 text-text-muted">
                              <Users className="w-3.5 h-3.5" />
                              <span className="font-dm-sans text-sm">{company.employeeCount} colaboradores</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-muted">
                              <Layers className="w-3.5 h-3.5" />
                              <span className="font-dm-sans text-sm">{company.departmentCount} departamentos</span>
                            </div>
                          </div>
                          
                          {/* Ver equipo link */}
                          <div 
                            className="flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
                            style={{ color: config.primary }}
                          >
                            <span style={{ fontFamily: "'Neuropol', sans-serif", fontSize: '11px', letterSpacing: '0.05em' }}>
                              Ver equipo
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
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
