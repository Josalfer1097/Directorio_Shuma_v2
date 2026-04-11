export interface CompanyColors {
  primary: string;
  secondary: string;
  glow: string;
  accent?: string;
  textOnColor?: string;
}

export interface Company {
  id: string;
  name: string;
  shortName?: string;
  colors: CompanyColors;
  description: string;
  disabled?: boolean;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string | null;
  company: 'comercializadora' | 'ferrecapital' | 'acabados' | 'arkiramica';
  email: string | null;
  phone: string | null;
  extension: string | null;
  location: string | null;
  reportsTo: string | null;
  avatar: string | null;
}

export interface EmployeeData {
  companies: Company[];
  departments: string[];
  employees: Employee[];
}

export type ViewMode = "grid" | "list" | "extensions";

export type OrgChartLayout = "horizontal" | "vertical";
