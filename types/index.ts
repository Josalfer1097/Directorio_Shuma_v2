export interface CompanyColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Company {
  id: string;
  name: string;
  shortName?: string;
  colors: CompanyColors;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string; // Free text role
  department: string;
  company: string;
  email?: string;
  phone?: string;
  extension?: string;
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
