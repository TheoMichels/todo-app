// Charte ITS4U : pétrole profond #072939 et orange #E85315, sur des surfaces majoritairement blanches.
export const gradient = {
  colors: ["#F5F8FA", "#EDF2F5", "#E3EAEF"] as const,
  locations: [0, 0.55, 1] as const,
  start: { x: 0.1, y: 0 },
  end: { x: 0.9, y: 1 },
};

export const colors = {
  brand: "#072939",
  brandMuted: "#1D4E60",
  accent: "#E85315",
  accentSoft: "#FBAE40",

  textPrimary: "#072939",
  textSecondary: "#50646F",
  textMuted: "#8B99A3",
  textOnBrand: "#FFFFFF",

  panel: "#FFFFFF",
  sidebar: "#FFFFFF",
  surface: "#F5F8FA",
  border: "#E3EAEF",
  borderStrong: "#CCD9E0",

  danger: "#C0392B",
  urgent: "#C0392B", // Mapped to danger for the todo app
  positive: "#1F7A5C",

  // Todo app specific
  overlayPanel: "#FFFFFF",
  backdrop: "rgba(7, 41, 57, 0.4)", // transparent brand color
};
