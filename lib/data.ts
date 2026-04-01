import employeesData from "@/data/employees.json";
import type { Company, Employee, EmployeeData } from "@/types";

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



export function getCompanyColor(companyId: string): string {
  const company = getCompanyById(companyId);
  return company?.color || "#7C3AED";
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
