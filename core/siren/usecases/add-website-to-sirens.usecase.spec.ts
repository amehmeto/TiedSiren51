import { describe, it, beforeEach } from 'vitest'
import { buildSirens } from '../../_tests_/data-builders/sirens.builder'
import { sirensFixture } from './sirens.fixture'

describe('Feature: Adding websites to sirens', () => {
  let fixture: ReturnType<typeof sirensFixture>

  beforeEach(() => {
    fixture = sirensFixture()
  })

  it('should add website to sirens', async () => {
    const initialSirens = buildSirens({
      websites: ['facebook.com', 'youtube.com'],
    })
    fixture.given.existingAvailableSirens(initialSirens)

    await fixture.when.addingWebsiteToSirens('jeuxvideos.fr')

    fixture.then.availableSirensShouldBeStoredAs(
      buildSirens({
        ...initialSirens,
        websites: [...initialSirens.websites, 'jeuxvideos.fr'],
      }),
    )
    await fixture.then.websiteShouldBeSaved('jeuxvideos.fr')
  })
})
