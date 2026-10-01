"use client";

import { use, useState, Component, ReactNode } from "react";
import { motion } from "framer-motion";
import { notFound, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Phone,
  Copy,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  MapPin,
  Star,
  ClipboardList,
  Inbox,
  Download,
  Share2,
} from "lucide-react";
import {
  getEmployeeById,
  getCompanyById,
} from "@/lib/data";
import { getCompanyConfig } from "@/lib/companyConfig";
import { useFavorites } from "@/lib/useFavorites";
import { haptics } from "@/lib/haptics";
import { getInitials } from "@/lib/utils";
import { downloadVCard, getVCardDisplayName } from "@/lib/vcard";

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
    console.error("Employee detail error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function EmployeeDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyAllState, setCopyAllState] = useState<'idle' | 'copied'>('idle');
  const { isFavorite, toggleFavorite } = useFavorites();

  const employee = getEmployeeById(id);
  if (!employee) {
    notFound();
  }

  const isEmployeeFavorite = isFavorite(employee.id);
  const company = getCompanyById(employee.company);
  const config = getCompanyConfig(employee.company);

  const handleClose = () => {
    haptics.soft();
    router.push("/directorio");
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      haptics.light();
      setCopiedField(field);
      toast.success("Copiado al portapapeles");
      setTimeout(() => setCopiedField(null), 800);
    } catch {
      toast.error("Error al copiar");
    }
  };

  const copyAllInfo = async () => {
    const lines: string[] = [];
    lines.push(`*${employee.name}*`);
    if (employee.position && employee.department) {
      lines.push(`${employee.position} — ${employee.department}`);
    } else if (employee.position) {
      lines.push(employee.position);
    }
    if (company?.name) {
      lines.push(company.name);
    }
    if (employee.location) {
      lines.push(`📍 ${employee.location}`);
    }
    if (employee.phone || employee.extension) {
      const phonePart = employee.phone || '';
      const extPart = employee.extension ? `  Ext. ${employee.extension}` : '';
      lines.push(`📞 ${phonePart}${extPart}`);
    }
    if (employee.email) {
      lines.push(`✉️ ${employee.email}`);
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      haptics.double();
      setCopyAllState('copied');
      toast.success("Todo copiado al portapapeles");
      setTimeout(() => setCopyAllState('idle'), 1000);
    } catch {
      toast.error("Error al copiar");
    }
  };

  const handleToggleFavorite = () => {
    haptics.success();
    toggleFavorite(employee.id);
  };

  const openTeamsChat = () => {
    if (employee.email) {
      window.open(`https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`, "_blank");
    }
  };

  const handleSaveContact = () => {
    haptics.light();
    downloadVCard(employee, company);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/directorio/${employee.id}`;
    const title = `${getVCardDisplayName(employee)} — ${employee.position}`;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        haptics.light();
      } catch {
        // User cancelled the native share sheet - no error to surface.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      haptics.light();
      toast.success("Link copiado");
    } catch {
      toast.error("Error al copiar el link");
    }
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 12 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97 },
  };

  const mobileModalVariants = {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" },
  };

  // CSS custom properties for company colors
  const companyVars = {
    '--company-primary': config.primary,
    '--company-secondary': config.secondary,
    '--company-glow': config.glow,
    '--company-highlight': config.highlight,
  } as React.CSSProperties;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        transition={{ duration: 0.13 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(20px)' }}
      />

      {/* Desktop Modal */}
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="relative hidden md:block overflow-hidden z-10"
        style={{
          ...companyVars,
          width: 'min(520px, 94vw)',
          borderRadius: '20px',
          background: '#0C0E11',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: `0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px ${config.primary}33`,
        }}
      >
        {/* Top border accent */}
        <div 
          className="h-[3px] w-full" 
          style={{ backgroundColor: config.primary }} 
        />

        {/* Header Band */}
        <div 
          className="relative overflow-hidden"
          style={{
            height: '160px',
            background: `linear-gradient(135deg, ${config.secondary} 0%, color-mix(in srgb, ${config.primary} 40%, #0C0E11) 100%)`,
          }}
        >
          {/* Company watermark */}
          <div 
            className="absolute pointer-events-none select-none"
            style={{ 
              right: '-10px',
              top: '-20px',
              fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
              fontSize: '160px',
              fontWeight: 900,
              opacity: 0.08,
              color: config.primary,
              lineHeight: 1,
              zIndex: 0,
            }}
          >
            {config.initial}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all duration-150 z-10"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.5)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.3)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            <X className="w-[13px] h-[13px]" />
          </button>

          {/* Header Content */}
          <div className="relative z-[1] px-7 pt-7 pb-6 flex flex-col items-center text-center">
            {/* Avatar */}
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${config.secondary}, ${config.primary})`,
                border: `2.5px solid ${config.primary}`,
                boxShadow: `0 0 24px ${config.glow}, 0 0 48px ${config.glow}50`,
              }}
            >
              <span 
                className="text-white font-bold"
                style={{ 
                  fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
                  fontSize: 'var(--font-2xl)',
                }}
              >
                {getInitials(employee.name) ?? (
                  <Inbox className="w-8 h-8" aria-label="Sin nombre asignado" />
                )}
              </span>
            </div>

            {/* Name */}
            <h2 
              className="text-white font-bold mt-4"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'var(--font-xl)',
                fontWeight: 700,
              }}
            >
              {employee.name}
            </h2>

            {/* Position */}
            <p 
              className="italic mt-1"
              style={{ 
                color: config.primary,
                fontSize: 'var(--font-base)',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {employee.position}
            </p>

            {/* Company badge */}
            <span 
              className="mt-2"
              style={{
                background: `color-mix(in srgb, ${config.primary} 18%, transparent)`,
                border: `1px solid color-mix(in srgb, ${config.primary} 45%, transparent)`,
                color: config.highlight,
                fontSize: 'var(--font-xs)',
                fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                padding: '3px 10px',
                borderRadius: '20px',
              }}
            >
              {company?.shortName || company?.name}
            </span>
          </div>
        </div>

        {/* Body Section - Info Grid */}
        <div className="px-7 py-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {/* Departamento */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: 'var(--font-xs)', 
                  color: 'rgba(255,255,255,0.27)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Departamento
              </p>
              <p style={{ fontSize: 'var(--font-base)', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.department || "—"}
              </p>
            </div>

            {/* Empresa */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: 'var(--font-xs)', 
                  color: 'rgba(255,255,255,0.27)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Empresa
              </p>
              <p style={{ fontSize: 'var(--font-base)', color: '#FFFFFF', fontWeight: 500 }}>
                {company?.name || "—"}
              </p>
            </div>

            {/* Telefono */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: 'var(--font-xs)', 
                  color: 'rgba(255,255,255,0.27)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Telefono
              </p>
              <p style={{ fontSize: 'var(--font-base)', color: '#FFFFFF', fontWeight: 500 }}>
                {employee.phone || "—"}
              </p>
            </div>

            {/* Extension */}
            <div className="pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: 'var(--font-xs)', 
                  color: 'rgba(255,255,255,0.27)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Extension
              </p>
              {employee.extension && employee.extension !== "—" ? (
                <p style={{ fontSize: 'var(--font-base)', color: '#FFFFFF', fontWeight: 500 }}>
                  {employee.extension}
                </p>
              ) : (
                <span 
                  style={{ 
                    fontSize: 'var(--font-sm)', 
                    color: 'rgba(255,255,255,0.3)',
                    padding: '2px 8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                  }}
                >
                  Sin extension
                </span>
              )}
            </div>

            {/* Sucursal - spans both columns */}
            <div className="col-span-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: 'var(--font-xs)', 
                  color: 'rgba(255,255,255,0.27)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Sucursal
              </p>
              {employee.location ? (
                <span 
                  className="inline-flex items-center gap-1.5"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: 'var(--font-sm)',
                    color: 'white',
                  }}
                >
                  <MapPin className="w-3 h-3" style={{ color: config.primary }} />
                  {employee.location}
                </span>
              ) : (
                <span style={{ fontSize: 'var(--font-sm)', color: 'rgba(255,255,255,0.4)' }}>
                  Sin sucursal
                </span>
              )}
            </div>

            {/* Email - spans both columns */}
            <div className="col-span-2 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p 
                className="mb-1"
                style={{ 
                  fontSize: 'var(--font-xs)', 
                  color: 'rgba(255,255,255,0.27)', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Email
              </p>
              <p style={{ fontSize: 'var(--font-base)', color: '#FFFFFF', fontWeight: 500, wordBreak: 'break-all' }}>
                {employee.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div 
          className="px-7 py-4 flex flex-col gap-3"
          style={{
            background: 'rgba(255,255,255,0.015)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: '20px',
          }}
        >
        <div className="flex gap-3">
          {/* Copy Email */}
          <button
            onClick={() => employee.email && copyToClipboard(employee.email, 'email')}
            className="flex-1 rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-[180ms]"
            style={{
              height: '38px',
              background: copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.04)',
              border: `1px solid ${copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.08)'}`,
              color: copiedField === 'email' ? 'white' : 'rgba(255,255,255,0.44)',
              fontSize: 'var(--font-sm)',
              boxShadow: copiedField === 'email' ? `0 0 12px ${config.glow}` : 'none',
            }}
            onMouseEnter={(e) => {
              if (copiedField !== 'email') {
                e.currentTarget.style.background = `color-mix(in srgb, ${config.primary} 15%, transparent)`;
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${config.primary} 50%, transparent)`;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = `0 0 12px ${config.glow}`;
              }
            }}
            onMouseLeave={(e) => {
              if (copiedField !== 'email') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.44)';
                e.currentTarget.style.boxShadow = 'none';
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
            className="flex-1 rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-[180ms]"
            style={{
              height: '38px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.44)',
              fontSize: 'var(--font-sm)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `color-mix(in srgb, ${config.primary} 15%, transparent)`;
              e.currentTarget.style.borderColor = `color-mix(in srgb, ${config.primary} 50%, transparent)`;
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.boxShadow = `0 0 12px ${config.glow}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.44)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Teams</span>
          </button>

          {/* Copy Phone */}
          <button
            onClick={() => employee.phone && copyToClipboard(employee.phone, 'phone')}
            className="flex-1 rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-[180ms]"
            style={{
              height: '38px',
              background: copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.04)',
              border: `1px solid ${copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.08)'}`,
              color: copiedField === 'phone' ? 'white' : 'rgba(255,255,255,0.44)',
              fontSize: 'var(--font-sm)',
              boxShadow: copiedField === 'phone' ? `0 0 12px ${config.glow}` : 'none',
            }}
            onMouseEnter={(e) => {
              if (copiedField !== 'phone') {
                e.currentTarget.style.background = `color-mix(in srgb, ${config.primary} 15%, transparent)`;
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${config.primary} 50%, transparent)`;
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.boxShadow = `0 0 12px ${config.glow}`;
              }
            }}
            onMouseLeave={(e) => {
              if (copiedField !== 'phone') {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.44)';
                e.currentTarget.style.boxShadow = 'none';
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

          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            className="flex-1 rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-[180ms]"
            style={{
              height: '38px',
              background: isEmployeeFavorite ? 'rgba(245,196,0,0.15)' : 'rgba(255,255,255,0.04)',
              border: isEmployeeFavorite ? '1px solid rgba(245,196,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: isEmployeeFavorite ? '#F5C400' : 'rgba(255,255,255,0.44)',
              fontSize: 'var(--font-sm)',
            }}
          >
            <Star className={`w-3.5 h-3.5 ${isEmployeeFavorite ? 'fill-[#F5C400]' : ''}`} />
            <span>{isEmployeeFavorite ? 'Guardado' : 'Favorito'}</span>
          </button>

          {/* Copy All */}
          <button
            onClick={copyAllInfo}
            className="flex-1 rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-[180ms]"
            style={{
              height: '38px',
              background: copyAllState === 'copied' ? '#00C9A7' : 'rgba(255,255,255,0.04)',
              border: copyAllState === 'copied' ? '1px solid #00C9A7' : '1px solid rgba(255,255,255,0.08)',
              color: copyAllState === 'copied' ? 'white' : 'rgba(255,255,255,0.44)',
              fontSize: 'var(--font-sm)',
            }}
          >
            {copyAllState === 'copied' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Copiar todo</span>
              </>
            )}
          </button>
        </div>

          <div className="flex gap-3 items-start">
            <div className="flex-1 flex gap-3">
              {/* Save Contact (vCard) */}
              <button
                onClick={handleSaveContact}
                className="flex-1 rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-[180ms]"
                style={{
                  height: '38px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.44)',
                  fontSize: 'var(--font-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `color-mix(in srgb, ${config.primary} 15%, transparent)`;
                  e.currentTarget.style.borderColor = `color-mix(in srgb, ${config.primary} 50%, transparent)`;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.boxShadow = `0 0 12px ${config.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.44)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Guardar contacto</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex-1 rounded-[10px] flex items-center justify-center gap-1.5 transition-all duration-[180ms]"
                style={{
                  height: '38px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.44)',
                  fontSize: 'var(--font-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `color-mix(in srgb, ${config.primary} 15%, transparent)`;
                  e.currentTarget.style.borderColor = `color-mix(in srgb, ${config.primary} 50%, transparent)`;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.boxShadow = `0 0 12px ${config.glow}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.44)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Modal - Bottom Sheet */}
      <motion.div
        variants={mobileModalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ 
          type: "spring", 
          damping: 28, 
          stiffness: 320,
          mass: 0.8,
        }}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          if (info.offset.y > 80 || info.velocity.y > 500) handleClose();
        }}
        className="relative md:hidden w-full z-10 flex flex-col"
        style={{
          ...companyVars,
          maxHeight: 'calc(100dvh - 40px)',
          borderRadius: '20px 20px 0 0',
          background: '#0C0E11',
          border: '1px solid rgba(255,255,255,0.07)',
          borderBottom: 'none',
          boxShadow: `0 -32px 80px rgba(0,0,0,0.7)`,
        }}
      >
        {/* Top border accent */}
        <div 
          className="h-[3px] w-full shrink-0" 
          style={{ backgroundColor: config.primary }} 
        />

        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div 
            className="rounded-full"
            style={{ 
              width: '36px', 
              height: '4px', 
              background: 'rgba(255,255,255,0.18)' 
            }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-[28px] h-[28px] rounded-full flex items-center justify-center z-10"
          style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          <X className="w-[12px] h-[12px]" />
        </button>

        {/* Compact Header Band - Fixed */}
        <div 
          className="relative overflow-hidden shrink-0"
          style={{
            background: `linear-gradient(135deg, ${config.secondary} 0%, color-mix(in srgb, ${config.primary} 40%, #0C0E11) 100%)`,
          }}
        >
          {/* Company watermark */}
          <div 
            className="absolute pointer-events-none select-none"
            style={{ 
              right: '-10px',
              top: '-10px',
              fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
              fontSize: '80px',
              fontWeight: 900,
              opacity: 0.06,
              color: config.primary,
              lineHeight: 1,
              zIndex: 0,
            }}
          >
            {config.initial}
          </div>

          {/* Compact Header Content - Horizontal Layout */}
          <div className="relative z-[1] px-4 py-3 flex items-center gap-3">
            {/* Avatar - Smaller */}
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ 
                background: `linear-gradient(135deg, ${config.secondary}, ${config.primary})`,
                border: `2px solid ${config.primary}`,
                boxShadow: `0 0 16px ${config.glow}`,
              }}
            >
              <span 
                className="text-white font-bold"
                style={{ 
                  fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
                  fontSize: 'var(--font-base)',
                }}
              >
                {getInitials(employee.name) ?? (
                  <Inbox className="w-5 h-5" aria-label="Sin nombre asignado" />
                )}
              </span>
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-0">
              <h2 
                className="text-white font-bold truncate"
                style={{ 
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 'var(--font-base)',
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {employee.name}
              </h2>
              <p 
                className="italic truncate"
                style={{ 
                  color: config.highlight || config.primary,
                  fontSize: 'var(--font-sm)',
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.3,
                }}
              >
                {employee.position}
              </p>
              {/* Company badge inline */}
              <span 
                className="inline-block mt-1"
                style={{
                  background: `color-mix(in srgb, ${config.primary} 18%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${config.primary} 45%, transparent)`,
                  color: config.highlight,
                  fontSize: '10px',
                  fontFamily: "var(--font-neuropol), var(--font-orbitron), 'Orbitron', 'Courier New', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: '12px',
                }}
              >
                {company?.shortName || company?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Body Section - Compact Info Grid */}
          <div className="px-4 py-3">
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {/* Departamento */}
              <div className="pb-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p 
                  style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.27)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '2px',
                  }}
                >
                  Departamento
                </p>
                <p style={{ fontSize: 'var(--font-sm)', color: '#FFFFFF', fontWeight: 500, lineHeight: 1.2 }}>
                  {employee.department || "—"}
                </p>
              </div>

              {/* Empresa */}
              <div className="pb-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p 
                  style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.27)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '2px',
                  }}
                >
                  Empresa
                </p>
                <p style={{ fontSize: 'var(--font-sm)', color: '#FFFFFF', fontWeight: 500, lineHeight: 1.2 }}>
                  {company?.shortName || "—"}
                </p>
              </div>

              {/* Telefono */}
              <div className="pb-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p 
                  style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.27)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '2px',
                  }}
                >
                  Telefono
                </p>
                <p style={{ fontSize: 'var(--font-sm)', color: '#FFFFFF', fontWeight: 500, lineHeight: 1.2 }}>
                  {employee.phone || "—"}
                </p>
              </div>

              {/* Extension */}
              <div className="pb-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p 
                  style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.27)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '2px',
                  }}
                >
                  Extension
                </p>
                {employee.extension && employee.extension !== "—" ? (
                  <p style={{ fontSize: 'var(--font-sm)', color: '#FFFFFF', fontWeight: 500, lineHeight: 1.2 }}>
                    {employee.extension}
                  </p>
                ) : (
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                    Sin ext.
                  </span>
                )}
              </div>

              {/* Email - spans both columns */}
              <div className="col-span-2 pb-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p 
                  style={{ 
                    fontSize: '10px', 
                    color: 'rgba(255,255,255,0.27)', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '2px',
                  }}
                >
                  Email
                </p>
                <p style={{ fontSize: 'var(--font-sm)', color: '#FFFFFF', fontWeight: 500, wordBreak: 'break-all', lineHeight: 1.2 }}>
                  {employee.email || "—"}
                </p>
              </div>

              {/* Sucursal - spans both columns */}
              {employee.location && (
                <div className="col-span-2 pb-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <p 
                    style={{ 
                      fontSize: '10px', 
                      color: 'rgba(255,255,255,0.27)', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '2px',
                    }}
                  >
                    Sucursal
                  </p>
                  <span 
                    className="inline-flex items-center gap-1"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '12px',
                      padding: '2px 8px',
                      fontSize: 'var(--font-xs)',
                      color: 'white',
                    }}
                  >
                    <MapPin className="w-2.5 h-2.5" style={{ color: config.primary }} />
                    {employee.location}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Row - Compact 2-column grid - Fixed at bottom */}
        <div 
          className="px-4 py-3 shrink-0"
          style={{
            background: 'rgba(255,255,255,0.015)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            {/* Copy Email */}
            <button
              onClick={() => employee.email && copyToClipboard(employee.email, 'email')}
              className="rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '38px',
                background: copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.04)',
                border: `1px solid ${copiedField === 'email' ? config.primary : 'rgba(255,255,255,0.08)'}`,
                color: copiedField === 'email' ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
              }}
            >
              {copiedField === 'email' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === 'email' ? 'Copiado' : 'Email'}</span>
            </button>

            {/* Teams */}
            <button
              onClick={openTeamsChat}
              className="rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '38px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
              }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Teams</span>
            </button>

            {/* Copy Phone */}
            <button
              onClick={() => employee.phone && copyToClipboard(employee.phone, 'phone')}
              className="rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '38px',
                background: copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.04)',
                border: `1px solid ${copiedField === 'phone' ? config.primary : 'rgba(255,255,255,0.08)'}`,
                color: copiedField === 'phone' ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
              }}
            >
              {copiedField === 'phone' ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Phone className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === 'phone' ? 'Copiado' : 'Telefono'}</span>
            </button>

            {/* Favorite */}
            <button
              onClick={handleToggleFavorite}
              className="rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '38px',
                background: isEmployeeFavorite ? 'rgba(245,196,0,0.15)' : 'rgba(255,255,255,0.04)',
                border: isEmployeeFavorite ? '1px solid rgba(245,196,0,0.4)' : '1px solid rgba(255,255,255,0.08)',
                color: isEmployeeFavorite ? '#F5C400' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
              }}
            >
              <Star className={`w-3.5 h-3.5 ${isEmployeeFavorite ? 'fill-[#F5C400]' : ''}`} />
              <span>{isEmployeeFavorite ? 'Guardado' : 'Favorito'}</span>
            </button>

            {/* Save Contact (vCard) */}
            <button
              onClick={handleSaveContact}
              className="rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '38px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Contacto</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '38px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
                fontSize: '12px',
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir</span>
            </button>

            {/* Copy All - Full width */}
            <button
              onClick={copyAllInfo}
              className="col-span-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
              style={{
                height: '38px',
                background: copyAllState === 'copied' ? '#00C9A7' : 'rgba(255,255,255,0.04)',
                border: copyAllState === 'copied' ? '1px solid #00C9A7' : '1px solid rgba(255,255,255,0.08)',
                color: copyAllState === 'copied' ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: '12px',
              }}
            >
              {copyAllState === 'copied' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <ClipboardList className="w-3.5 h-3.5" />
                  <span>Copiar todo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ErrorFallback() {
  const router = useRouter();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card p-6 rounded-xl max-w-md mx-4 text-center border border-border">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-lg font-semibold mb-2">Error al cargar</h2>
        <p className="text-muted-foreground mb-4">
          No se pudo cargar la informacion del empleado.
        </p>
        <button 
          onClick={() => router.push("/directorio")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Volver al directorio
        </button>
      </div>
    </div>
  );
}

export default function EmployeeDetailPage({ params }: Props) {
  const resolvedParams = use(params);
  
  return (
    <EmployeeDetailErrorBoundary fallback={<ErrorFallback />}>
      <EmployeeDetailContent id={resolvedParams.id} />
    </EmployeeDetailErrorBoundary>
  );
}
