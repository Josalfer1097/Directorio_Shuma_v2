"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { SearchBar } from "@/components/search-bar";
import { StatsCards } from "@/components/stats-cards";
import { CompanyCard } from "@/components/company-card";
import { FeaturedEmployees } from "@/components/featured-employees";
import { Button } from "@/components/ui/button";
import { getCompanyStats, getTotalStats, getEmployees, getCompanies } from "@/lib/data";

export default function HomePage() {
  const companyStats = getCompanyStats();
  const totalStats = getTotalStats();
  const employees = getEmployees();
  const companies = getCompanies();

  // Featured employees - directors and managers
  const featuredEmployees = employees.filter(
    (emp) =>
      emp.position.toLowerCase().includes("director") ||
      emp.position.toLowerCase().includes("gerente")
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              <span className="text-foreground">Directorio </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Corporativo
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Encuentra rápidamente la información de contacto de todos los
              colaboradores de Grupo Shuma y sus empresas subsidiarias.
            </p>
          </motion.div>

          <SearchBar />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center gap-4 mt-8"
          >
            <Link href="/directorio">
              <Button size="lg" className="gap-2">
                Ver Directorio
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/organigrama">
              <Button size="lg" variant="outline">
                Ver Organigrama
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <StatsCards
            totalEmployees={totalStats.totalEmployees}
            totalCompanies={totalStats.totalCompanies}
            totalDepartments={totalStats.totalDepartments}
          />
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-bold text-foreground">
              Nuestras Empresas
            </h2>
            <p className="text-muted-foreground">
              Grupo Shuma y sus subsidiarias
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {companyStats.map((company, index) => (
              <CompanyCard key={company.id} company={company} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Employees Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <FeaturedEmployees employees={featuredEmployees} companies={companies} />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Grupo Shuma. Todos los derechos
              reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/directorio"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Directorio
              </Link>
              <Link
                href="/organigrama"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Organigrama
              </Link>
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
