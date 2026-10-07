export const gradient = {
  colors: ["#EAD6EE", "#A0F1EA", "#F5E6E8", "#D5E1FA"] as const,
  locations: [0, 0.3, 0.7, 1] as const,
  start: { x: 0.0, y: 0.0 },
  end: { x: 1.0, y: 1.0 },
};

export const colors = {
  brand: "#072939",
  brandMuted: "#1D4E60",
  accent: "#5E5CE6",
  accentSoft: "#7D7AFF",

  textPrimary: "#072939",
  textSecondary: "#50646F",
  textMuted: "#8B99A3",
  textOnBrand: "#FFFFFF",

  panel: "rgba(255, 255, 255, 0.55)",
  sidebar: "rgba(255, 255, 255, 0.45)",
  surface: "rgba(255, 255, 255, 0.5)",
  border: "rgba(255, 255, 255, 0.4)",
  borderStrong: "rgba(255, 255, 255, 0.7)",

  danger: "#C0392B",
  urgent: "#C0392B",
  positive: "#1F7A5C",

  overlayPanel: "rgba(255, 255, 255, 0.75)",
  backdrop: "rgba(7, 41, 57, 0.2)",
};

export const shadows = {
  sm: {
    shadowColor: "#8BA3C0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 4,
  },
  md: {
    shadowColor: "#8BA3C0",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 8,
  },
  lg: {
    shadowColor: "#8BA3C0",
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.25,
    shadowRadius: 48,
    elevation: 12,
  },
};
