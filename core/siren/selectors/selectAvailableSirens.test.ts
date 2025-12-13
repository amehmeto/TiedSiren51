import { describe, expect, test } from 'vitest'
import { buildSirens } from '@/core/_tests_/data-builders/sirens.builder'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { selectAvailableSirens } from './selectAvailableSirens'

describe('selectAvailableSirens', () => {
  test('should return available sirens', () => {
    const sirens = buildSirens({
      websites: ['facebook.com', 'twitter.com'],
      keywords: ['social'],
    })
    const state = stateBuilder().withAvailableSirens(sirens).build()

    const result = selectAvailableSirens(state)

    expect(result.websites).toContain('facebook.com')
    expect(result.websites).toContain('twitter.com')
    expect(result.keywords).toContain('social')
  })

  test('should return empty sirens when none are set', () => {
    const state = stateBuilder().build()

    const result = selectAvailableSirens(state)

    expect(result).toBeDefined()
  })
})
