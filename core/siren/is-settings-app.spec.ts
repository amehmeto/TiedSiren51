import { describe, expect, it } from 'vitest'
import { isSettingsApp } from './is-settings-app'

describe('isSettingsApp', () => {
  it('returns true for com.android.settings', () => {
    const isSettings = isSettingsApp('com.android.settings')
    expect(isSettings).toBe(true)
  })

  it('returns true for com.samsung.android.settings', () => {
    const isSettings = isSettingsApp('com.samsung.android.settings')
    expect(isSettings).toBe(true)
  })

  it('returns false for other packages', () => {
    const isSettings = isSettingsApp('com.example.app')
    expect(isSettings).toBe(false)
  })

  it('returns false for partial matches', () => {
    const isSettings = isSettingsApp('com.android.settings.backup')
    expect(isSettings).toBe(false)
  })
})
