export const gradient = {
  colors: ["#EAD6EE", "#A0F1EA", "#F5E6E8", "#D5E1FA"] as const,
  locations: [0, 0.3, 0.7, 1] as const,
  start: { x: 0.0, y: 0.0 },
  end: { x: 1.0, y: 1.0 },
};

export const colors = {
  // Brand
  brand: "#072939",
  brandMuted: "#1D4E60",

  // Primary & accents
  primary: "#5E5CE6",
  primaryLight: "#7D7AFF",
  primarySoft: "#EEF0FF",
  primaryBackground: "#F5F5FF",

  // Text
  textPrimary: "#072939",
  textSecondary: "#50646F",
  textMuted: "#8B99A3",
  textOnBrand: "#FFFFFF",

  // Glassmorphic surfaces & panels
  panel: "rgba(255, 255, 255, 0.55)",
  panelSubtle: "rgba(255, 255, 255, 0.45)",
  surface: "rgba(255, 255, 255, 0.50)",
  surfaceActive: "#FFFFFF",
  border: "rgba(255, 255, 255, 0.40)",
  borderStrong: "rgba(255, 255, 255, 0.70)",
  divider: "rgba(7, 41, 57, 0.08)",

  // Status & Highlights
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  danger: "#C0392B",
  dangerSoft: "#FEE2E2",
  positive: "#1F7A5C",
  positiveSoft: "#D1FAE5",

  // Modal backdrop
  backdrop: "rgba(7, 41, 57, 0.20)",

  // Backward-compatibility aliases
  accent: "#5E5CE6",
  accentSoft: "#7D7AFF",
  urgent: "#C0392B",
  overlayPanel: "rgba(255, 255, 255, 0.75)",
  sidebar: "rgba(255, 255, 255, 0.45)",
};

export const shadows = {
  sm: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  md: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  lg: {
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 24 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

// Fonds opaques pour conserver le contraste des noms de section.
export const sectionBadgeColors = [
  "#DCEBFA", "#E8DDF8", "#D7F1E5", "#FCE4CF", "#F9DEE8", "#E8EBCB", "#D7EFF1", "#F2E3D5",
  "#DDE2FF", "#F4DEF8", "#D8F2D0", "#FFF0C9", "#FADBD5", "#E2E6D4", "#CDEBE6", "#EFE0CC",
];

// Le tri rend l’attribution indépendante de l’ordre de chargement des sections.
export function sectionBadgeColorsById(ids: string[]): Record<string, string> {
  const assigned: Record<string, string> = {};
  [...new Set(ids)].sort().forEach((id, index) => {
    assigned[id] = sectionBadgeColors[index % sectionBadgeColors.length];
  });
  return assigned;
}
