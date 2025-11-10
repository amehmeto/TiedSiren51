import { Platform } from 'react-native'

export const T = {
  color: {
    transparent: 'transparent',
    text: 'rgba(255, 255, 255, 1)',
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
    blueIconColor: 'rgba(0, 102, 255,1)',
    modalBackgroundColor: 'rgba(0, 0, 0, 0.3)',
    modalContentColor: 'rgba(240, 244, 255,1)',
    modalTitleColor: 'rgba(125, 138, 153,1)',
    darkBlueGray: '#1e293b',
  },
  font: {
    size: {
      small: 14,
      regular: 18,
      medium: 20,
      large: 24,
      xLarge: 32,
    },
    weight: {
      bold: 'bold' as const,
    },
    family: {
      primary: Platform.select({
        ios: 'Helvetica Neue',
        android: 'Roboto',
        default: 'Helvetica Neue',
      }),
    },
  },
  size: {
    tiny: 10,
    xSmall: 11,
    small: 14,
    medium: 20,
    large: 24,
  },
  spacing: {
    none: 0,
    extraExtraSmall: 2,
    extraSmall: 4,
    small: 8,
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
      thick: 2,
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
    radius: 10,
  },
  width: {
    roundButton: 60,
    chipMinWidth: 50,
    textInputHeight: 40,
    modalButton: 120,
    tiedSirenLogo: 100,
  },
  sirenIconSize: 20,
  iconProportion: 0.45,
  get addButtonIconSize() {
    return this.width.roundButton * this.iconProportion
  },
  tabBarHeight: 50,
}
