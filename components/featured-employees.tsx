"use client";

import React from "react";
import { motion } from "framer-motion";
import type { MouseEvent } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone, Copy, Check, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Employee, Company } from "@/types";

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
const formatPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+52 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
  }
  return phone;
};

// Truncate email for display
const truncateEmail = (email: string, maxLength = 18) => {
  if (email.length <= maxLength) return email;
  const [user, domain] = email.split("@");
  const truncatedUser = user.slice(0, Math.max(5, maxLength - domain.length - 4));
  return `${truncatedUser}...@${domain}`;
};

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
  
  // Responsive items per page: 1 on mobile, 2 on tablet, 3 on desktop
  const getItemsPerPage = () => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth < 768) return 1;      // Mobile
    if (window.innerWidth < 1024) return 2;     // Tablet
    return 4;                                     // Desktop
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
    return companies.find((c) => c.id === companyId)?.color || "#7C3AED";
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

  const copyToClipboard = (e: MouseEvent, text: string, field: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles", { duration: 2000 });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const openTeamsChat = (e: MouseEvent, email: string) => {
    e.stopPropagation();
    window.open(`https://teams.microsoft.com/l/chat/0/0?users=${email}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Equipo Directivo
          </h2>
          <p className="text-muted-foreground">
            Conoce a los líderes de Grupo Shuma
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
      >
        {currentEmployees.map((employee) => {
          const companyColor = getCompanyColor(employee.company);
          return (
            <motion.div
              key={employee.id}
              variants={itemVariants}
              className="will-change-transform gpu-accelerated"
            >
              <div
                onClick={() => handleCardClick(employee.id)}
                className="card-shimmer corner-bracket group relative overflow-hidden rounded-xl border border-border bg-card p-4 h-[220px] flex flex-col cursor-pointer transition-all duration-[180ms] hover:scale-[1.02]"
                style={{
                  ["--shimmer-color" as string]: companyColor,
                  ["--bracket-color" as string]: companyColor,
                  transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 30px -10px ${companyColor}40`;
                  e.currentTarget.style.borderColor = `${companyColor}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.borderColor = "";
                }}
              >
                {/* Top section */}
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="w-14 h-14 border-2 border-border group-hover:border-primary/50 transition-colors duration-[180ms] shrink-0">
                    <AvatarFallback
                      className="text-sm font-semibold"
                      style={{
                        backgroundColor: `${companyColor}20`,
                        color: companyColor,
                      }}
                    >
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-[180ms] line-clamp-1 text-sm">
                      {employee.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {employee.position}
                    </p>
                    <span
                      className="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-1"
                      style={{
                        backgroundColor: `${companyColor}15`,
                        color: companyColor,
                      }}
                    >
                      {getCompanyName(employee.company)}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="gradient-divider my-2" />

                {/* Contact info */}
                <div className="space-y-1.5 text-[12px]">
                  {/* Email row */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${employee.email}`;
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
                    <button
                      onClick={(e: MouseEvent) => openTeamsChat(e, employee.email)}
                      className="p-1 rounded hover:bg-muted transition-colors shrink-0"
                      title="Abrir chat en Teams"
                    >
                      <MessageSquare className="w-3 h-3 text-muted-foreground hover:text-[#6264A7]" />
                    </button>
                  </div>

                  {/* Phone row */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e: MouseEvent) => {
                        e.stopPropagation();
                        window.location.href = `tel:${employee.phone}`;
                      }}
                      className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{formatPhone(employee.phone)}</span>
                    </button>
                    <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium shrink-0">
                      Ext. {employee.extension}
                    </span>
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
        })}
      </motion.div>

      {/* Pagination indicators */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-[180ms] ${
                i === currentIndex
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
