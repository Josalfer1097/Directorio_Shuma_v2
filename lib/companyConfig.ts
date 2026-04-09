export const companyConfig: Record<string, {
  primary: string;
  secondary: string;
  glow: string;
  highlight: string;
  name: string;
  initial: string;
  accent?: string;
  accentGlow?: string;
}> = {
  comercializadora: {
    primary: '#0047AB',
    secondary: '#002D6E',
    glow: 'rgba(0,71,171,0.28)',
    highlight: '#4D9FFF',
    name: 'Comercializadora y Ferreteria Shuma',
    initial: 'C',
  },
  acabados: {
    primary: '#C0152A',
    secondary: '#8B0000',
    glow: 'rgba(192,21,42,0.28)',
    highlight: '#FF4D5E',
    name: 'Acabados Shuma',
    initial: 'A',
  },
  ferrecapital: {
    primary: '#2C3338',
    secondary: '#1A1E21',
    glow: 'rgba(44,51,56,0.35)',
    highlight: '#CC0000',
    name: 'Ferrecapital',
    initial: 'F',
    accent: '#CC0000',
    accentGlow: 'rgba(204,0,0,0.18)',
  },
  arkiramica: {
    primary: '#F5C400',
    secondary: '#C49A00',
    glow: 'rgba(245,196,0,0.25)',
    highlight: '#FFD93D',
    name: 'Arkiramica',
    initial: 'K',
  },
};

export function getCompanyConfig(companyId?: string | null) {
  // Always return a valid config, never undefined
  if (!companyId) return companyConfig.comercializadora;
  
  const normalized = companyId.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
  
  if (normalized.includes('comercializ') || normalized.includes('ferreteria')) 
    return companyConfig.comercializadora;
  if (normalized.includes('acabado')) 
    return companyConfig.acabados;
  if (normalized.includes('ferrecapital')) 
    return companyConfig.ferrecapital;
  if (normalized.includes('arkiram') || normalized.includes('arkiream')) 
    return companyConfig.arkiramica;
  
  return companyConfig.comercializadora; // safe fallback
}
