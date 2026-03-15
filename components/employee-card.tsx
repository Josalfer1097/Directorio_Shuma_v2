"use client";

import { motion } from "framer-motion";
import { Mail, Phone, Copy, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Employee, Company } from "@/types";
import { cn } from "@/lib/utils";

interface EmployeeCardProps {
  employee: Employee;
  company: Company;
  view: "grid" | "list";
  index: number;
}

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (view === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Link href={`/directorio/${employee.id}`}>
          <div className="group flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
            <Avatar className="w-12 h-12 border border-border">
              <AvatarFallback
                style={{
                  backgroundColor: `${company.color}20`,
                  color: company.color,
                }}
              >
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
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

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard(employee.email, "email");
                }}
              >
                {copiedField === "email" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span className="hidden lg:inline truncate max-w-32">
                  {employee.email}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard(employee.phone, "phone");
                }}
              >
                {copiedField === "phone" ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                <span className="hidden lg:inline">Ext. {employee.extension}</span>
              </Button>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/directorio/${employee.id}`}>
        <div
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300",
            "hover:shadow-lg hover:border-primary/30"
          )}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: company.color }}
          />

          <div className="flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 mb-4 border-2 border-border group-hover:border-primary/50 transition-colors">
              <AvatarFallback
                className="text-lg font-semibold"
                style={{
                  backgroundColor: `${company.color}20`,
                  color: company.color,
                }}
              >
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>

            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {employee.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-1 line-clamp-1">
              {employee.position}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {employee.department}
            </p>

            <span
              className="text-xs font-medium px-2 py-1 rounded-full mb-4"
              style={{
                backgroundColor: `${company.color}15`,
                color: company.color,
              }}
            >
              {company.shortName || company.name}
            </span>

            <div className="flex items-center gap-1 w-full">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 gap-1 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard(employee.email, "email");
                }}
              >
                {copiedField === "email" ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Mail className="w-3 h-3" />
                )}
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 gap-1 text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  copyToClipboard(employee.phone, "phone");
                }}
              >
                {copiedField === "phone" ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Phone className="w-3 h-3" />
                )}
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
