import { describe, expect, it } from 'vitest'
import { isSettingsApp } from './is-settings-app'

describe('isSettingsApp', () => {
  it.each<[string]>([
    ['com.android.settings'],
    ['com.samsung.android.settings'],
    ['com.coloros.settings'],
    ['com.oplus.settings'],
    ['com.xiaomi.misettings'],
  ])('returns true for settings package "%s"', (packageName) => {
    expect(isSettingsApp(packageName)).toBe(true)
  })

  it.each<[string]>([
    ['com.android.chrome'],
    ['com.whatsapp'],
    ['com.android.settings.backup'],
    ['com.settings'],
  ])('returns false for non-settings package "%s"', (packageName) => {
    expect(isSettingsApp(packageName)).toBe(false)
  })
})
