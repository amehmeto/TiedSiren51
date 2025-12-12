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
      backgroundColor: '#0C207A',
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
        backgroundColor: '#0C207A',
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
      'expo-apple-authentication',
      'expo-router',
      './plugins/withForegroundService.cjs',
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
