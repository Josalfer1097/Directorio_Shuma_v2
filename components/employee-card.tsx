"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Copy, Check, MessageSquare } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    "grupo-shuma": "monogram-corporativo",
    "comercializadora-shuma": "monogram-comercializadora",
    "acabados-shuma": "monogram-acabados",
    "ferrecapital": "monogram-ferrecapital",
    "arkiramica": "monogram-arkiramica",
  };
  return classMap[companyId] || "monogram-corporativo";
};

// Format phone number for display
const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return phone;
};

// Truncate email for display
const truncateEmail = (email: string, maxLength = 20) => {
  if (email.length <= maxLength) return email;
  const [user, domain] = email.split("@");
  const truncatedUser = user.slice(0, Math.max(6, maxLength - domain.length - 4));
  return `${truncatedUser}...@${domain}`;
};

export function EmployeeCard({
  employee,
  company,
  view,
  index,
}: EmployeeCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const copyToClipboard = (e: React.MouseEvent, text: string, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles", { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openTeamsChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(`https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`, "_blank");
  };

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `mailto:${employee.email}`;
  };

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = `tel:${employee.phone}`;
  };

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.18, delay: index * 0.04, ease: premiumEase }}
        className="will-change-transform gpu-accelerated"
      >
        <Link href={`/directorio/${employee.id}`}>
          <div 
            className={cn(
              "premium-card group flex items-center gap-4 p-4",
              "transition-all duration-200",
              "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30"
            )}
            style={{ 
              ["--bracket-color" as string]: company.color,
            }}
          >
            <Avatar className={cn(
              "w-12 h-12 border-2 border-border",
              getMonogramClass(employee.company)
            )}>
              <AvatarFallback className="text-white font-semibold">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                  {employee.name}
                </h3>
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `${company.color}15`,
                    color: company.color,
                  }}
                >
                  {company.shortName || company.name}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {employee.position} · {employee.department}
              </p>
            </div>

            {/* Contact info inline for list view */}
            <div className="hidden md:flex items-center gap-3 text-xs">
              <TooltipProvider>
                {/* Email */}
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleEmailClick}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span className="hidden lg:inline max-w-28 truncate">{truncateEmail(employee.email)}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{employee.email}</TooltipContent>
                  </Tooltip>
                  <button
                    onClick={(e) => copyToClipboard(e, employee.email, "email-list")}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    {copiedField === "email-list" ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={openTeamsChat}
                    className="p-1 rounded hover:bg-muted transition-colors"
                    title="Abrir chat en Teams"
                  >
                    <MessageSquare className="w-3 h-3 text-muted-foreground hover:text-[#6264A7]" />
                  </button>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePhoneClick}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">{formatPhone(employee.phone)}</span>
                  </button>
                  <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">
                    Ext. {employee.extension}
                  </span>
                  <button
                    onClick={(e) => copyToClipboard(e, employee.phone, "phone-list")}
                    className="p-1 rounded hover:bg-muted transition-colors"
                  >
                    {copiedField === "phone-list" ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </TooltipProvider>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Grid view - premium glass card with accent border
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04, ease: premiumEase }}
      className="will-change-transform gpu-accelerated"
    >
      <Link href={`/directorio/${employee.id}`}>
        <div
          className={cn(
            "card-shimmer group relative overflow-hidden rounded-xl border border-border bg-card p-4 h-[220px] flex flex-col",
            "transition-all duration-200",
            "hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30"
          )}
          style={{ 
            ["--shimmer-color" as string]: company.color,
            borderLeftColor: company.color,
            borderLeftWidth: "3px",
          }}
        >
          {/* Top section: Avatar + Info */}
          <div className="flex items-start gap-3 flex-1">
            <Avatar className={cn(
              "w-14 h-14 border-2 border-border shrink-0",
              "group-hover:scale-105 transition-transform duration-200",
              getMonogramClass(employee.company)
            )}>
              <AvatarFallback className="text-sm font-bold text-white">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1 text-sm">
                {employee.name}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {employee.position}
              </p>
              <p className="text-[11px] text-muted-foreground/70 line-clamp-1">
                {employee.department}
              </p>
              <span
                className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1.5"
                style={{
                  backgroundColor: `${company.color}15`,
                  color: company.color,
                }}
              >
                {company.shortName || company.name}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="gradient-divider my-3" />

          {/* Bottom section: Contact info */}
          <div className="space-y-2 text-[12px]">
            {/* Email row */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleEmailClick}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-1 min-w-0"
              >
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate">{truncateEmail(employee.email, 18)}</span>
                    </TooltipTrigger>
                    <TooltipContent>{employee.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </button>
              <button
                onClick={(e) => copyToClipboard(e, employee.email, `email-${employee.id}`)}
                className="p-1 rounded hover:bg-muted transition-colors shrink-0"
              >
                {copiedField === `email-${employee.id}` ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
              <button
                onClick={openTeamsChat}
                className="p-1 rounded hover:bg-muted transition-colors shrink-0"
                title="Abrir chat en Teams"
              >
                <MessageSquare className="w-3 h-3 text-muted-foreground hover:text-[#6264A7]" />
              </button>
            </div>

            {/* Phone row */}
            <div className="flex items-center gap-1">
              <button
                onClick={handlePhoneClick}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{formatPhone(employee.phone)}</span>
              </button>
              <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-medium shrink-0">
                Ext. {employee.extension}
              </span>
              <button
                onClick={(e) => copyToClipboard(e, employee.phone, `phone-${employee.id}`)}
                className="p-1 rounded hover:bg-muted transition-colors shrink-0 ml-auto"
              >
                {copiedField === `phone-${employee.id}` ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
