import { beforeEach, describe, it, vi } from 'vitest'
import {
  buildTimer,
  timerWithRemainingTime,
} from '@/core/_tests_/data-builders/timer.builder'
import { TimeUnit } from '@/core/timer/timer.utils'
import { timerFixture } from './timer.fixture'

describe('Feature: Timer', () => {
  let fixture: ReturnType<typeof timerFixture>

  beforeEach(() => {
    fixture = timerFixture()
  })

  describe('loadTimer', () => {
    it('should load timer from repository', async () => {
      const existingTimer = timerWithRemainingTime.oneHour()

      fixture.given.existingTimer(existingTimer)

      await fixture.when.loadingTimer()

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
  })

  describe('startTimer', () => {
    it('should start a timer with given duration', async () => {
      fixture.given.authenticatedUser()

      const now = Date.now()
      const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(now)

      const expectedDuration = TimeUnit.HOUR + TimeUnit.MINUTE * 30

      await fixture.when.startingTimer({ days: 0, hours: 1, minutes: 30 })

      fixture.then.timerShouldBeStoredAs({
        endTime: now + expectedDuration,
        duration: expectedDuration,
        isActive: true,
      })

      dateNowSpy.mockRestore()
    })

    it.each([
      {
        description: 'duration is zero',
        payload: { days: 0, hours: 0, minutes: 0 },
      },
      {
        description: 'duration is negative',
        payload: { days: -1, hours: 0, minutes: 0 },
      },
    ])('should reject when $description', async ({ payload }) => {
      fixture.given.authenticatedUser()

      const action = await fixture.when.startingTimer(payload)

      fixture.then.actionShouldBeRejectedWith(action, 'Invalid timer duration')
    })

    it('should reject when user is not authenticated', async () => {
      const action = await fixture.when.startingTimer({
        days: 0,
        hours: 1,
        minutes: 0,
      })

      fixture.then.actionShouldBeRejectedWith(action, 'User not authenticated')
    })

    it('should replace existing timer when starting a new one', async () => {
      fixture.given.authenticatedUser()

      const now = Date.now()
      const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(now)

      const existingTimer = timerWithRemainingTime.oneHour()
      fixture.given.existingTimer(existingTimer)

      const newDuration = TimeUnit.MINUTE * 30
      await fixture.when.startingTimer({ days: 0, hours: 0, minutes: 30 })

      fixture.then.timerShouldBeStoredAs({
        endTime: now + newDuration,
        duration: newDuration,
        isActive: true,
      })

      dateNowSpy.mockRestore()
    })
  })

  describe('stopTimer', () => {
    it('should clear timer from repository and store', async () => {
      const existingTimer = timerWithRemainingTime.oneHour()

      fixture.given.existingTimer(existingTimer)

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

  describe('extendTimer', () => {
    it('should extend an active timer', async () => {
      const now = Date.now()
      const dateNowSpy = vi.spyOn(Date, 'now').mockReturnValue(now)

      const initialDuration = TimeUnit.HOUR
      const additionalDuration = TimeUnit.MINUTE * 30
      const expectedDuration = initialDuration + additionalDuration

      const existingTimer = buildTimer({
        endTime: now + initialDuration,
        duration: initialDuration,
        isActive: true,
      })

      fixture.given.existingTimer(existingTimer)

      await fixture.when.extendingTimer({ days: 0, hours: 0, minutes: 30 })

      fixture.then.timerShouldBeStoredAs({
        endTime: now + expectedDuration,
        duration: expectedDuration,
        isActive: true,
      })

      dateNowSpy.mockRestore()
    })

    it.each([
      {
        description: 'no active timer exists',
        setup: () => {
          fixture.given.noTimer()
        },
      },
      {
        description: 'timer is not active',
        setup: () => {
          const inactiveTimer = timerWithRemainingTime.inactive()
          fixture.given.existingTimer(inactiveTimer)
        },
      },
    ])('should reject when $description', async ({ setup }) => {
      setup()

      const action = await fixture.when.extendingTimer({
        days: 0,
        hours: 0,
        minutes: 30,
      })

      fixture.then.actionShouldBeRejectedWith(
        action,
        'No active timer to extend',
      )
    })

    it('should reject when user is not authenticated', async () => {
      const action = await fixture.when.extendingTimer({
        days: 0,
        hours: 0,
        minutes: 30,
      })

      fixture.then.actionShouldBeRejectedWith(action, 'User not authenticated')
    })
  })
})
