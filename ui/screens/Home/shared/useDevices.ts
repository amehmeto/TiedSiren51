import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch } from '@/core/_redux_/createStore'
import { selectNullableAuthUserId } from '@/core/auth/selectors/selectNullableAuthUserId'
import { Device } from '@/core/device/device'
import { selectDevices } from '@/core/device/selectors/selectDevices'
import { loadDevices } from '@/core/device/usecases/load-devices.usecase'

export function useDevices(isMultiDevice: boolean): Device[] {
  const dispatch = useDispatch<AppDispatch>()
  const userId = useSelector(selectNullableAuthUserId)
  const devices = useSelector(selectDevices)

  useEffect(() => {
    if (!isMultiDevice || !userId) return
    void dispatch(loadDevices())
  }, [dispatch, isMultiDevice, userId])

  return devices
}
