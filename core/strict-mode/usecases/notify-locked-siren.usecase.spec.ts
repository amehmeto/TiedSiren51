import { beforeEach, describe, it, expect } from 'vitest'
import { AppStore } from '@/core/_redux_/createStore'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilderProvider } from '@/core/_tests_/state-builder'
import { StubDateProvider } from '@/infra/date-provider/stub.date-provider'
import { notifyLockedSiren } from './notify-locked-siren.usecase'

describe('notifyLockedSiren use case', () => {
  let store: AppStore
  const dateProvider = new StubDateProvider()

  beforeEach(() => {
    dateProvider.now = new Date('2024-01-01T00:00:00.000Z')
  })

  it('should show a toast with the time remaining', async () => {
    const testStateBuilder = stateBuilderProvider()
    testStateBuilder.setState((builder) =>
      builder.withStrictModeEndedAt('2024-01-01T01:30:00.000Z'),
    )
    store = createTestStore({ dateProvider }, testStateBuilder.getState())

    await store.dispatch(notifyLockedSiren())

    const message = store.getState().toast.message
    expect(message).toBe('Locked (1 hour, 30 minutes left)')
  })

  it('should show "0 minutes" when timer has just expired', async () => {
    const testStateBuilder = stateBuilderProvider()
    testStateBuilder.setState((builder) =>
      builder.withStrictModeEndedAt('2024-01-01T00:00:00.000Z'),
    )
    store = createTestStore({ dateProvider }, testStateBuilder.getState())

    await store.dispatch(notifyLockedSiren())

    const message = store.getState().toast.message
    expect(message).toBe('Locked (0 minutes left)')
  })
})
