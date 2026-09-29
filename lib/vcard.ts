import type { Employee, Company } from "@/types";

// Escape special characters per the vCard 3.0 spec (RFC 2426 §5.8.4)
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// Every employee shares the same main line; only the extension differs.
export function formatVCardPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return `+52 ${phone}`;
}

// Employees without an assigned name (e.g. "-") use their department as the
// display name instead, so contacts never save as a bare dash.
export function getVCardDisplayName(employee: Employee): string {
  const name = employee.name?.trim();
  if (name && name !== "-") return name;
  return employee.department || "Sin nombre";
}

function getVCardNameParts(employee: Employee): { given: string; family: string } {
  const fn = getVCardDisplayName(employee);
  const isFallback = !employee.name || employee.name.trim() === "-";
  if (isFallback) {
    return { given: fn, family: "" };
  }
  const parts = fn.split(/\s+/);
  return { given: parts[0] ?? fn, family: parts.slice(1).join(" ") };
}

export function buildVCard(employee: Employee, company: Company | undefined): string {
  const fn = getVCardDisplayName(employee);
  const { given, family } = getVCardNameParts(employee);
  const phone = formatVCardPhone(employee.phone);

  const noteParts = [
    employee.extension ? `Ext. ${employee.extension}` : null,
    employee.department || null,
    employee.location || null,
  ].filter((part): part is string => Boolean(part));

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVCardValue(fn)}`,
    `N:${escapeVCardValue(family)};${escapeVCardValue(given)};;;`,
  ];

  if (company?.name) lines.push(`ORG:${escapeVCardValue(company.name)}`);
  if (employee.position) lines.push(`TITLE:${escapeVCardValue(employee.position)}`);
  if (phone) lines.push(`TEL;TYPE=WORK:${phone}`);
  if (employee.email) lines.push(`EMAIL:${escapeVCardValue(employee.email)}`);
  if (noteParts.length) lines.push(`NOTE:${escapeVCardValue(noteParts.join(" \u00B7 "))}`);

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function downloadVCard(employee: Employee, company: Company | undefined): void {
  const vcard = buildVCard(employee, company);
  const fileName = `${getVCardDisplayName(employee).replace(/\s+/g, "_")}.vcf`;

  // Prepend a BOM so vCard readers reliably treat the file as UTF-8,
  // preserving accented characters (á, é, í, ó, ú, ñ) in names and titles.
  const blob = new Blob(["\uFEFF" + vcard], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
