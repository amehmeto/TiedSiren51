/**
 * Colors must stay in sync with ui/design-system/theme.ts
 * - darkBlue:     T.color.darkBlue     = rgba(12, 32, 122, 1)
 * - darkBlueGray: T.color.darkBlueGray = rgba(30, 41, 59, 1)
 * - lightBlue:    T.color.lightBlue    = rgba(0, 212, 255, 1)
 * - white:        T.color.white        = rgba(255, 255, 255, 1)
 */
const DARK_BLUE = '#0C207A'
const DARK_BLUE_GRAY = '#1E293B'
const LIGHT_BLUE = '#00D4FF'
const WHITE = '#FFFFFF'

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
      backgroundColor: DARK_BLUE,
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
        backgroundColor: DARK_BLUE,
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
            datePicker: {
              colorAccent: { light: LIGHT_BLUE, dark: LIGHT_BLUE },
              textColorPrimary: { light: WHITE, dark: WHITE },
            },
            timePicker: {
              background: { light: DARK_BLUE_GRAY, dark: DARK_BLUE_GRAY },
              headerBackground: { light: DARK_BLUE, dark: DARK_BLUE },
              numbersBackgroundColor: {
                light: DARK_BLUE_GRAY,
                dark: DARK_BLUE_GRAY,
              },
              numbersSelectorColor: { light: LIGHT_BLUE, dark: LIGHT_BLUE },
              numbersTextColor: { light: WHITE, dark: WHITE },
            },
          },
        },
      ],
      './ui/screens/Home/shared/withTimePickerDarkTheme.cjs',
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
