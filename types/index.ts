export interface Company {
  id: string;
  name: string;
  shortName?: string;
  type: "holding" | "subsidiary";
  color: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  company: string;
  email: string;
  phone: string;
  extension: string;
  reportsTo: string | null;
  avatar: string | null;
  tags: string[];
  startDate: string;
}

export interface EmployeeData {
  companies: Company[];
  departments: string[];
  employees: Employee[];
}

export type ViewMode = "grid" | "list";

export type OrgChartLayout = "horizontal" | "vertical";
