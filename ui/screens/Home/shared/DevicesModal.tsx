import * as ExpoDevice from 'expo-device'
import { useState } from 'react'
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { Device } from '@/core/device/device'
import { showToast } from '@/core/toast/toast.slice'
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
  items: Device[]
  lockedIds?: string[]
}>

export function DevicesModal({
  isVisible,
  currentSelections,
  onRequestClose,
  setFieldValue,
  items,
  lockedIds = [],
}: DevicesModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [wasVisible, setWasVisible] = useState(isVisible)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    currentSelections.map((d) => d.id),
  )

  const availableItems = [
    ...new Map([currentDevice, ...items].map((d) => [d.id, d])).values(),
  ]

  if (isVisible && !wasVisible) {
    setWasVisible(true)
    setSelectedIds(currentSelections.map((d) => d.id))
  }
  if (!isVisible && wasVisible) setWasVisible(false)

  const saveList = () => {
    const selectedDevices = availableItems.filter((d) =>
      selectedIds.includes(d.id),
    )
    setFieldValue('devices', selectedDevices)
    onRequestClose()
  }

  function toggleItem(itemId: string, isNowSelected: boolean) {
    if (!isNowSelected && lockedIds.includes(itemId)) {
      dispatch(showToast('Cannot remove device during strict mode'))
      return
    }
    const newSelections = isNowSelected
      ? [...selectedIds, itemId]
      : selectedIds.filter((id) => id !== itemId)
    setSelectedIds(newSelections)
  }

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={onRequestClose}>
      <View>
        <FlatList
          data={availableItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isItemSelected = selectedIds.includes(item.id)
            const isLocked = isItemSelected && lockedIds.includes(item.id)
            return (
              <View style={styles.item}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Switch
                  accessibilityLabel={`Toggle ${item.name}`}
                  style={styles.itemSelector}
                  value={isItemSelected}
                  disabled={isLocked}
                  onValueChange={(isNowSelected) =>
                    toggleItem(item.id, isNowSelected)
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
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    padding: T.spacing.small,
  },
  itemText: { color: T.color.text },
  button: {
    alignSelf: 'center',
    marginTop: T.spacing.medium,
  },
  itemSelector: { marginLeft: T.spacing.medium },
})
