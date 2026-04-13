"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Copy, Check, MessageSquare, MapPin, Star } from "lucide-react";
import { useFavorites } from "@/lib/useFavorites";
import { haptics } from "@/lib/haptics";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Employee, Company } from "@/types";
import { cn } from "@/lib/utils";
import { getCompanyConfig } from "@/lib/companyConfig";

interface EmployeeCardProps {
  employee: Employee;
  company: Company;
  view: "grid" | "list";
  index: number;
  hideCompanyBadge?: boolean;
}

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

// Format phone number for display
const formatPhone = (phone: string | null | undefined) => {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return phone;
};

// Truncate email for display
const truncateEmail = (email: string | null | undefined, maxLength = 20) => {
  if (!email) return "—";
  if (email.length <= maxLength) return email;
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const truncatedUser = user.slice(0, Math.max(6, maxLength - domain.length - 4));
  return `${truncatedUser}...@${domain}`;
};





export function EmployeeCard({
  employee,
  company,
  view,
  index,
  hideCompanyBadge = false,
}: EmployeeCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [favoriteAnimating, setFavoriteAnimating] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const isEmployeeFavorite = isFavorite(employee.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavoriteAnimating(true);
    haptics.success();
    toggleFavorite(employee.id);
    setTimeout(() => setFavoriteAnimating(false), 300);
  };
  
  // Get company-specific config using the shared module
  const companyConfig = getCompanyConfig(employee.company);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const copyToClipboard = (e: React.MouseEvent, text: string | null | undefined, field: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    haptics.light();
    setCopiedField(field);
    toast.success("Copiado al portapapeles", { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openTeamsChat = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!employee.email) return;
    window.open(`https://teams.microsoft.com/l/chat/0/0?users=${employee.email}`, "_blank");
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
            className="group flex items-center gap-4 p-4 rounded-lg border bg-card relative overflow-hidden"
            style={{ 
              ["--bracket-color" as string]: companyConfig.primary,
              borderColor: isHovered ? companyConfig.primary : 'var(--border)',
              borderWidth: isHovered ? '1.5px' : '1px',
              boxShadow: isHovered ? `0 0 0 1px ${companyConfig.primary}, 0 8px 32px ${companyConfig.glow}` : 'none',
              transform: isHovered ? 'translateY(-3px) scale(1.012)' : 'none',
              background: isHovered 
                ? `linear-gradient(160deg, ${companyConfig.primary}10 0%, transparent 60%), rgba(255,255,255,0.07)` 
                : 'rgba(255,255,255,0.04)',
              transitionProperty: 'all',
              transitionDuration: '180ms',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Top accent line */}
            <div 
              className="absolute top-0 left-0 right-0 transition-all duration-[180ms]"
              style={{
                height: '2px',
                backgroundColor: companyConfig.accent || companyConfig.primary,
                opacity: isHovered ? 1 : 0.4,
              }}
            />
            
            {/* Left accent bar */}
            <div 
              className="absolute left-0 top-0 bottom-0 transition-all duration-[180ms]"
              style={{
                width: isHovered ? '5px' : '3px',
                background: isHovered && companyConfig.accent 
                  ? `linear-gradient(to bottom, ${companyConfig.accent}, ${companyConfig.primary})`
                  : companyConfig.primary,
                opacity: isHovered ? 1 : 0.7,
              }}
            />
            <div className="corner-bracket ml-2">
              <Avatar 
                className="w-12 h-12 transition-all duration-[180ms]"
                style={{
                  borderWidth: isHovered ? '2px' : '1.5px',
                  borderStyle: 'solid',
                  borderColor: isHovered 
                    ? (companyConfig.accent || companyConfig.primary) 
                    : `${companyConfig.primary}66`,
                  boxShadow: isHovered 
                    ? `0 0 12px ${companyConfig.accentGlow || companyConfig.glow}` 
                    : 'none',
                  transform: isHovered ? 'scale(1.05)' : 'none',
                }}
              >
                <AvatarFallback
                  style={{
                    background: `linear-gradient(135deg, ${companyConfig.secondary}, ${companyConfig.primary})`,
                    color: companyConfig.textColor || 'white',
                  }}
                >
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-[180ms] truncate">
                  {employee.name}
                </h3>
                {!hideCompanyBadge && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: companyConfig.accent ? companyConfig.secondary : `${companyConfig.primary}15`,
                      border: companyConfig.accent ? `1px solid ${companyConfig.primary}` : 'none',
                      color: companyConfig.accent || companyConfig.primary,
                    }}
                  >
                    {company.shortName || company.name}
                  </span>
                )}
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={openTeamsChat}
                        className="p-1 rounded hover:bg-[#6264A7]/10 transition-colors group/teams"
                      >
                        <MessageSquare className="w-3 h-3 text-muted-foreground group-hover/teams:text-[#6264A7]" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enviar mensaje en Teams</p>
                    </TooltipContent>
                  </Tooltip>
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

  // Card cascade animation - only on first load (index >= 0)
  const shouldAnimate = index >= 0;
  const animationDelay = shouldAnimate ? `${Math.min(index * 30, 600)}ms` : '0ms';

  // Grid view - reduced height ~200px
  return (
    <div
      className={cn(
        "will-change-transform gpu-accelerated",
        shouldAnimate && "card-rain"
      )}
      style={{
        animationDelay: shouldAnimate ? animationDelay : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/directorio/${employee.id}`}>
        <div
          className={cn(
            "card-shimmer corner-bracket group relative overflow-hidden rounded-xl flex flex-col touch-manipulation select-none employee-card",
            "transition-all duration-[180ms]"
          )}
          style={{ 
            ["--shimmer-color" as string]: companyConfig.primary,
            ["--bracket-color" as string]: companyConfig.primary,
            ["--card-color" as string]: companyConfig.primary,
            height: 'auto',
            minHeight: 'calc(180px * var(--font-scale, 1))',
            padding: 'calc(14px * var(--font-scale, 1)) calc(16px * var(--font-scale, 1))',
            borderWidth: isHovered ? '1.5px' : '1px',
            borderStyle: 'solid',
            borderColor: isHovered ? companyConfig.primary : 'var(--border)',
            boxShadow: isHovered ? `0 0 0 1px ${companyConfig.primary}, 0 8px 32px ${companyConfig.glow}` : 'none',
            transform: isHovered ? 'translateY(-3px) scale(1.012)' : 'none',
            background: isHovered 
              ? `linear-gradient(160deg, ${companyConfig.primary}10 0%, transparent 60%), rgba(255,255,255,0.07)` 
              : 'rgba(255,255,255,0.04)',
            transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          }}
        >
          {/* Favorite button */}
          <button
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 z-10 flex items-center justify-center transition-all duration-[180ms]"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: isEmployeeFavorite ? 'rgba(245,196,0,0.15)' : 'rgba(0,0,0,0.3)',
              border: isEmployeeFavorite ? '1px solid rgba(245,196,0,0.4)' : '1px solid rgba(255,255,255,0.1)',
              transform: favoriteAnimating ? 'scale(1.3)' : 'scale(1)',
            }}
          >
            <Star
              className={`transition-all duration-[180ms] ${isEmployeeFavorite ? 'fill-[#F5C400]' : ''}`}
              style={{
                width: '14px',
                height: '14px',
                color: isEmployeeFavorite ? '#F5C400' : 'rgba(255,255,255,0.20)',
                filter: isEmployeeFavorite ? 'drop-shadow(0 0 4px rgba(245,196,0,0.6))' : 'none',
              }}
            />
          </button>

          {/* Top accent line */}
          <div 
            className="absolute top-0 left-0 right-0 transition-all duration-[180ms]"
            style={{
              height: '2px',
              backgroundColor: companyConfig.accent || companyConfig.primary,
              opacity: isHovered ? 1 : 0.4,
            }}
          />
          
          {/* Left accent bar */}
          <div 
            className="absolute left-0 top-0 bottom-0 transition-all duration-[180ms]"
            style={{
              width: isHovered ? '5px' : '3px',
              background: isHovered && companyConfig.accent 
                ? `linear-gradient(to bottom, ${companyConfig.accent}, ${companyConfig.primary})`
                : companyConfig.primary,
              opacity: isHovered ? 1 : 0.7,
            }}
          />
          
          {/* Top section: Avatar + Info */}
          <div className="flex items-start flex-1 pl-2" style={{ gap: 'calc(12px * var(--font-scale, 1))' }}>
            <Avatar 
              className="shrink-0 transition-all duration-[180ms] avatar-animated"
              style={{
                width: 'calc(52px * var(--font-scale, 1))',
                height: 'calc(52px * var(--font-scale, 1))',
                borderWidth: isHovered ? '2px' : '1.5px',
                borderStyle: 'solid',
                borderColor: isHovered 
                  ? (companyConfig.accent || companyConfig.primary) 
                  : `${companyConfig.primary}66`,
                boxShadow: isHovered 
                  ? `0 0 12px ${companyConfig.accentGlow || companyConfig.glow}` 
                  : 'none',
                transform: isHovered ? 'scale(1.05)' : 'none',
              }}
            >
              <AvatarFallback
                className="font-semibold avatar-animated-inner"
                style={{
                  fontSize: 'calc(1.1rem * var(--font-scale, 1))',
                  background: `conic-gradient(from var(--avatar-angle, 0deg), ${companyConfig.secondary} 0%, ${companyConfig.primary} 40%, ${companyConfig.highlight || companyConfig.accent || companyConfig.primary} 60%, ${companyConfig.secondary} 100%)`,
                  color: 'white',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  fontWeight: 700,
                }}
              >
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold text-foreground group-hover:text-primary transition-colors duration-[180ms] line-clamp-1"
                style={{ fontSize: 'var(--font-md)' }}
              >
                {employee.name}
              </h3>
              <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--font-base)' }}>
                {employee.position}
              </p>
              <p className="text-muted-foreground/70 line-clamp-1" style={{ fontSize: 'var(--font-sm)' }}>
                {employee.department}
              </p>
              {employee.location && (
                <p 
                  className="flex items-center text-muted-foreground/50 line-clamp-1"
                  style={{ 
                    fontSize: 'var(--font-xs)', 
                    gap: 'calc(4px * var(--font-scale, 1))',
                    marginTop: 'calc(2px * var(--font-scale, 1))',
                  }}
                >
                  <MapPin style={{ width: 'calc(10px * var(--font-scale, 1))', height: 'calc(10px * var(--font-scale, 1))' }} />
                  {employee.location}
                </p>
              )}
              {!hideCompanyBadge && (
                <span
                  className="inline-block font-medium rounded-full"
                  style={{
                    fontSize: 'var(--font-xs)',
                    padding: 'calc(3px * var(--font-scale, 1)) calc(10px * var(--font-scale, 1))',
                    marginTop: 'calc(4px * var(--font-scale, 1))',
                    backgroundColor: `${companyConfig.primary}15`,
                    border: `1px solid ${companyConfig.primary}40`,
                    color: companyConfig.accent || companyConfig.primary,
                  }}
                >
                  {company.shortName || company.name}
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="gradient-divider my-2" />

          {/* Bottom section: Contact info */}
          <div className="space-y-1.5" style={{ fontSize: 'var(--font-sm)' }}>
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
                className="p-1.5 sm:p-1 rounded hover:bg-muted transition-colors shrink-0 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation"
              >
                {copiedField === `email-${employee.id}` ? (
                  <Check className="w-4 h-4 sm:w-3 sm:h-3 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 sm:w-3 sm:h-3 text-muted-foreground" />
                )}
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={openTeamsChat}
                      className="p-1.5 sm:p-1 rounded hover:bg-[#6264A7]/10 transition-colors shrink-0 group/teams min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation"
                    >
                      <MessageSquare className="w-4 h-4 sm:w-3 sm:h-3 text-muted-foreground group-hover/teams:text-[#6264A7]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Enviar mensaje en Teams</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
              <span 
                className="shrink-0 text-[10px] font-medium"
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                Ext. {employee.extension}
              </span>
              <button
                onClick={(e) => copyToClipboard(e, employee.phone, `phone-${employee.id}`)}
                className="p-1.5 sm:p-1 rounded hover:bg-muted transition-colors shrink-0 ml-auto min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center touch-manipulation"
              >
                {copiedField === `phone-${employee.id}` ? (
                  <Check className="w-4 h-4 sm:w-3 sm:h-3 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 sm:w-3 sm:h-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
