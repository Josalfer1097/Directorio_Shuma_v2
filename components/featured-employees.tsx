"use client";

import React from "react";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Employee, Company } from "@/types";
import { getCompanyConfig } from "@/lib/companyConfig";

// Premium easing curve
const premiumEase = [0.25, 0.46, 0.45, 0.94];

// Stagger animation container
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: premiumEase,
    },
  },
};

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
const truncateEmail = (email: string | null | undefined, maxLength = 18) => {
  if (!email) return "—";
  if (email.length <= maxLength) return email;
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const truncatedUser = user.slice(0, Math.max(5, maxLength - domain.length - 4));
  return `${truncatedUser}...@${domain}`;
};

// Featured Employee Card Component
interface FeaturedEmployeeCardProps {
  employee: Employee;
  companyConfig: { primary: string; secondary: string; glow: string };
  companyName: string;
  getInitials: (name: string) => string;
  handleCardClick: (employeeId: string) => void;
  copyToClipboard: (e: MouseEvent, text: string, field: string) => void;
  copiedField: string | null;
}

function FeaturedEmployeeCard({
  employee,
  companyConfig,
  companyName,
  getInitials,
  handleCardClick,
  copyToClipboard,
  copiedField,
}: FeaturedEmployeeCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      className="will-change-transform gpu-accelerated"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={() => handleCardClick(employee.id)}
        className="card-shimmer corner-bracket group relative overflow-hidden rounded-xl p-4 flex flex-col cursor-pointer"
        style={{
          ["--shimmer-color" as string]: companyConfig.primary,
          ["--bracket-color" as string]: companyConfig.primary,
          minHeight: 'calc(220px * var(--font-scale))',
          borderWidth: isHovered ? '1.5px' : '1px',
          borderStyle: 'solid',
          borderColor: isHovered ? companyConfig.primary : 'var(--border)',
          boxShadow: isHovered ? `0 0 0 1px ${companyConfig.primary}, 0 8px 32px ${companyConfig.glow}` : 'none',
          transform: isHovered ? 'translateY(-3px) scale(1.012)' : 'none',
          background: isHovered 
            ? `linear-gradient(160deg, ${companyConfig.primary}10 0%, transparent 60%), rgba(255,255,255,0.07)` 
            : 'rgba(255,255,255,0.04)',
          transitionProperty: 'all',
          transitionDuration: '180ms',
          transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }}
      >
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

        {/* Top section */}
        <div className="flex items-start gap-3 flex-1 pl-2">
          <Avatar 
            className="shrink-0 transition-all duration-[180ms]"
            style={{
              width: 'calc(56px * var(--font-scale))',
              height: 'calc(56px * var(--font-scale))',
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
              className="text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${companyConfig.secondary}, ${companyConfig.primary})`,
                color: companyConfig.textColor || 'white',
              }}
            >
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-foreground group-hover:text-primary transition-colors duration-[180ms] line-clamp-1"
              style={{ fontSize: "var(--font-md)" }}
            >
              {employee.name}
            </h3>
            <p className="text-muted-foreground line-clamp-1" style={{ fontSize: "var(--font-sm)" }}>
              {employee.position}
            </p>
            <span
              className="inline-block font-medium px-1.5 py-0.5 rounded-full mt-1"
              style={{
                fontSize: "var(--font-xs)",
                backgroundColor: companyConfig.accent ? companyConfig.secondary : `${companyConfig.primary}15`,
                border: companyConfig.accent ? `1px solid ${companyConfig.primary}` : 'none',
                color: companyConfig.accent || companyConfig.primary,
              }}
            >
              {companyName}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="gradient-divider my-2" />

        {/* Contact info */}
        <div className="space-y-1.5 pl-2" style={{ fontSize: "var(--font-sm)" }}
          {/* Email row */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                if (employee.email) window.location.href = `mailto:${employee.email}`;
              }}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors flex-1 min-w-0"
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="truncate">{truncateEmail(employee.email)}</span>
                  </TooltipTrigger>
                  <TooltipContent>{employee.email}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </button>
            <button
              onClick={(e: MouseEvent) => copyToClipboard(e, employee.email, `featured-email-${employee.id}`)}
              className="p-1 rounded hover:bg-muted transition-colors shrink-0"
            >
              {copiedField === `featured-email-${employee.id}` ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Phone row */}
          <div className="flex items-center gap-1">
            <button
              onClick={(e: MouseEvent) => {
                e.stopPropagation();
                if (employee.phone) window.location.href = `tel:${employee.phone}`;
              }}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{formatPhone(employee.phone)}</span>
            </button>
            <button
              onClick={(e: MouseEvent) => copyToClipboard(e, employee.phone, `featured-phone-${employee.id}`)}
              className="p-1 rounded hover:bg-muted transition-colors shrink-0 ml-auto"
            >
              {copiedField === `featured-phone-${employee.id}` ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface FeaturedEmployeesProps {
  employees: Employee[];
  companies: Company[];
}

export function FeaturedEmployees({
  employees,
  companies,
}: FeaturedEmployeesProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Responsive items per page: 1 on mobile, 2 on tablet, 4 on desktop
  const getItemsPerPage = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 768) return 1;
    if (window.innerWidth < 1024) return 2;
    return 4;
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(4);
  
  React.useEffect(() => {
    setItemsPerPage(getItemsPerPage());
    const handleResize = () => setItemsPerPage(getItemsPerPage());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const currentEmployees = employees.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const getCompanyColor = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.colors.primary || "#7C3AED";
  };

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.shortName || company?.name || companyId;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCardClick = (employeeId: string) => {
    router.push(`/directorio/${employeeId}`);
  };

  const copyToClipboard = (e: MouseEvent, text: string | null | undefined, field: string) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles", { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground" style={{ fontSize: "var(--font-2xl)" }}>
            Liderazgo Shuma
          </h2>
          <p className="text-muted-foreground" style={{ fontSize: "var(--font-base)" }}>
            Las personas que guían el camino de nuestras empresas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="transition-all duration-[180ms]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentIndex(Math.min(totalPages - 1, currentIndex + 1))
            }
            disabled={currentIndex >= totalPages - 1}
            className="transition-all duration-[180ms]"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <motion.div
        key={currentIndex}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        style={{
          // On mobile, show partial peek of next card
          gridTemplateColumns: itemsPerPage === 1 ? 'minmax(0, 85vw)' : undefined,
          justifyContent: itemsPerPage === 1 ? 'center' : undefined,
        }}
      >
        {currentEmployees.map((employee) => {
          const companyConfig = getCompanyConfig(employee.company);
          return (
            <FeaturedEmployeeCard
              key={employee.id}
              employee={employee}
              companyConfig={companyConfig}
              companyName={getCompanyName(employee.company)}
              getInitials={getInitials}
              handleCardClick={handleCardClick}
              copyToClipboard={copyToClipboard}
              copiedField={copiedField}
            />
          );
        })}
      </motion.div>

      {/* Pagination indicators - always visible on mobile */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 py-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all duration-[180ms] touch-manipulation ${
                i === currentIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              style={{ minWidth: '8px' }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
