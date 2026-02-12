import { describe, expect, test } from 'vitest'
import { isSirenLocked } from '@/core/strict-mode/is-siren-locked'

describe('isSirenLocked', () => {
  test('should return true when android siren is locked', () => {
    const lockedSirens = {
      android: new Set(['com.app1']),
      websites: new Set<string>(),
      keywords: new Set<string>(),
    }

    const isApp1Locked = isSirenLocked(lockedSirens, 'android', 'com.app1')
    const isApp2Locked = isSirenLocked(lockedSirens, 'android', 'com.app2')

    expect(isApp1Locked).toBe(true)
    expect(isApp2Locked).toBe(false)
  })

  test('should return true when website siren is locked', () => {
    const lockedSirens = {
      android: new Set<string>(),
      websites: new Set(['example.com']),
      keywords: new Set<string>(),
    }

    const isExampleLocked = isSirenLocked(
      lockedSirens,
      'websites',
      'example.com',
    )
    const isOtherLocked = isSirenLocked(lockedSirens, 'websites', 'other.com')

    expect(isExampleLocked).toBe(true)
    expect(isOtherLocked).toBe(false)
  })

  test('should return true when keyword siren is locked', () => {
    const lockedSirens = {
      android: new Set<string>(),
      websites: new Set<string>(),
      keywords: new Set(['social']),
    }

    const isSocialLocked = isSirenLocked(lockedSirens, 'keywords', 'social')
    const isOtherLocked = isSirenLocked(lockedSirens, 'keywords', 'other')

    expect(isSocialLocked).toBe(true)
    expect(isOtherLocked).toBe(false)
  })

  test('should return false when lockedSirens is undefined', () => {
    const isLocked = isSirenLocked(undefined, 'android', 'com.app1')

    expect(isLocked).toBe(false)
  })

  test('should return false for unsupported siren types', () => {
    const lockedSirens = {
      android: new Set<string>(),
      websites: new Set<string>(),
      keywords: new Set<string>(),
    }

    const isIosLocked = isSirenLocked(lockedSirens, 'ios', 'something')
    const isWindowsLocked = isSirenLocked(lockedSirens, 'windows', 'something')

    expect(isIosLocked).toBe(false)
    expect(isWindowsLocked).toBe(false)
  })
})
