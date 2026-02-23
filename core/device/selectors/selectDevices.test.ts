import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { AuthProvider } from '@/core/auth/auth-user'
import { selectDevices } from '@/core/device/selectors/selectDevices'
import { FakeDataDeviceRepository } from '@/infra/device-repository/fake-data.device.repository'
import { loadDevices } from '../usecases/load-devices.usecase'

const preloadedStateWithAuth = stateBuilder()
  .withAuthUser({
    id: 'test-user-id',
    email: 'test@example.com',
    isEmailVerified: true,
    authProvider: AuthProvider.Email,
  })
  .build()

describe('selectDevices', () => {
  let deviceRepository: FakeDataDeviceRepository

  beforeEach(() => {
    deviceRepository = new FakeDataDeviceRepository()
  })

  test('should return empty list when no devices loaded', () => {
    const store = createTestStore({ deviceRepository }, preloadedStateWithAuth)

    const devices = selectDevices(store.getState())

    expect(devices).toStrictEqual([])
  })

  test('should return loaded devices', async () => {
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
})
