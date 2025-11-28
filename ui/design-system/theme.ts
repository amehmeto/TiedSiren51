import { Platform } from 'react-native'

export const T = {
  color: {
    transparent: 'transparent',
    text: 'rgba(255, 255, 255, 1)',
    textSecondary: 'rgba(50, 50, 50, 1)',
    darkBlue: 'rgba(12, 32, 122, 1)',
    lightBlue: 'rgba(0, 212, 255, 1)',
    lightBlueShade: 'rgba(105, 178, 225, 1)',
    purple: 'rgba(69, 64, 196, 1)',
    inactive: 'rgba(209, 233, 248, 1)',
    shadow: 'rgba(30, 30, 30, 1)',
    white: 'rgba(255, 255, 255, 1)',
    grey: 'rgba(211, 211, 211, 1)',
    red: 'rgba(255, 0, 0, 1)',
    yellow: 'rgba(255, 255, 0, 1)',
    blueIconColor: 'rgba(0, 102, 255, 1)',
    modalBackgroundColor: 'rgba(0, 0, 0, 0.3)',
    modalContentColor: 'rgba(240, 244, 255, 1)',
    modalTitleColor: 'rgba(125, 138, 153, 1)',
    darkBlueGray: 'rgba(30, 41, 59, 1)',
  },
  font: {
    size: {
      xSmall: 11,
      small: 14,
      base: 16,
      regular: 18,
      medium: 20,
      large: 24,
      xLarge: 32,
      xxLarge: 40,
    },
    weight: {
      light: '300' as const,
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: 'bold' as const,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
    letterSpacing: {
      none: 0,
      tight: 0.5,
      normal: 1,
      wide: 2,
    },
    family: {
      primary: Platform.select({
        ios: 'Helvetica Neue',
        android: 'Roboto',
        default: 'Helvetica Neue',
      }),
    },
  },
  component: {
    size: {
      tiny: 10,
      xSmall: 11,
      small: 14,
      medium: 20,
      large: 24,
    },
    roundDot: 15,
    menuIcon: 25,
  },
  spacing: {
    negativeExtraSmall: -3,
    none: 0,
    extraExtraSmall: 2,
    extraSmall: 4,
    small: 8,
    smallMedium: 12,
    medium: 16,
    large: 20,
    x_large: 25,
    xx_large: 32,
    xxx_large: 50,
  },
  border: {
    width: {
      none: 0,
      thin: 1,
      medium: 2,
      thick: 3,
    },
    radius: {
      roundedSmall: 5,
      roundedMedium: 10,
      roundedLarge: 15,
      extraRounded: 20,
      fullRound: 100,
    },
  },
  shadow: {
    color: '#1e1e1e',
    offset: {
      width: 5,
      height: 5,
    },
    opacity: 0.1,
    radius: {
      small: 4,
      medium: 8,
      large: 10,
    },
    // Common shadow offset patterns
    offsets: {
      none: { width: 0, height: 0 },
      small: { width: 0, height: 2 },
      medium: { width: 0, height: 4 },
      large: { width: 0, height: 5 },
    },
  },
  width: {
    roundButton: 60,
    chipMinWidth: 50,
    textInputHeight: 40,
    modalButton: 120,
    tiedSirenLogo: 100,
  },
  icon: {
    size: {
      xSmall: 16,
      small: 20,
      medium: 22,
      large: 24,
      xLarge: 28,
      xxLarge: 32,
    },
  },
  opacity: {
    invisible: 0,
    pressed: 0.5,
    disabled: 0.6,
    semiTransparent: 0.9,
    full: 1,
  },
  elevation: {
    none: 0,
    low: 1,
    medium: 3,
    high: 5,
    highest: 8,
  },
  layout: {
    width: {
      full: '100%' as const,
      nineTenths: '90%' as const,
      fourFifths: '80%' as const,
      threeQuarters: '75%' as const,
      half: '50%' as const,
    },
  },
  effects: {
    blur: {
      intensity: {
        light: 30,
        medium: 60,
        strong: 90,
      },
    },
  },
  // Legacy icon size constants (kept for backward compatibility)
  sirenIconSize: 20,
  largeIconSize: 32,
  iconProportion: 0.45,
  get addButtonIconSize() {
    return this.width.roundButton * this.iconProportion
  },
  tabBarHeight: 50,
}
