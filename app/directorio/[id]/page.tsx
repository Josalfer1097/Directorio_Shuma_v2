"use client";

import { use, useState, Component, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Copy,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getEmployeeById,
  getCompanyById,
} from "@/lib/data";

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

// Company color config
const companyConfigMap: Record<string, { primary: string; secondary: string; glow: string; initial: string }> = {
  comercializadora: { primary: '#0047AB', secondary: '#002D6E', glow: 'rgba(0,71,171,0.25)', initial: 'C' },
  acabados: { primary: '#C0152A', secondary: '#8B0000', glow: 'rgba(192,21,42,0.25)', initial: 'A' },
  ferrecapital: { primary: '#2C3338', secondary: '#1A1E21', glow: 'rgba(44,51,56,0.35)', initial: 'F' },
  arkiramica: { primary: '#F5C400', secondary: '#C49A00', glow: 'rgba(245,196,0,0.22)', initial: 'Ar' },
};

function EmployeeDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const employee = getEmployeeById(id);
  if (!employee) {
    notFound();
  }

  const company = getCompanyById(employee.company);
  const config = companyConfigMap[employee.company] || {
    primary: '#C9A84C',
    secondary: '#A68A3A',
    glow: 'rgba(201,168,76,0.25)',
    initial: 'S'
  };

  const handleClose = () => {
    router.push("/directorio");
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopiedField(null), 800);
    } catch {
      toast.error("Error al copiar");
    }
  };

  const openTeamsChat = () => {
    if (employee.email) {
      window.open(`https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`, "_blank");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96 },
  };

  const mobileModalVariants = {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.12 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[16px]"
      />

      {/* Desktop Modal */}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden md:block w-full max-w-[520px] overflow-hidden z-10"
        style={{
          borderRadius: '16px',
          background: '#0F1114',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Top accent line */}
        <div 
          className="h-[3px] w-full" 
          style={{ backgroundColor: config.primary }} 
        />

        {/* Header Section */}
        <div 
          className="relative px-6 pt-6 pb-5 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${config.secondary}15 0%, ${config.primary}12 100%)`,
          }}
        >
          {/* Company watermark */}
          <div 
            className="absolute -top-4 -right-2 pointer-events-none select-none"
            style={{ 
              fontFamily: "'Neuropol', sans-serif",
              fontSize: '120px',
              fontWeight: 700,
              opacity: 0.06,
              color: config.primary,
              lineHeight: 1,
            }}
          >
            {config.initial}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
            style={{
              background: 'rgba(255,255,255,0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            <X className="w-3.5 h-3.5 text-white/70" />
          </button>

          {/* Avatar + Info */}
          <div className="flex items-start gap-5 relative z-10">
            {/* Avatar */}
            <div 
              className="w-[72px] h-[72px] rounded-full flex items-center justify-center shrink-0"
              style={{ 
                background: `linear-gradient(135deg, ${config.secondary}, ${config.primary})`,
                border: `2px solid ${config.primary}`,
                boxShadow: `0 0 20px ${config.glow}`,
              }}
            >
              <span 
                className="text-white font-bold"
                style={{ 
                  fontFamily: "'Neuropol', sans-serif",
                  fontSize: '1.5rem',
                }}
              >
                {getInitials(employee.name)}
              </span>
            </div>

            {/* Name + Position + Badge */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 
                  className="text-white font-bold leading-tight"
                  style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '1.25rem',
                  }}
                >
                  {employee.name}
                </h2>
                <span 
                  className="shrink-0"
                  style={{
                    background: `${config.primary}15`,
                    border: `1px solid ${config.primary}59`,
                    color: config.primary,
                    fontSize: '0.7rem',
                    fontFamily: "'Neuropol', sans-serif",
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                  }}
                >
                  {company?.shortName || company?.name}
                </span>
              </div>
              <p 
                className="mt-1 italic"
                style={{ 
                  color: config.primary,
                  fontSize: '0.875rem',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {employee.position}
              </p>
            </div>
          </div>
        </div>

        {/* Body Section - Info Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Departamento */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.65rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Departamento
              </p>
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.department || "—"}
              </p>
            </div>

            {/* Empresa */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.65rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Empresa
              </p>
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>
                {company?.name || "—"}
              </p>
            </div>

            {/* Telefono */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.65rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Telefono
              </p>
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.phone || "—"}
              </p>
            </div>

            {/* Extension */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.65rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Extension
              </p>
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.extension || "—"}
              </p>
            </div>

            {/* Email - spans both columns */}
            <div className="col-span-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.65rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Email
              </p>
              <p style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 500, wordBreak: 'break-all' }}>
                {employee.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div 
          className="px-6 py-4 flex gap-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Copy Email */}
          <button
            onClick={() => employee.email && copyToClipboard(employee.email, 'email')}
            className="flex-1 h-9 rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.05)',
              border: `1px solid ${copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.10)'}`,
              color: copiedField === 'email' ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
            }}
            onMouseEnter={(e) => {
              if (copiedField !== 'email') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.borderColor = `${config.primary}66`;
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (copiedField !== 'email') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }
            }}
          >
            {copiedField === 'email' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar email</span>
              </>
            )}
          </button>

          {/* Teams */}
          <button
            onClick={openTeamsChat}
            className="flex-1 h-9 rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.borderColor = `${config.primary}66`;
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
            }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Teams</span>
          </button>

          {/* Copy Phone */}
          <button
            onClick={() => employee.phone && copyToClipboard(employee.phone, 'phone')}
            className="flex-1 h-9 rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.05)',
              border: `1px solid ${copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.10)'}`,
              color: copiedField === 'phone' ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '0.8rem',
            }}
            onMouseEnter={(e) => {
              if (copiedField !== 'phone') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.borderColor = `${config.primary}66`;
                e.currentTarget.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              if (copiedField !== 'phone') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }
            }}
          >
            {copiedField === 'phone' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Phone className="w-3.5 h-3.5" />
                <span>Copiar tel</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Mobile Modal - Bottom Sheet */}
      <motion.div
        variants={mobileModalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", damping: 30, stiffness: 400, duration: 0.2 }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 100) handleClose();
        }}
        className="relative md:hidden w-[92vw] overflow-hidden z-10"
        style={{
          borderRadius: '20px 20px 0 0',
          background: '#0F1114',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          boxShadow: '0 -24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Top accent line */}
        <div 
          className="h-[3px] w-full" 
          style={{ backgroundColor: config.primary }} 
        />

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div 
            className="w-8 h-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.08)',
          }}
        >
          <X className="w-3.5 h-3.5 text-white/70" />
        </button>

        {/* Header Section */}
        <div 
          className="relative px-5 pt-3 pb-4 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${config.secondary}15 0%, ${config.primary}12 100%)`,
          }}
        >
          {/* Company watermark */}
          <div 
            className="absolute -top-4 -right-2 pointer-events-none select-none"
            style={{ 
              fontFamily: "'Neuropol', sans-serif",
              fontSize: '100px',
              fontWeight: 700,
              opacity: 0.06,
              color: config.primary,
              lineHeight: 1,
            }}
          >
            {config.initial}
          </div>

          {/* Avatar + Info */}
          <div className="flex items-start gap-4 relative z-10">
            {/* Avatar */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
              style={{ 
                background: `linear-gradient(135deg, ${config.secondary}, ${config.primary})`,
                border: `2px solid ${config.primary}`,
                boxShadow: `0 0 20px ${config.glow}`,
              }}
            >
              <span 
                className="text-white font-bold"
                style={{ 
                  fontFamily: "'Neuropol', sans-serif",
                  fontSize: '1.25rem',
                }}
              >
                {getInitials(employee.name)}
              </span>
            </div>

            {/* Name + Position + Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 
                  className="text-white font-bold leading-tight"
                  style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '1.1rem',
                  }}
                >
                  {employee.name}
                </h2>
              </div>
              <span 
                className="inline-block mt-1"
                style={{
                  background: `${config.primary}15`,
                  border: `1px solid ${config.primary}59`,
                  color: config.primary,
                  fontSize: '0.65rem',
                  fontFamily: "'Neuropol', sans-serif",
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                }}
              >
                {company?.shortName || company?.name}
              </span>
              <p 
                className="mt-1 italic"
                style={{ 
                  color: config.primary,
                  fontSize: '0.8rem',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {employee.position}
              </p>
            </div>
          </div>
        </div>

        {/* Body Section - Info Grid */}
        <div className="p-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Departamento */}
            <div className="pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.6rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Departamento
              </p>
              <p style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.department || "—"}
              </p>
            </div>

            {/* Empresa */}
            <div className="pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.6rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Empresa
              </p>
              <p style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 500 }}>
                {company?.shortName || "—"}
              </p>
            </div>

            {/* Telefono */}
            <div className="pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.6rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Telefono
              </p>
              <p style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.phone || "—"}
              </p>
            </div>

            {/* Extension */}
            <div className="pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.6rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Extension
              </p>
              <p style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.extension || "—"}
              </p>
            </div>

            {/* Email - spans both columns */}
            <div className="col-span-2 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: '0.6rem', 
                  color: 'rgba(255,255,255,0.5)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Email
              </p>
              <p style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 500, wordBreak: 'break-all' }}>
                {employee.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Row - Stacked on mobile */}
        <div 
          className="px-5 py-4 flex flex-col gap-2"
          style={{
            background: 'rgba(255,255,255,0.02)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Copy Email */}
          <button
            onClick={() => employee.email && copyToClipboard(employee.email, 'email')}
            className="w-full h-11 rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.05)',
              border: `1px solid ${copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.10)'}`,
              color: copiedField === 'email' ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
            }}
          >
            {copiedField === 'email' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar email</span>
              </>
            )}
          </button>

          {/* Teams */}
          <button
            onClick={openTeamsChat}
            className="w-full h-11 rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enviar mensaje en Teams</span>
          </button>

          {/* Copy Phone */}
          <button
            onClick={() => employee.phone && copyToClipboard(employee.phone, 'phone')}
            className="w-full h-11 rounded-lg flex items-center justify-center gap-2 transition-all duration-150"
            style={{
              background: copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.05)',
              border: `1px solid ${copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.10)'}`,
              color: copiedField === 'phone' ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
            }}
          >
            {copiedField === 'phone' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                <span>Copiar telefono</span>
              </>
            )}
          </button>
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
      <div className="max-w-sm w-full p-6 text-center rounded-2xl" style={{ background: '#0F1114', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Error al cargar
        </h2>
        <p className="text-sm text-white/60 mb-6">
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
