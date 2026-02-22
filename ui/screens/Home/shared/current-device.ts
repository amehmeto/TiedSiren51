import * as ExpoDevice from 'expo-device'
import { Device } from '@/core/device/device'

function generateDeviceName() {
  return (
    (ExpoDevice.manufacturer ?? 'Unknown Manufacturer') +
    ' ' +
    (ExpoDevice.modelName ?? 'Unknown Device') +
    ' (this device)'
  )
}

export const currentDevice: Device = {
  id: ExpoDevice.modelId ?? 'unknown-current',
  type: ExpoDevice.deviceType?.toString() ?? 'unknown',
  name: generateDeviceName(),
}
