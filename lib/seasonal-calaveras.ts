// Each employee always gets the same calavera. Consecutive ids (emp001, emp002, ...)
// cycle through all 6, so neighbor cards rarely repeat.
export const CALAVERA_COUNT = 6;

export function getCalaveraIndex(id: string): number {
  const digits = id.replace(/\D/g, "");
  if (digits) return Number.parseInt(digits, 10) % CALAVERA_COUNT;
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % CALAVERA_COUNT;
}

export function getCalaveraSrc(id: string): string {
  return `/seasonal/calaveras/calavera-${getCalaveraIndex(id) + 1}.svg`;
}
