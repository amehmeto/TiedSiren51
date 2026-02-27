import { beforeEach, describe, expect, test } from 'vitest'
import { createTestStore } from '@/core/_tests_/createTestStore'
import { stateBuilder } from '@/core/_tests_/state-builder'
import { TEST_AUTH_USER, TEST_USER_ID } from '@/core/_tests_/test-constants'
import { selectDevices } from '@/core/device/selectors/selectDevices'
import { FakeDataDeviceRepository } from '@/infra/device-repository/fake-data.device.repository'
import { loadDevices } from './load-devices.usecase'

const preloadedStateWithAuth = stateBuilder()
  .withAuthUser(TEST_AUTH_USER)
  .build()

describe('Feature: Loading devices', () => {
  let deviceRepository: FakeDataDeviceRepository

  beforeEach(() => {
    deviceRepository = new FakeDataDeviceRepository()
  })

  test('should load devices for the authenticated user', async () => {
    const userDevices = [
      { id: '1', type: 'phone', name: 'iPhone 12' },
      { id: '2', type: 'tablet', name: 'iPad Pro' },
    ]
    deviceRepository.feedDevicesForUser(TEST_USER_ID, userDevices)

    const store = createTestStore({ deviceRepository }, preloadedStateWithAuth)

    await store.dispatch(loadDevices())

    const devices = selectDevices(store.getState())
    expect(devices).toStrictEqual(userDevices)
  })

  test('should not load devices belonging to another user', async () => {
    deviceRepository.feedDevicesForUser('other-user-id', [
      { id: '1', type: 'phone', name: 'Other Phone' },
    ])

    const store = createTestStore({ deviceRepository }, preloadedStateWithAuth)

    await store.dispatch(loadDevices())

    const devices = selectDevices(store.getState())
    expect(devices).toStrictEqual([])
  })
})
