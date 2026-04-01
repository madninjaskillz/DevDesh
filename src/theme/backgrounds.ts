import type { ThemeName } from './themes';

export interface BackgroundDef {
  id: string;
  label: string;
  file: string;
  /** Which themes this is recommended for */
  themes: ThemeName[];
}

const BASE = '/DevDesh/backgrounds/';

export const BACKGROUNDS: BackgroundDef[] = [
  // Redgate
  { id: 'redgate-dark-geo', label: 'Dark Geometric', file: `${BASE}redgate-dark-geo.jpg`, themes: ['redgate'] },
  { id: 'redgate-dark-gradient', label: 'Dark Gradient', file: `${BASE}redgate-dark-gradient.jpg`, themes: ['redgate'] },

  // Apple Glass
  { id: 'glass-colorful', label: 'Colorful Gradient', file: `${BASE}glass-colorful-gradient.jpg`, themes: ['glass'] },
  { id: 'glass-aurora', label: 'Aurora', file: `${BASE}glass-aurora.jpg`, themes: ['glass'] },

  // Metro
  { id: 'metro-geometric', label: 'Bold Geometric', file: `${BASE}metro-bold-geometric.jpg`, themes: ['metro'] },
  { id: 'metro-vibrant', label: 'Vibrant Abstract', file: `${BASE}metro-vibrant-abstract.jpg`, themes: ['metro'] },

  // Fluent
  { id: 'fluent-bloom', label: 'Blue Bloom', file: `${BASE}fluent-blue-bloom.jpg`, themes: ['fluent'] },
  { id: 'fluent-flow', label: 'Light Flow', file: `${BASE}fluent-light-flow.jpg`, themes: ['fluent'] },

  // Win95
  { id: 'win95-clouds', label: 'Clouds', file: `${BASE}win95-clouds.jpg`, themes: ['win95'] },
  { id: 'win95-teal', label: 'Teal Retro', file: `${BASE}win95-teal-retro.jpg`, themes: ['win95'] },
  { id: 'win95-vaporwave', label: 'Vaporwave', file: `${BASE}win95-vaporwave.jpg`, themes: ['win95'] },

  // Windows XP
  { id: 'winxp-bliss', label: 'Bliss', file: `${BASE}winxp-bliss.jpg`, themes: ['winxp'] },
  { id: 'general-mountain', label: 'Mountain Landscape', file: `${BASE}general-mountain-landscape.jpg`, themes: ['winxp', 'glass', 'fluent', 'metro'] },

  // General
  { id: 'general-space', label: 'Space Galaxy', file: `${BASE}general-space-galaxy.jpg`, themes: ['redgate', 'glass', 'fluent'] },
  { id: 'general-minimalist', label: 'Minimalist Gradient', file: `${BASE}general-minimalist-gradient.jpg`, themes: ['glass', 'fluent', 'redgate'] },
];

export function getBackgroundsForTheme(theme: ThemeName): BackgroundDef[] {
  const recommended = BACKGROUNDS.filter((b) => b.themes.includes(theme));
  const others = BACKGROUNDS.filter((b) => !b.themes.includes(theme));
  return [...recommended, ...others];
}

export function getBackgroundById(id: string): BackgroundDef | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}
