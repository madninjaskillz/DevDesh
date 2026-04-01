import type { ThemeName } from './themes';

export interface BackgroundDef {
  id: string;
  label: string;
  file: string;
}

const BASE = '/DevDesh/backgrounds/';

export const BACKGROUNDS: BackgroundDef[] = [
  { id: 'redgate-dark-geo', label: 'Dark Geometric', file: `${BASE}redgate-dark-geo.jpg` },
  { id: 'redgate-dark-gradient', label: 'Dark Gradient', file: `${BASE}redgate-dark-gradient.jpg` },
  { id: 'glass-colorful', label: 'Colorful Gradient', file: `${BASE}glass-colorful-gradient.jpg` },
  { id: 'glass-aurora', label: 'Aurora', file: `${BASE}glass-aurora.jpg` },
  { id: 'metro-geometric', label: 'Bold Geometric', file: `${BASE}metro-bold-geometric.jpg` },
  { id: 'metro-vibrant', label: 'Vibrant Abstract', file: `${BASE}metro-vibrant-abstract.jpg` },
  { id: 'fluent-bloom', label: 'Blue Bloom', file: `${BASE}fluent-blue-bloom.jpg` },
  { id: 'fluent-flow', label: 'Light Flow', file: `${BASE}fluent-light-flow.jpg` },
  { id: 'win95-clouds', label: 'Clouds', file: `${BASE}win95-clouds.jpg` },
  { id: 'win95-teal', label: 'Teal Retro', file: `${BASE}win95-teal-retro.jpg` },
  { id: 'win95-vaporwave', label: 'Vaporwave', file: `${BASE}win95-vaporwave.jpg` },
  { id: 'winxp-bliss', label: 'Bliss', file: `${BASE}winxp-bliss.jpg` },
  { id: 'general-mountain', label: 'Mountain Landscape', file: `${BASE}general-mountain-landscape.jpg` },
  { id: 'macos9-classic', label: 'Mac OS 9', file: `${BASE}macos9-classic.jpg` },
  { id: 'aqua-blue', label: 'Aqua Blue', file: `${BASE}aqua-blue.jpg` },
  { id: 'vista-aurora', label: 'Vista Aurora', file: `${BASE}vista-aurora.jpg` },
  { id: 'cyberpunk-neon', label: 'Neon City', file: `${BASE}cyberpunk-neon.jpg` },
  { id: 'general-space', label: 'Space Galaxy', file: `${BASE}general-space-galaxy.jpg` },
  { id: 'general-minimalist', label: 'Minimalist Gradient', file: `${BASE}general-minimalist-gradient.jpg` },
];

/** Default background for each theme (applied when switching themes) */
export const THEME_DEFAULT_BACKGROUND: Record<ThemeName, string> = {
  redgate: '',
  glass: 'glass-colorful',
  metro: '',
  fluent: 'fluent-bloom',
  win95: 'win95-clouds',
  winxp: 'winxp-bliss',
  macos9: 'macos9-classic',
  aqua: 'aqua-blue',
  vista: 'vista-aurora',
  cyberpunk: 'cyberpunk-neon',
};

export function getBackgroundById(id: string): BackgroundDef | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}
