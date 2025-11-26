import { beforeEach, describe, it } from 'vitest'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { timerFixture } from './timer.fixture'

describe('stopTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should clear timer from repository and store', async () => {
    fixture.given.existingTimer(buildTimer({}))

    await fixture.when.stoppingTimer()

    fixture.then.timerShouldBeCleared()
    await fixture.then.timerShouldNotBeInRepository()
  })

  it('should reject when user is not authenticated', async () => {
    const action = await fixture.when.stoppingTimer()

    fixture.then.actionShouldBeRejectedWith(action, 'User not authenticated')
  })

  it('should succeed when no timer exists', async () => {
    fixture.given.noTimer()

    await fixture.when.stoppingTimer()

    fixture.then.timerShouldBeCleared()
    await fixture.then.timerShouldNotBeInRepository()
  })
})
