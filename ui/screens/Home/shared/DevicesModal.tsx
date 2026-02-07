import * as ExpoDevice from 'expo-device'
import { useState } from 'react'
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import { Device } from '@/core/device/device'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { showToast } from '@/core/toast/toast.slice'
import { dependencies } from '@/ui/dependencies'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

const currentDevice: Device = {
  id: ExpoDevice.modelId ?? 'unknown-current',
  type: ExpoDevice.deviceType?.toString() ?? 'unknown',
  name: generateDeviceName(),
}

function generateDeviceName() {
  return (
    (ExpoDevice.manufacturer ?? 'Unknown Manufacturer') +
    ' ' +
    (ExpoDevice.modelName ?? 'Unknown Device') +
    ' (this device)'
  )
}

type DevicesModalProps = Readonly<{
  isVisible: boolean
  currentSelections: Device[]
  onRequestClose: () => void
  setFieldValue: (field: string, value: Device[]) => void
  devices: Device[]
}>

export function DevicesModal({
  isVisible,
  currentSelections,
  onRequestClose,
  setFieldValue,
  devices,
}: DevicesModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )
  const [wasVisible, setWasVisible] = useState(isVisible)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentSelections.map((d) => d.id),
  )
  const lockedDeviceIds = isStrictModeActive
    ? currentSelections.map((d) => d.id)
    : []

  const availableDevices = [
    ...new Map([currentDevice, ...devices].map((d) => [d.id, d])).values(),
  ]

  if (isVisible && !wasVisible) {
    setWasVisible(true)
    setSelectedIds(currentSelections.map((d) => d.id))
  }
  if (!isVisible && wasVisible) setWasVisible(false)

  const saveList = () => {
    const selectedDevices = availableDevices.filter((d) =>
      selectedIds.includes(d.id),
    )
    setFieldValue('devices', selectedDevices)
    onRequestClose()
  }

  function toggleDevice(deviceId: string, isNowSelected: boolean) {
    if (!isNowSelected && lockedDeviceIds.includes(deviceId)) {
      dispatch(showToast('Cannot remove device during strict mode'))
      return
    }
    const newSelections = isNowSelected
      ? [...selectedIds, deviceId]
      : selectedIds.filter((id) => id !== deviceId)
    setSelectedIds(newSelections)
  }

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={onRequestClose}>
      <View>
        <FlatList
          data={availableDevices}
          keyExtractor={(device) => device.id}
          renderItem={({ item: device }) => {
            const isDeviceSelected = selectedIds.includes(device.id)
            return (
              <View style={styles.device}>
                <Text style={styles.deviceText}>{device.name}</Text>
                <Switch
                  accessibilityLabel={`Toggle ${device.name}`}
                  style={styles.deviceSelector}
                  value={isDeviceSelected}
                  onValueChange={(isNowSelected) =>
                    toggleDevice(device.id, isNowSelected)
                  }
                />
              </View>
            )
          }}
        />
        <TiedSButton style={styles.button} onPress={saveList} text={'SAVE'} />
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  device: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    padding: T.spacing.small,
  },
  deviceText: { color: T.color.text },
  button: {
    alignSelf: 'center',
    marginTop: T.spacing.medium,
  },
  deviceSelector: { marginLeft: T.spacing.medium },
})
