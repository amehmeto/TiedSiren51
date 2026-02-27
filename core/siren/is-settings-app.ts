export function isSettingsApp(packageName: string): boolean {
  return [
    'com.android.settings',
    'com.samsung.android.settings',
    'com.coloros.settings',
    'com.oplus.settings',
    'com.xiaomi.misettings',
  ].includes(packageName)
}
