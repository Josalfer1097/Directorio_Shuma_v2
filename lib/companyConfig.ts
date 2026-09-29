export const companyConfig: Record<string, {
  id: string;
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
    id: 'comercializadora',
    primary: '#0047AB',
    secondary: '#002D6E',
    glow: 'rgba(0,71,171,0.28)',
    highlight: '#4D9FFF',
    name: 'Comercializadora y Ferretería Shuma',
    initial: 'C',
  },
  acabados: {
    id: 'acabados',
    primary: '#C0152A',
    secondary: '#8B0000',
    glow: 'rgba(192,21,42,0.28)',
    highlight: '#FF4D5E',
    name: 'Acabados Shuma',
    initial: 'A',
  },
  ferrecapital: {
    id: 'ferrecapital',
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
    id: 'arkiramica',
    primary: '#F5C400',
    secondary: '#C49A00',
    glow: 'rgba(245,196,0,0.25)',
    highlight: '#FFD93D',
    name: 'Arkirámica',
    initial: 'K',
  },
};

/**
 * Ferrecapital's primary (#2C3338) is a near-black tone that nearly disappears
 * against the dark theme background. In dark mode, icon/border/badge accents
 * should use a lighter tone (--color-ferrecapital-accent, defined in globals.css)
 * instead, while light mode keeps the original color unchanged.
 */
export function getAccentColor(config: { id?: string; primary: string }): string {
  return config.id === 'ferrecapital' ? 'var(--color-ferrecapital-accent)' : config.primary;
}

/**
 * Same dark-mode-aware substitution as getAccentColor, but for the common
 * `${primary}NN` hex-alpha-suffix pattern. For every company except
 * Ferrecapital this returns the exact same string as before (zero risk of
 * regression). For Ferrecapital it swaps to a color-mix() using the
 * theme-aware accent variable so the alpha tint stays visible in dark mode.
 */
export function alphaColor(config: { id?: string; primary: string }, hexAlpha: string): string {
  if (config.id === 'ferrecapital') {
    const pct = Math.round((parseInt(hexAlpha, 16) / 255) * 100);
    return `color-mix(in srgb, var(--color-ferrecapital-accent) ${pct}%, transparent)`;
  }
  return `${config.primary}${hexAlpha}`;
}

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
