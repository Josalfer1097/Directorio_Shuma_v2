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
  department: string;
  company: string;
  email: string;
  phone: string;
  extension?: string;
  location?: string;
  reportsTo?: string | null;
  avatar?: string | null;
}

export interface EmployeeData {
  companies: Company[];
  departments: string[];
  employees: Employee[];
}

export type ViewMode = "grid" | "list";

export type OrgChartLayout = "horizontal" | "vertical";