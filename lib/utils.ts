import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Employee } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Strict whitelist for leadership positions
export function isLeadershipRole(position: string | undefined | null): boolean {
  const p = position?.toLowerCase().trim() ?? '';
  
  // Explicit exclusions first
  const excluded = [
    'almacén', 'almacen', 'sub gerente',
    'auxiliar', 'agente', 'analista',
    'vendedor', 'vendedora', 'caja',
    'encargado', 'soporte', 'desarrollador',
    'facturista', 'recepción', 'recepcion'
  ];
  if (excluded.some(ex => p.includes(ex))) return false;
  
  // Whitelist of leadership positions
  const included = [
    'director', 'directora',
    'gerente general', 'gerenta general',
    'gerente de sistemas',
    'gerente de contabilidad',
    'gerente crédito', 'gerente credito',
    'gerente de ventas',
    'gerente de logística', 'gerente de logistica',
    'gerente de crédito', 'gerente de credito',
    'gerente de compras',
    'gerente general administrativo'
  ];
  return included.some(inc => p.includes(inc));
}

// Leadership tier priority function
export function getLeadershipTier(position: string | undefined | null): number {
  const p = position?.toLowerCase() ?? '';
  if (p.includes('director')) return 1;
  if (p.includes('gerente general') || p.includes('gerente de compras y asistente')) return 2;
  return 3;
}

export function sortByLeadershipTier(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => {
    const tierDiff = getLeadershipTier(a.position) - getLeadershipTier(b.position);
    if (tierDiff !== 0) return tierDiff;
    return (a.name ?? "").localeCompare(b.name ?? "", 'es-MX');
  });
}

export function formatName(fullName: string | undefined | null): string {
  if (!fullName) return '';
  return fullName.trim();
}

export function normalizeCompanyId(raw: string | undefined | null): string {
  if (!raw) return '';
  return raw.toLowerCase().trim();
}

export function getCompanyDisplayName(id: string | undefined | null): string {
  const normalized = normalizeCompanyId(id);
  switch (normalized) {
    case 'comercializadora': return 'Comercializadora';
    case 'acabados': return 'Acabados';
    case 'ferrecapital': return 'Ferrecapital';
    case 'arkiramica': return 'Arkiramica';
    default: return id || '';
  }
}
