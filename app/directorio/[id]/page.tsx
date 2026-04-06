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
  
  const companyColors = {
    "comercializadora-shuma": {
      primary: "#0047AB",
      secondary: "#002D6E"
    },
    "acabados-shuma": {
      primary: "#C0152A",
      secondary: "#8B0000"
    },
    "ferrecapital": {
      primary: "#4A525A",
      secondary: "#1A1A1A"
    },
    "arkiramica": {
      primary: "#F5C400",
      secondary: "#C49A00"
    }
  };

  const colors = companyColors[employee.company as keyof typeof companyColors] || {
    primary: "var(--irid-a)",
    secondary: "var(--irid-b)"
  };

  const handleClose = () => {
    router.push("/directorio");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-bg-base/93 backdrop-blur-md"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) handleClose();
        }}
        className="relative w-full max-w-[680px] bg-bg-surface rounded-t-[24px] sm:rounded-[24px] overflow-hidden shadow-2xl z-10"
      >
        {/* Top accent line */}
        <div 
          className="h-[3px] w-full" 
          style={{ backgroundColor: colors.primary }} 
        />

        {/* Mobile drag handle */}
        <div className="flex justify-center py-3 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-border-subtle" />
        </div>

        {/* Close button desktop */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 hidden sm:flex p-2 rounded-full hover:bg-bg-elevated transition-colors text-text-muted hover:text-text-primary"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            {/* Monogram */}
            <div 
              className="w-24 h-24 sm:w-[120px] sm:h-[120px] rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-white shrink-0"
              style={{ 
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` 
              }}
            >
              {employee.name ? employee.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() : "??"}
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="font-neuropol text-2xl sm:text-3xl text-text-primary mb-2 truncate font-neuropol">
                {employee.name || "—"}
              </h2>
              <p className="font-dm-sans italic text-lg text-text-muted mb-4">
                {employee.position || "—"}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div className="space-y-1">
                  <p className="text-text-faint uppercase tracking-wider text-[10px] font-neuropol font-neuropol">Empresa</p>
                  <p className="text-text-primary font-dm-sans">{company?.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-faint uppercase tracking-wider text-[10px] font-neuropol font-neuropol">Departamento</p>
                  <p className="text-text-primary font-dm-sans">{employee.department || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-faint uppercase tracking-wider text-[10px] font-neuropol font-neuropol">Teléfono</p>
                  <p className="text-text-primary font-dm-sans">{employee.phone || "—"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-text-faint uppercase tracking-wider text-[10px] font-neuropol font-neuropol">Email</p>
                  <p className="text-text-primary font-dm-sans break-all">{employee.email || "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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
