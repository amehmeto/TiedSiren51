import { beforeEach, describe, it } from 'vitest'
import { TimeUnit } from '@/core/timer/timer.utils'
import { timerFixture } from './timer.fixture'

describe('loadTimer use case', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  it('should load timer from repository', async () => {
    const nowMs = fixture.dateProvider.getNowMs()
    const existingEndAt = fixture.dateProvider.msToISOString(
      nowMs + TimeUnit.HOUR,
    )

    fixture.given.existingTimer(existingEndAt)

    await fixture.when.loadingTimer()

    fixture.then.timerShouldBeLoadedAs(existingEndAt)
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
    const nowMs = fixture.dateProvider.getNowMs()
    const expiredEndAt = fixture.dateProvider.msToISOString(
      nowMs - TimeUnit.SECOND,
    )

    fixture.given.existingTimer(expiredEndAt)

    await fixture.when.loadingTimer()

    fixture.then.timerShouldBeLoadedAs(null)
  })
})
