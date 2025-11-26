import { beforeEach, describe, it } from 'vitest'
import { buildTimer } from '@/core/_tests_/data-builders/timer.builder'
import { TimeUnit } from '@/core/timer/timer.utils'
import { timerFixture } from './timer.fixture'

describe('loadTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should load timer from repository', async () => {
    const now = fixture.dateProvider.getNow().getTime()
    const existingTimer = buildTimer({ baseTime: now })

    fixture.given.existingTimer(existingTimer)

    await fixture.when.loadingTimer(now)

    fixture.then.timerShouldBeLoadedAs(existingTimer)
  })

  it('should return null when no timer exists', async () => {
    fixture.given.noTimer()

    await fixture.when.loadingTimer()

    fixture.then.timerShouldBeLoadedAs(null)
  })

  it('should return null when user is not authenticated', async () => {
    await fixture.when.loadingTimer()

    fixture.then.timerShouldBeLoadedAs(null)
  })

  it('should clear expired timer automatically', async () => {
    const now = fixture.dateProvider.getNow().getTime()
    const expiredTimer = buildTimer({
      baseTime: now,
      endTime: now - TimeUnit.SECOND,
    })

    fixture.given.existingTimer(expiredTimer)

    await fixture.when.loadingTimer(now)

    fixture.then.timerShouldBeLoadedAs(null)
  })
})
