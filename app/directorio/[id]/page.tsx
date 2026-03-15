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

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/directorio">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al directorio
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
              className="h-32 relative"
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

            <div className="px-8 pb-8">
              {/* Avatar - positioned to overlap the header */}
              <div className="-mt-16 mb-6 flex items-end justify-between">
                <Avatar className="w-32 h-32 border-4 border-card shadow-xl">
                  <AvatarFallback
                    className="text-4xl font-bold"
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
                    className="px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${company.color}15`,
                      color: company.color,
                    }}
                  >
                    {company.shortName || company.name}
                  </span>
                )}
              </div>

              {/* Name and position */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {employee.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {employee.position}
                </p>
              </div>

              {/* Contact info grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => copyToClipboard(employee.email, "email")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-foreground truncate">{employee.email}</p>
                  </div>
                  {copiedField === "email" ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <button
                  onClick={() => copyToClipboard(employee.phone, "phone")}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left group"
                >
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p className="text-foreground">
                      {employee.phone} ext. {employee.extension}
                    </p>
                  </div>
                  {copiedField === "phone" ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Departamento</p>
                    <p className="text-foreground">{employee.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Fecha de ingreso
                    </p>
                    <p className="text-foreground">
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

          {/* Reporting Chain */}
          {reportingChain.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Cadena de Reporte
              </h2>
              <div className="flex items-center flex-wrap gap-2">
                {reportingChain.map((manager, index) => {
                  const managerCompany = getCompanyById(manager.company);
                  return (
                    <div key={manager.id} className="flex items-center gap-2">
                      <Link href={`/directorio/${manager.id}`}>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
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
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10">
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
            </motion.div>
          )}

          {/* Direct Reports */}
          {directReports.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">
                  Reportes Directos ({directReports.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {directReports.map((report) => {
                  const reportCompany = getCompanyById(report.company);
                  return (
                    <Link key={report.id} href={`/directorio/${report.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                        <Avatar className="w-10 h-10 border border-border">
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
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {report.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {report.position}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
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
