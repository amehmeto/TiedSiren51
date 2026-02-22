import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { selectNullableAuthUserId } from '@/core/auth/selectors/selectNullableAuthUserId'
import { Device } from '@/core/device/device'
import { dependencies } from '@/ui/dependencies'

export function useDevices(isMultiDevice: boolean): Device[] {
  const userId = useSelector(selectNullableAuthUserId)
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {
    if (!isMultiDevice || !userId) return
    let isIgnored = false
    dependencies.deviceRepository.findAll(userId).then((foundDevices) => {
      if (!isIgnored) setDevices(foundDevices)
    })
    return () => {
      isIgnored = true
    }
  }, [isMultiDevice, userId])

  return devices
}
