"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Copy, Check, MessageSquare } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Employee, Company } from "@/types";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: Employee;
  company: Company;
  view: "grid" | "list";
  index: number;
}

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

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

// Get company initial for watermark
const getCompanyInitial = (companyId: string) => {
  const initials: Record<string, string> = {
    "comercializadora-shuma": "C",
    "acabados-shuma": "A",
    ferrecapital: "F",
    arkiramica: "K",
  };
  return initials[companyId] || "S";
};

// Format phone number for display
const formatPhone = (phone?: string) => {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return phone;
};

// Truncate email for display
const truncateEmail = (email?: string, maxLength = 20) => {
  if (!email) return "—";
  if (email.length <= maxLength) return email;
  const [user, domain] = email.split("@");
  if (!domain) return email.slice(0, maxLength) + "...";
  const truncatedUser = user.slice(
    0,
    Math.max(6, maxLength - domain.length - 4)
  );
  return `${truncatedUser}...@${domain}`;
};

export function EmployeeCard({
  employee,
  company,
  view,
  index,
}: EmployeeCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const getInitials = (name?: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const copyToClipboard = (
    e: React.MouseEvent,
    text: string | undefined,
    field: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles", { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openTeamsChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!employee.email) return;
    window.open(
      `https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`,
      "_blank"
    );
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!employee.email) return;
    window.location.href = `mailto:${employee.email}`;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!employee.phone) return;
    window.location.href = `tel:${employee.phone}`;
  };

  const primaryColor = company?.colors?.primary || "#C9A84C";

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18, delay: index * 0.035, ease: premiumEase }}
      >
        <Link href={`/directorio/${employee.id}`}>
          <div
            className="employee-card group flex items-center gap-4 p-4"
            style={
              { "--card-color": primaryColor } as React.CSSProperties
            }
          >
            {/* Monogram */}
            <div
              className={cn("monogram monogram-md", getMonogramClass(employee.company))}
            >
              {getInitials(employee.name)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-display-md text-[--text-primary] truncate">
                  {employee.name || "Sin nombre"}
                </h3>
                <span
                  className="text-display-xs px-2 py-0.5 rounded shrink-0"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                  }}
                >
                  {company?.shortName || company?.name || "—"}
                </span>
              </div>
              <p className="text-sm text-[--text-muted] truncate">
                <span className="italic">{employee.position || "—"}</span>
                {" · "}
                <span className="text-display-xs not-italic">
                  {employee.department || "—"}
                </span>
              </p>
            </div>

            {/* Contact info for list view */}
            <div className="hidden md:flex items-center gap-4 text-xs">
              <TooltipProvider>
                {/* Email */}
                {employee.email && (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={handleEmailClick}
                          className="flex items-center gap-1 text-[--text-muted] hover:text-[--text-primary] transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="hidden lg:inline max-w-28 truncate">
                            {truncateEmail(employee.email)}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{employee.email}</TooltipContent>
                    </Tooltip>
                    <button
                      onClick={(e) =>
                        copyToClipboard(e, employee.email, "email-list")
                      }
                      className="p-1 rounded hover:bg-[--bg-elevated] transition-colors"
                    >
                      {copiedField === "email-list" ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-[--text-faint]" />
                      )}
                    </button>
                    <button
                      onClick={openTeamsChat}
                      className="p-1 rounded hover:bg-[--bg-elevated] transition-colors"
                      title="Abrir chat en Teams"
                    >
                      <MessageSquare className="w-3 h-3 text-[--text-faint] hover:text-[#6264A7]" />
                    </button>
                  </div>
                )}

                {/* Phone */}
                {employee.phone && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePhoneClick}
                      className="flex items-center gap-1 text-[--text-muted] hover:text-[--text-primary] transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="hidden lg:inline">
                        {formatPhone(employee.phone)}
                      </span>
                    </button>
                    {employee.extension && (
                      <span className="px-1.5 py-0.5 rounded bg-[--bg-elevated] text-[10px] font-medium text-[--text-muted]">
                        Ext. {employee.extension}
                      </span>
                    )}
                    <button
                      onClick={(e) =>
                        copyToClipboard(e, employee.phone, "phone-list")
                      }
                      className="p-1 rounded hover:bg-[--bg-elevated] transition-colors"
                    >
                      {copiedField === "phone-list" ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-[--text-faint]" />
                      )}
                    </button>
                  </div>
                )}
              </TooltipProvider>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view - premium card with company color accent
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, delay: index * 0.035, ease: premiumEase }}
    >
      <Link href={`/directorio/${employee.id}`}>
        <div
          className="employee-card group p-5"
          style={
            { "--card-color": primaryColor } as React.CSSProperties
          }
        >
          {/* Watermark */}
          <span className="card-watermark">
            {getCompanyInitial(employee.company)}
          </span>

          {/* Top section: Avatar + Info */}
          <div className="flex items-start gap-4 mb-4">
            {/* Monogram */}
            <div
              className={cn(
                "monogram monogram-lg group-hover:scale-105 transition-transform duration-220",
                getMonogramClass(employee.company)
              )}
            >
              {getInitials(employee.name)}
            </div>

            <div className="flex-1 min-w-0">
              {/* Name */}
              <h3 className="text-display-md text-[--text-primary] line-clamp-1 mb-0.5">
                {employee.name || "Sin nombre"}
              </h3>

              {/* Role */}
              <p className="text-[13px] text-[--text-muted] italic line-clamp-1 mb-2">
                {employee.position || "—"}
              </p>

              {/* Department pill */}
              <span
                className="inline-block text-display-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                }}
              >
                {employee.department || "—"}
              </span>

              {/* Company label */}
              <p className="text-[11px] text-[--text-faint] mt-2">
                {company?.shortName || company?.name || "—"}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div
            className="h-px mb-4"
            style={{
              background: `linear-gradient(90deg, ${primaryColor} 0%, transparent 100%)`,
              opacity: 0.3,
            }}
          />

          {/* Contact row - always visible on mobile, hover reveal on desktop */}
          <div className="contact-row space-y-2 text-[12px]">
            {/* Email row */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleEmailClick}
                className="flex items-center gap-1.5 text-[--text-muted] hover:text-[--text-primary] transition-colors flex-1 min-w-0 tap-target"
                disabled={!employee.email}
              >
                <Mail className="w-[15px] h-[15px] shrink-0" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate">
                        {truncateEmail(employee.email, 22)}
                      </span>
                    </TooltipTrigger>
                    {employee.email && (
                      <TooltipContent>{employee.email}</TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </button>
              {employee.email && (
                <>
                  <button
                    onClick={(e) =>
                      copyToClipboard(e, employee.email, `email-${employee.id}`)
                    }
                    className="p-1.5 rounded hover:bg-[--bg-elevated] transition-colors shrink-0"
                  >
                    {copiedField === `email-${employee.id}` ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-[--text-faint]" />
                    )}
                  </button>
                  <button
                    onClick={openTeamsChat}
                    className="p-1.5 rounded hover:bg-[--bg-elevated] transition-colors shrink-0"
                    title="Abrir chat en Teams"
                  >
                    <MessageSquare className="w-3 h-3 text-[--text-faint] hover:text-[#6264A7]" />
                  </button>
                </>
              )}
            </div>

            {/* Phone row */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePhoneClick}
                className="flex items-center gap-1.5 text-[--text-muted] hover:text-[--text-primary] transition-colors tap-target"
                disabled={!employee.phone}
              >
                <Phone className="w-[15px] h-[15px] shrink-0" />
                <span>{formatPhone(employee.phone)}</span>
              </button>
              {employee.extension && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                  }}
                >
                  Ext. {employee.extension}
                </span>
              )}
              {employee.phone && (
                <button
                  onClick={(e) =>
                    copyToClipboard(e, employee.phone, `phone-${employee.id}`)
                  }
                  className="p-1.5 rounded hover:bg-[--bg-elevated] transition-colors shrink-0 ml-auto"
                >
                  {copiedField === `phone-${employee.id}` ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 text-[--text-faint]" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
