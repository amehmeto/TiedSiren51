// This file is .js (not .ts) because app.config.ts imports it, and Expo
// evaluates that config in Node.js which cannot resolve .ts imports.
// See colors.spec.ts for the sync test that prevents drift with T.

/** @type {Record<string, string>} */
export const colors = {
  transparent: 'transparent',
  text: 'rgba(248, 250, 252, 1)',
  textSecondary: 'rgba(30, 41, 59, 1)',
  textMuted: 'rgba(148, 163, 184, 1)',
  darkBlue: 'rgba(8, 12, 50, 1)',
  midBlue: 'rgba(22, 33, 94, 1)',
  lightBlue: 'rgba(56, 189, 248, 1)',
  lightBlueShade: 'rgba(125, 196, 232, 1)',
  purple: 'rgba(49, 46, 129, 1)',
  shadow: 'rgba(2, 6, 23, 1)',
  red: 'rgba(239, 68, 68, 1)',
  yellow: 'rgba(250, 204, 21, 1)',
  blueIconColor: 'rgba(59, 130, 246, 1)',
  modalBackgroundColor: 'rgba(2, 6, 23, 0.6)',
  modalContentColor: 'rgba(226, 232, 246, 1)',
  modalTitleColor: 'rgba(100, 116, 139, 1)',
  darkBlueGray: 'rgba(15, 23, 42, 1)',
  lightBlueOverlay: 'rgba(56, 189, 248, 0.08)',
  whiteOverlay: 'rgba(255, 255, 255, 0.1)',
  surfaceElevated: 'rgba(22, 33, 62, 1)',
  cardBackground: 'rgba(18, 28, 52, 0.92)',
  borderSubtle: 'rgba(51, 65, 85, 0.4)',
  gradientMid: 'rgba(25, 32, 95, 1)',
  inputBackground: 'rgba(15, 23, 42, 0.3)',
  white: 'rgba(255, 255, 255, 1)',
}

/** @type {Record<string, number>} */
export const borderRadius = {
  roundedSmall: 8,
  roundedMedium: 12,
  roundedLarge: 16,
  extraRounded: 20,
  fullRound: 100,
}
