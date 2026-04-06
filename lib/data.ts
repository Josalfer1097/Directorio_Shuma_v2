import employeesData from "@/data/employees.json";
import type { Company, Employee, EmployeeData, CompanyColors } from "@/types";

export function getEmployeeData(): EmployeeData {
  return employeesData as EmployeeData;
}

export function getCompanies(): Company[] {
  return employeesData.companies as Company[];
}

export function getEmployees(): Employee[] {
  return employeesData.employees as Employee[];
}

export function getDepartments(): string[] {
  return employeesData.departments;
}

export function getAllTags(): string[] {
  return [];
}

export function getEmployeeById(id: string): Employee | undefined {
  return employeesData.employees.find((emp) => emp.id === id) as Employee | undefined;
}

export function getEmployeesByCompany(companyId: string): Employee[] {
  return employeesData.employees.filter((emp) => emp.company === companyId) as Employee[];
}

export function getCompanyById(id: string): Company | undefined {
  return employeesData.companies.find((company) => company.id === id) as Company | undefined;
}

export function getDirectReports(employeeId: string): Employee[] {
  return employeesData.employees.filter((emp) => emp.reportsTo === employeeId) as Employee[];
}

export function getReportingChain(employeeId: string): Employee[] {
  const chain: Employee[] = [];
  let currentEmployee = getEmployeeById(employeeId);

  while (currentEmployee?.reportsTo) {
    const manager = getEmployeeById(currentEmployee.reportsTo);
    if (manager) {
      chain.unshift(manager);
      currentEmployee = manager;
    } else {
      break;
    }
  }

  return chain;
}

const defaultColors: CompanyColors = {
  primary: "#C9A84C",
  secondary: "#A68A3A",
  glow: "rgba(201,168,76,0.15)",
  accent: "#E0C060",
};

export function getCompanyColors(companyId: string): CompanyColors {
  const company = getCompanyById(companyId);
  return company?.colors || defaultColors;
}

export function getCompanyPrimaryColor(companyId: string): string {
  const colors = getCompanyColors(companyId);
  return colors.primary;
}

export function getCompanyStats() {
  const companies = getCompanies();
  return companies.map((company) => ({
    ...company,
    employeeCount: getEmployeesByCompany(company.id).length,
  }));
}

export function getTotalStats() {
  return {
    totalEmployees: employeesData.employees.length,
    totalCompanies: employeesData.companies.length,
    totalDepartments: employeesData.departments.length,
  };
}