export const gradient = {
  colors: ["#EAD6EE", "#A0F1EA", "#F5E6E8", "#D5E1FA"] as const,
  locations: [0, 0.35, 0.7, 1] as const,
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
    shadowColor: "#072939",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#072939",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  },
  lg: {
    shadowColor: "#072939",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 8,
  },
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 24 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
