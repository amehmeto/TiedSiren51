export function isSettingsApp(packageName: string): boolean {
  return ['com.android.settings', 'com.samsung.android.settings'].includes(
    packageName,
  )
}
