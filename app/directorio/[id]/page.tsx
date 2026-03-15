"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Copy,
  Check,
  Building2,
  Calendar,
  ChevronRight,
  Users,
  ArrowLeft,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getEmployeeById,
  getCompanyById,
  getDirectReports,
  getReportingChain,
} from "@/lib/data";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: Props) {
  const { id } = use(params);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const employee = getEmployeeById(id);
  if (!employee) {
    notFound();
  }

  const company = getCompanyById(employee.company);
  const reportingChain = getReportingChain(employee.id);
  const directReports = getDirectReports(employee.id);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="md:pt-24 pt-16 pb-24 md:pb-16 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          {/* Mobile Back button - fixed at top */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/directorio">
              <Button
                variant="ghost"
                className="gap-2 md:relative fixed md:static left-4 top-20 z-20 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Volver</span>
              </Button>
            </Link>
          </motion.div>

          {/* Main Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card mb-8"
          >
            {/* Header gradient */}
            <div
              className="h-24 md:h-32 relative"
              style={{
                background: `linear-gradient(135deg, ${company?.color}40 0%, ${company?.color}10 100%)`,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 30% 50%, ${company?.color}30, transparent 50%)`,
                }}
              />
            </div>

            <div className="px-4 md:px-8 pb-8">
              {/* Avatar - larger on mobile, centered */}
              <div className="-mt-12 md:-mt-16 mb-6 flex flex-col items-center md:flex-row md:items-end md:justify-between">
                <Avatar className="w-24 md:w-32 h-24 md:h-32 border-4 border-card shadow-xl">
                  <AvatarFallback
                    className="text-2xl md:text-4xl font-bold"
                    style={{
                      backgroundColor: `${company?.color}20`,
                      color: company?.color,
                    }}
                  >
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>

                {company && (
                  <span
                    className="px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium mt-4 md:mt-0"
                    style={{
                      backgroundColor: `${company.color}15`,
                      color: company.color,
                    }}
                  >
                    {company.shortName || company.name}
                  </span>
                )}
              </div>

              {/* Name and position - centered on mobile */}
              <div className="mb-6 text-center md:text-left">
                <h1 className="font-bold mb-2 text-foreground">
                  {employee.name}
                </h1>
                <p className="font-semibold text-muted-foreground mb-1">
                  {employee.position}
                </p>
                <p className="text-sm text-muted-foreground">
                  {employee.department}
                </p>
              </div>

              {/* Contact info - large tappable rows on mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                {/* Email */}
                <button
                  onClick={() => (window.location.href = `mailto:${employee.email}`)}
                  className="flex items-center gap-4 p-4 md:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group h-14 md:h-auto md:py-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm md:text-base text-foreground truncate font-medium">
                      {employee.email}
                    </p>
                  </div>
                  <Copy className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>

                {/* Phone */}
                <button
                  onClick={() => (window.location.href = `tel:${employee.phone}`)}
                  className="flex items-center gap-4 p-4 md:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group h-14 md:h-auto md:py-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Teléfono
                    </p>
                    <p className="text-sm md:text-base text-foreground font-medium">
                      {employee.phone}{" "}
                      <span className="text-xs">ext. {employee.extension}</span>
                    </p>
                  </div>
                  <Copy className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>

                {/* Department */}
                <div className="flex items-center gap-4 p-4 md:p-4 rounded-xl bg-muted/50 h-14 md:h-auto md:py-4">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Departamento
                    </p>
                    <p className="text-sm md:text-base text-foreground font-medium">
                      {employee.department}
                    </p>
                  </div>
                </div>

                {/* Start Date */}
                <div className="flex items-center gap-4 p-4 md:p-4 rounded-xl bg-muted/50 h-14 md:h-auto md:py-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Ingreso
                    </p>
                    <p className="text-sm md:text-base text-foreground font-medium">
                      {formatDate(employee.startDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {employee.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {employee.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

            {/* Reporting Chain - horizontal scrollable chips */}
          {reportingChain.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-4 md:p-6 mb-8"
            >
              <h2 className="font-semibold text-foreground mb-4">
                Cadena de Reporte
              </h2>
              <div className="overflow-x-auto -mx-4 md:-mx-6 px-4 md:px-6">
                <div className="flex items-center gap-2 w-max">
                  {reportingChain.map((manager, index) => {
                    const managerCompany = getCompanyById(manager.company);
                    return (
                      <div key={manager.id} className="flex items-center gap-2">
                        <Link href={`/directorio/${manager.id}`}>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors whitespace-nowrap">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback
                                className="text-[10px]"
                                style={{
                                  backgroundColor: `${managerCompany?.color}20`,
                                  color: managerCompany?.color,
                                }}
                              >
                                {getInitials(manager.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-foreground">
                              {manager.name}
                            </span>
                          </div>
                        </Link>
                        {index < reportingChain.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    );
                  })}
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 whitespace-nowrap">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback
                        className="text-[10px]"
                        style={{
                          backgroundColor: `${company?.color}20`,
                          color: company?.color,
                        }}
                      >
                        {getInitials(employee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-primary">
                      {employee.name}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

            {/* Direct Reports - compact vertical list */}
          {directReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-4 md:p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-semibold text-foreground">
                  Reportes Directos ({directReports.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                {directReports.map((report) => {
                  const reportCompany = getCompanyById(report.company);
                  return (
                    <Link key={report.id} href={`/directorio/${report.id}`}>
                      <div className="flex items-center gap-3 p-3 md:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group min-h-16 md:min-h-auto">
                        <Avatar className="w-10 h-10 border border-border shrink-0">
                          <AvatarFallback
                            style={{
                              backgroundColor: `${reportCompany?.color}20`,
                              color: reportCompany?.color,
                            }}
                          >
                            {getInitials(report.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate text-sm md:text-base">
                            {report.name}
                          </p>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {report.position}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
