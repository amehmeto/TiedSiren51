import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { selectDevices } from '@/core/device/selectors/selectDevices'
import { FakeDataDeviceRepository } from '@/infra/device-repository/fake-data.device.repository'
import { loadDevices } from './load-devices.usecase'

const preloadedStateWithAuth = stateBuilder()
  .withAuthUser({
    id: 'test-user-id',
    email: 'test@example.com',
    isEmailVerified: true,
    authProvider: AuthProvider.Email,
  })
  .build()

describe('Feature: Loading devices', () => {
  let deviceRepository: FakeDataDeviceRepository

  beforeEach(() => {
    deviceRepository = new FakeDataDeviceRepository()
  })

  test('should load devices into the store', async () => {
    const store = createTestStore({ deviceRepository }, preloadedStateWithAuth)

    await store.dispatch(loadDevices())

    const expectedDevices = [
      { id: '1', type: 'phone', name: 'iPhone 12' },
      { id: '2', type: 'tablet', name: 'iPad Pro' },
      { id: '3', type: 'laptop', name: 'MacBook Pro' },
    ]
    const devices = selectDevices(store.getState())
    expect(devices).toStrictEqual(expectedDevices)
  })

  test('should have empty devices initially', () => {
    const store = createTestStore({ deviceRepository }, preloadedStateWithAuth)

    const expectedDevices: [] = []
    const devices = selectDevices(store.getState())
    expect(devices).toStrictEqual(expectedDevices)
  })
})
