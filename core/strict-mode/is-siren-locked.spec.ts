import { describe, expect, test } from 'vitest'
import { buildLockedSirens } from '@/core/_tests_/data-builders/locked-sirens.builder'
import { isSirenLocked } from '@/core/strict-mode/is-siren-locked'

describe('isSirenLocked', () => {
  test.each([
    {
      scenario: 'android siren is locked',
      lockedSirens: buildLockedSirens({ android: new Set(['com.app1']) }),
      sirenType: 'android' as const,
      sirenId: 'com.app1',
      isExpectedLocked: true,
    },
    {
      scenario: 'android siren is not locked',
      lockedSirens: buildLockedSirens({ android: new Set(['com.app1']) }),
      sirenType: 'android' as const,
      sirenId: 'com.app2',
      isExpectedLocked: false,
    },
    {
      scenario: 'website siren is locked',
      lockedSirens: buildLockedSirens({ websites: new Set(['example.com']) }),
      sirenType: 'websites' as const,
      sirenId: 'example.com',
      isExpectedLocked: true,
    },
    {
      scenario: 'website siren is not locked',
      lockedSirens: buildLockedSirens({ websites: new Set(['example.com']) }),
      sirenType: 'websites' as const,
      sirenId: 'other.com',
      isExpectedLocked: false,
    },
    {
      scenario: 'keyword siren is locked',
      lockedSirens: buildLockedSirens({ keywords: new Set(['social']) }),
      sirenType: 'keywords' as const,
      sirenId: 'social',
      isExpectedLocked: true,
    },
    {
      scenario: 'keyword siren is not locked',
      lockedSirens: buildLockedSirens({ keywords: new Set(['social']) }),
      sirenType: 'keywords' as const,
      sirenId: 'other',
      isExpectedLocked: false,
    },
  ])(
    'should return $isExpectedLocked when $scenario',
    ({ lockedSirens, sirenType, sirenId, isExpectedLocked }) => {
      const isLocked = isSirenLocked(lockedSirens, sirenType, sirenId)

      expect(isLocked).toBe(isExpectedLocked)
    },
  )

  test('should return false when lockedSirens is undefined', () => {
    const isLocked = isSirenLocked(undefined, 'android', 'com.app1')

    expect(isLocked).toBe(false)
  })

  test.each([{ sirenType: 'ios' as const }, { sirenType: 'windows' as const }])(
    'should return false for unsupported siren type $sirenType',
    ({ sirenType }) => {
      const lockedSirens = buildLockedSirens()

      const isLocked = isSirenLocked(lockedSirens, sirenType, 'something')

      expect(isLocked).toBe(false)
    },
  )
})
