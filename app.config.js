import { T } from './ui/design-system/theme'

const DIGITS_REGEX = /\d+/g

function rgbaToHex(rgba) {
  const [r, g, b] = rgba.match(DIGITS_REGEX).map(Number)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`
}

const darkBlue = rgbaToHex(T.color.darkBlue)
const darkBlueGray = rgbaToHex(T.color.darkBlueGray)
const lightBlue = rgbaToHex(T.color.lightBlue)
const white = rgbaToHex(T.color.white)

export default {
  expo: {
    name: 'TiedSiren51',
    slug: 'TiedSiren51',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'myapp',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain',
      backgroundColor: darkBlue,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.tiedsiren.tiedsiren',
      googleServicesFile: './GoogleService-Info.plist',
      usesAppleSignIn: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: darkBlue,
      },
      package: 'com.tiedsiren.tiedsiren',
      googleServicesFile:
        process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      permissions: [
        'QUERY_ALL_PACKAGES',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      '@prisma/react-native',
      '@react-native-google-signin/google-signin',
      [
        '@sentry/react-native/expo',
        {
          organization: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
        },
      ],
      [
        '@react-native-community/datetimepicker',
        {
          android: {
            timePicker: {
              background: { light: darkBlueGray, dark: darkBlueGray },
              headerBackground: { light: darkBlue, dark: darkBlue },
              numbersBackgroundColor: {
                light: darkBlueGray,
                dark: darkBlueGray,
              },
              numbersSelectorColor: { light: lightBlue, dark: lightBlue },
              numbersTextColor: { light: white, dark: white },
            },
          },
        },
      ],
      'expo-apple-authentication',
      'expo-router',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: 'b92a6e4e-b682-4d8a-aa5b-d3e299aa6764',
      },
    },
    owner: 'epictechtus',
  },
}
