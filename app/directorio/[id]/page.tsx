"use client";

import { use, useState, Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
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
  X,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getEmployeeById,
  getCompanyById,
  getDirectReports,
  getReportingChain,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

// Error Boundary for the modal
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

class EmployeeDetailErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[v0] Employee detail error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Get monogram class based on company
const getMonogramClass = (companyId: string) => {
  const classMap: Record<string, string> = {
    "comercializadora-shuma": "monogram-comercializadora",
    "acabados-shuma": "monogram-acabados",
    ferrecapital: "monogram-ferrecapital",
    arkiramica: "monogram-arkiramica",
  };
  return classMap[companyId] || "monogram-comercializadora";
};

function EmployeeDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const employee = getEmployeeById(id);
  if (!employee) {
    notFound();
  }

  const company = getCompanyById(employee.company);
  const reportingChain = getReportingChain(employee.id);
  const directReports = getDirectReports(employee.id);

  const primaryColor = company?.colors?.primary || "#C9A84C";

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const copyToClipboard = (text: string | undefined, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPhone = (phone?: string) => {
    if (!phone) return "—";
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
      return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
    }
    return phone;
  };

  const handleClose = () => {
    router.push("/directorio");
  };

  const openTeamsChat = () => {
    if (!employee.email) return;
    window.open(
      `https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-[--bg-base] relative">
      {/* Background effects */}
      <div className="dot-grid" />
      <div className="noise-overlay" />

      {/* Ambient glow */}
      <div
        className="ambient-glow ambient-glow-top"
        style={{ background: primaryColor }}
      />

      {/* Backdrop for modal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-backdrop"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="modal-content w-full max-w-lg max-h-[90vh] overflow-y-auto"
          style={
            { "--modal-color": primaryColor } as React.CSSProperties
          }
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sheet drag handle for mobile */}
          <div className="sm:hidden sheet-drag-handle" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full text-[--text-muted] hover:text-[--text-primary] hover:bg-[--bg-elevated] transition-colors tap-target z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header with monogram */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              {/* Large monogram */}
              <div
                className={cn(
                  "monogram monogram-2xl shrink-0",
                  getMonogramClass(employee.company)
                )}
              >
                {getInitials(employee.name)}
              </div>

              <div className="flex-1 min-w-0 pt-2">
                {/* Name */}
                <h1 className="text-display-lg text-[--text-primary] mb-1">
                  {employee.name || "Sin nombre"}
                </h1>

                {/* Position */}
                <p className="text-[15px] text-[--text-muted] italic mb-2">
                  {employee.position || "—"}
                </p>

                {/* Department badge */}
                <span
                  className="inline-block text-display-xs px-3 py-1 rounded"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                  }}
                >
                  {employee.department || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px mx-6"
            style={{
              background: `linear-gradient(90deg, ${primaryColor}, transparent)`,
              opacity: 0.3,
            }}
          />

          {/* Contact Info */}
          <div className="p-6 space-y-3">
            {/* Email */}
            {employee.email && (
              <button
                onClick={() =>
                  (window.location.href = `mailto:${employee.email}`)
                }
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[--bg-elevated] hover:bg-[--border-subtle] transition-colors text-left group tap-target"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Mail className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[--text-faint] uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm text-[--text-primary] truncate">
                    {employee.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(employee.email, "email");
                    }}
                    className="p-2 rounded hover:bg-[--bg-surface] transition-colors"
                  >
                    {copiedField === "email" ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-[--text-faint]" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openTeamsChat();
                    }}
                    className="p-2 rounded hover:bg-[--bg-surface] transition-colors"
                    title="Abrir chat en Teams"
                  >
                    <MessageSquare className="w-4 h-4 text-[--text-faint] hover:text-[#6264A7]" />
                  </button>
                </div>
              </button>
            )}

            {/* Phone */}
            {employee.phone && (
              <button
                onClick={() =>
                  (window.location.href = `tel:${employee.phone}`)
                }
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[--bg-elevated] hover:bg-[--border-subtle] transition-colors text-left group tap-target"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Phone className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[--text-faint] uppercase tracking-wider">
                    Telefono
                  </p>
                  <p className="text-sm text-[--text-primary]">
                    {formatPhone(employee.phone)}
                    {employee.extension && (
                      <span className="text-[--text-muted] ml-2">
                        ext. {employee.extension}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(employee.phone, "phone");
                  }}
                  className="p-2 rounded hover:bg-[--bg-surface] transition-colors"
                >
                  {copiedField === "phone" ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-[--text-faint]" />
                  )}
                </button>
              </button>
            )}

            {/* Company and Start Date row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[--bg-elevated]">
                <Building2 className="w-5 h-5 text-[--text-faint]" />
                <div>
                  <p className="text-[11px] text-[--text-faint] uppercase tracking-wider">
                    Empresa
                  </p>
                  <p className="text-sm text-[--text-primary]">
                    {company?.shortName || company?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-xl bg-[--bg-elevated]">
                <Calendar className="w-5 h-5 text-[--text-faint]" />
                <div>
                  <p className="text-[11px] text-[--text-faint] uppercase tracking-wider">
                    Ingreso
                  </p>
                  <p className="text-sm text-[--text-primary]">
                    {formatDate(employee.startDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags */}
            {employee.tags && employee.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {employee.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-[--bg-elevated] text-[--text-muted] border-[--border-subtle]"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Reporting Chain */}
          {reportingChain.length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-display-xs text-[--text-faint] mb-3">
                CADENA DE REPORTE
              </h3>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-6 px-6 pb-2">
                {reportingChain.map((manager, index) => (
                  <div key={manager.id} className="flex items-center gap-2">
                    <Link href={`/directorio/${manager.id}`}>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[--bg-elevated] hover:bg-[--border-subtle] transition-colors whitespace-nowrap">
                        <div
                          className={cn(
                            "monogram monogram-sm",
                            getMonogramClass(manager.company)
                          )}
                        >
                          {getInitials(manager.name)}
                        </div>
                        <span className="text-sm text-[--text-primary]">
                          {manager.name}
                        </span>
                      </div>
                    </Link>
                    {index < reportingChain.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-[--text-faint] shrink-0" />
                    )}
                  </div>
                ))}
                <ChevronRight className="w-4 h-4 text-[--text-faint] shrink-0" />
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <div
                    className={cn(
                      "monogram monogram-sm",
                      getMonogramClass(employee.company)
                    )}
                  >
                    {getInitials(employee.name)}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: primaryColor }}
                  >
                    {employee.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Direct Reports */}
          {directReports.length > 0 && (
            <div className="px-6 pb-6">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[--text-faint]" />
                <h3 className="text-display-xs text-[--text-faint]">
                  REPORTES DIRECTOS ({directReports.length})
                </h3>
              </div>
              <div className="space-y-2">
                {directReports.slice(0, 5).map((report) => (
                  <Link key={report.id} href={`/directorio/${report.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-[--bg-elevated] hover:bg-[--border-subtle] transition-colors group tap-target">
                      <div
                        className={cn(
                          "monogram monogram-sm",
                          getMonogramClass(report.company)
                        )}
                      >
                        {getInitials(report.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[--text-primary] group-hover:text-[--gold] transition-colors truncate">
                          {report.name}
                        </p>
                        <p className="text-xs text-[--text-muted] truncate">
                          {report.position}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[--text-faint] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </Link>
                ))}
                {directReports.length > 5 && (
                  <p className="text-xs text-[--text-muted] text-center pt-2">
                    +{directReports.length - 5} mas
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Error fallback component
function ErrorFallback() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[--bg-base] flex items-center justify-center p-4">
      <div className="modal-content max-w-sm w-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[--danger]/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-[--danger]" />
        </div>
        <h2 className="text-display-md text-[--text-primary] mb-2">
          Error al cargar
        </h2>
        <p className="text-sm text-[--text-muted] mb-6">
          No se pudo cargar la informacion del empleado.
        </p>
        <Button onClick={() => router.push("/directorio")} className="w-full">
          Volver al directorio
        </Button>
      </div>
    </div>
  );
}

export default function EmployeeDetailPage({ params }: Props) {
  const { id } = use(params);

  return (
    <EmployeeDetailErrorBoundary fallback={<ErrorFallback />}>
      <EmployeeDetailContent id={id} />
    </EmployeeDetailErrorBoundary>
  );
}
