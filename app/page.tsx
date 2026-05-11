"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Building2, Users, GitBranch, Layers, MapPin } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { SmartSearchBar } from "@/components/smart-search-bar";
import { FeaturedEmployees } from "@/components/featured-employees";
import { getEmployees, getCompanies, getCompanyStats, getDepartments } from "@/lib/data";
import { getCompanyConfig } from "@/lib/companyConfig";
import { isLeadershipRole, getLeadershipTier } from "@/lib/utils";
import { AdminTrigger } from "@/components/admin/admin-trigger";
import { AdminToolbar } from "@/components/admin/admin-toolbar";
import { PinModal } from "@/components/admin/pin-modal";
import { AdminProvider } from "@/components/admin/admin-context";

export default function HomePage() {
  const employees = getEmployees();
  const companies = getCompanies().filter(c => !c.disabled);
  const departments = getDepartments();
  const companyStats = getCompanyStats().filter(c => {
    const company = companies.find(comp => comp.id === c.id);
    return company && !company.disabled;
  });

  // Calculate stats for the stats bar
  const stats = useMemo(() => {
    const locations = new Set<string>();
    employees.forEach(emp => {
      if (emp.location) locations.add(emp.location);
    });
    return {
      employeeCount: employees.length,
      companyCount: companies.length,
      departmentCount: departments.length,
      locationCount: locations.size,
    };
  }, [employees, companies, departments]);

  const featuredEmployees = employees
    .filter(emp => {
      const company = companies.find(c => c.id === emp.company);
      return company && !company.disabled && isLeadershipRole(emp.position);
    })
    .sort((a, b) => {
      const tierDiff = getLeadershipTier(a.position) - getLeadershipTier(b.position);
      if (tierDiff !== 0) return tierDiff;
      return a.name.localeCompare(b.name, 'es-MX');
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
                  fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
                  fontSize: "clamp(2.5rem, 10vw, 5rem)",
                  letterSpacing: "-0.03em"
                }}
              >
                <span style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace", color: "var(--foreground)" }}>SHU</span>
                <span style={{
                  fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899)',
                  backgroundSize: '300% 300%',
                  animation: 'gradientShift 4s ease infinite',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>MA</span>
              </h1>
              <div className="max-w-[560px] mx-auto mb-12 text-center">
                <style>{`
                  @keyframes shimmerText {
                    0% { background-position: 0% center; }
                    100% { background-position: 200% center; }
                  }
                `}</style>
                <p 
                  className="font-dm-sans text-scale-xl"
                  style={{
                    fontWeight: 600,
                    color: "var(--foreground)",
                    letterSpacing: "0.01em",
                  }}
                >
                  Cada persona<span style={{ color: "#00C9A7" }}>.</span> Cada empresa<span style={{ color: "#845EC2" }}>.</span> Un solo{" "}
                  <span
                    style={{
                      fontWeight: 800,
                      background: "linear-gradient(90deg, #00C9A7, #845EC2, #00C2FF, #00C9A7)",
                      backgroundSize: "200% auto",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      animation: "shimmerText 3s linear infinite",
                    }}
                  >
                    Shuma
                  </span>
                  <span style={{ color: "#00C2FF" }}>.</span>
                </p>
                <p 
                  className="font-dm-sans text-scale-base"
                  style={{
                    fontWeight: 400,
                    color: "var(--muted-foreground)",
                    marginTop: "8px",
                    fontStyle: "italic",
                  }}
                >
                  El talento que nos mueve, al alcance de todos.
                </p>
              </div>
            </motion.div>

            {/* Smart Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-8 mb-6"
            >
              <SmartSearchBar />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/directorio" className="w-full sm:w-auto">
                <button 
                  className="w-full group flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-text-primary text-bg-base tracking-widest transition-all hover:scale-105 active:scale-95 text-scale-base"
                  style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}
                >
                  Ver Directorio
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/organigrama" className="w-full sm:w-auto">
                <button 
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-border-strong text-text-primary tracking-widest transition-all hover:bg-white/5 active:scale-95 text-scale-base"
                  style={{ fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace" }}
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
                // Company color config - reduced saturation for non-Retina displays
                const colorConfig: Record<string, { primary: string; glow: string; highlight: string; initial: string; shadow: string }> = {
                  comercializadora: { 
                    primary: "#0047AB", 
                    glow: "rgba(0,71,171,0.12)", 
                    highlight: "#4D9FFF", 
                    initial: "C",
                    shadow: "0 0 0 1px rgba(0,71,171,0.25), 0 8px 24px rgba(0,71,171,0.12)"
                  },
                  acabados: { 
                    primary: "#C0152A", 
                    glow: "rgba(192,21,42,0.12)", 
                    highlight: "#FF4D5E", 
                    initial: "A",
                    shadow: "0 0 0 1px rgba(192,21,42,0.25), 0 8px 24px rgba(192,21,42,0.12)"
                  },
                  ferrecapital: { 
                    primary: "#2C3338", 
                    glow: "rgba(44,51,56,0.20)", 
                    highlight: "#CC0000", 
                    initial: "F",
                    shadow: "0 0 0 1px rgba(44,51,56,0.40), 0 8px 24px rgba(44,51,56,0.20)"
                  },
                  arkiramica: { 
                    primary: "#F5C400", 
                    glow: "rgba(245,196,0,0.10)", 
                    highlight: "#FFE566", 
                    initial: "Ar",
                    shadow: "0 0 0 1px rgba(245,196,0,0.22), 0 8px 24px rgba(245,196,0,0.10)"
                  },
                };
                
                const fallbackConfig = getCompanyConfig(company.id);
                const config = colorConfig[company.id] || {
                  primary: fallbackConfig.primary,
                  glow: fallbackConfig.glow,
                  highlight: fallbackConfig.highlight,
                  initial: fallbackConfig.initial,
                  shadow: `0 0 0 1px ${fallbackConfig.glow}, 0 8px 24px ${fallbackConfig.glow}`
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
                          minHeight: 'calc(180px * var(--font-scale))',
                          borderLeft: `4px solid ${config.primary}`,
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-subtle)',
                          borderLeftWidth: '4px',
                          borderLeftColor: config.primary,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = config.shadow;
                          e.currentTarget.style.background = `linear-gradient(135deg, color-mix(in srgb, ${config.primary} 8%, transparent) 0%, transparent 60%), #0F1114`;
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
                            fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
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
                            style={{ 
                              backgroundColor: `color-mix(in srgb, ${config.primary} 15%, transparent)`,
                              border: `1px solid color-mix(in srgb, ${config.primary} 30%, transparent)`
                            }}
                          >
                            <Building2 className="w-6 h-6" style={{ color: config.primary }} />
                          </div>
                          
                          {/* Company name */}
                          <h3 
                            className="text-text-primary mb-3 leading-tight font-bold line-clamp-2 text-scale-md"
                            style={{ 
                              fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', monospace",
                              minHeight: "2.5em",
                            }}
                          >
                            {company.shortName || company.name}
                          </h3>
                          
                          {/* Stats */}
                          <div className="space-y-1.5 mb-4">
                            <div className="flex items-center gap-2 text-text-muted">
                              <Users className="w-3.5 h-3.5" />
                              <span className="font-dm-sans text-scale-sm">{company.employeeCount} colaboradores</span>
                            </div>
                            <div className="flex items-center gap-2 text-text-muted">
                              <Layers className="w-3.5 h-3.5" />
                              <span className="font-dm-sans text-scale-sm">{company.departmentCount} departamentos</span>
                            </div>
                          </div>
                          
                          {/* Ver equipo link */}
                          <div 
                            className="flex items-center gap-1 font-medium transition-all group-hover:gap-2"
                            style={{ color: config.primary }}
                          >
                            <span className="text-scale-sm font-neuropol tracking-wide">
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

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground text-scale-sm"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {stats.employeeCount} colaboradores
              </span>
              <span className="hidden sm:inline text-border-subtle">|</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                {stats.companyCount} empresas
              </span>
              <span className="hidden sm:inline text-border-subtle">|</span>
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                {stats.departmentCount} departamentos
              </span>
              <span className="hidden sm:inline text-border-subtle">|</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {stats.locationCount} sucursales
              </span>
            </motion.div>
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
