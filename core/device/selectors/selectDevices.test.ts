import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { TEST_AUTH_USER, TEST_USER_ID } from '@/core/_tests_/test-constants'
import { selectDevices } from '@/core/device/selectors/selectDevices'
import { FakeDataDeviceRepository } from '@/infra/device-repository/fake-data.device.repository'
import { loadDevices } from '../usecases/load-devices.usecase'

const preloadedStateWithAuth = stateBuilder()
  .withAuthUser(TEST_AUTH_USER)
  .build()

const fakeDevices = [
  { id: '1', type: 'phone', name: 'iPhone 12' },
  { id: '2', type: 'tablet', name: 'iPad Pro' },
  { id: '3', type: 'laptop', name: 'MacBook Pro' },
]

describe('selectDevices', () => {
  let deviceRepository: FakeDataDeviceRepository

  beforeEach(() => {
    deviceRepository = new FakeDataDeviceRepository()
    deviceRepository.feedDevicesForUser(TEST_USER_ID, fakeDevices)
  })

  test('should return empty list when no devices loaded', () => {
    const store = createTestStore({ deviceRepository }, preloadedStateWithAuth)

    const devices = selectDevices(store.getState())

    expect(devices).toStrictEqual([])
  })

  test('should return loaded devices', async () => {
    const store = createTestStore({ deviceRepository }, preloadedStateWithAuth)

    await store.dispatch(loadDevices())

    const devices = selectDevices(store.getState())
    expect(devices).toStrictEqual(fakeDevices)
  })
})
