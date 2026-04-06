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
  position: string; // Free text role
  department: string;
  company: string;
  email: string;
  phone: string;
  extension?: string;   // phone extension, e.g. "101"
  location?: string;    // city/office, e.g. "Puebla"
  reportsTo?: string | null;
  avatar?: string | null;
}

export interface EmployeeData {
  companies: Company[];
  departments: string[];
  employees: Employee[];
}

export type ViewMode = "grid" | "compact";

export type OrgChartLayout = "horizontal" | "vertical";
