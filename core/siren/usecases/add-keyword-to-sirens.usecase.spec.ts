import { describe, it, beforeEach } from 'vitest'
import { buildSirens } from '@/core/_tests_/data-builders/sirens.builder'
import { sirensFixture } from './sirens.fixture'

describe('Feature: Adding keyword to sirens', () => {
  let fixture: ReturnType<typeof sirensFixture>

  beforeEach(() => {
    fixture = sirensFixture()
  })

  it('should add keyword to sirens', async () => {
    const initialSirens = buildSirens({
      keywords: ['mma', 'ufc'],
    })
    fixture.given.existingAvailableSirens(initialSirens)

    await fixture.when.addingKeywordToSirens('boxe')

    const sirensWithAddedKeyword = buildSirens({
      ...initialSirens,
      keywords: [...initialSirens.keywords, 'boxe'],
    })
    fixture.then.availableSirensShouldBeStoredAs(sirensWithAddedKeyword)
    await fixture.then.keywordShouldBeSaved('boxe')
  })
})
