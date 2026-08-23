export const gradient = {
  colors: ["#3b0d1a", "#8a2f66", "#5b3a91", "#2c2456", "#0e0b1a", "#020103"] as const,
  locations: [0, 0.2, 0.4, 0.6, 0.8, 1] as const,
  start: { x: 0.05, y: 0.05 },
  end: { x: 0.95, y: 0.95 },
};

export const colors = {
  textPrimary: "#f5f3f7",
  textSecondary: "#c9c2d9",
  textMuted: "#8a8299",
  accent: "#b356d8",
  urgent: "#ff6b81",
  danger: "#ff6b81",
  border: "rgba(255,255,255,0.12)",
  surface: "rgba(255,255,255,0.06)",
  panel: "rgba(0,0,0,0.28)",
  sidebar: "rgba(0,0,0,0.38)",
  overlayPanel: "rgba(18,12,26,0.97)",
  backdrop: "rgba(0,0,0,0.35)",
};
