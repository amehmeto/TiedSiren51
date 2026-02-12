import { beforeEach, describe, it } from 'vitest'
import { timerFixture } from './timer.fixture'

describe('notifyLockedSiren use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should show a toast with the time remaining', async () => {
    fixture.given.existingTimer('2024-01-01T01:30:00.000Z')

    await fixture.when.notifyingLockedSiren()

    fixture.then.toastShouldShow('Locked (1 hour, 30 minutes left)')
  })

  it('should show "0 minutes" when timer has just expired', async () => {
    fixture.given.existingTimer('2024-01-01T00:00:00.000Z')

    await fixture.when.notifyingLockedSiren()

    fixture.then.toastShouldShow('Locked (0 minutes left)')
  })
})
