// Learn more https://docs.expo.io/guides/customizing-metro
const { getSentryExpoConfig } = require('@sentry/react-native/metro')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getSentryExpoConfig(__dirname)
config.resolver.sourceExts.push('cjs')
config.resolver.unstable_enablePackageExports = false

module.exports = config
