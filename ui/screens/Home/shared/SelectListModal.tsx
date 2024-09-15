import { FlatList, StyleSheet, Switch, Text, View } from 'react-native'
import { T } from '../../../design-system/theme.ts'
import { useEffect, useState } from 'react'
import { TiedSButton } from '../../../design-system/components/TiedSButton.tsx'
import { TiedSModal } from '../../../design-system/components/TiedSModal.tsx'
import { Blocklist } from '../../../../core/blocklist/blocklist.ts'
import { Device } from '../../../../core/device/device.ts'
import * as ExpoDevice from 'expo-device'

const currentDevice: Device = {
  id: ExpoDevice.modelId ?? 'unknown',
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

export function SelectListModal(
  props: Readonly<{
    visible: boolean
    list: (Blocklist | Device)[]
    listType: 'blocklists' | 'devices'
    onRequestClose: () => void
    setFieldValue: (field: string, value: (Blocklist | Device)[]) => void
    items: (Blocklist | Device)[]
  }>,
) {
  const availableItems =
    props.listType === 'devices' ? [currentDevice, ...props.items] : props.items
  const [selectedItems, setSelectedItems] = useState<(Blocklist | Device)[]>(
    props.listType === 'devices' ? [currentDevice] : [],
  )

  useEffect(() => {
    setSelectedItems(props.listType === 'devices' ? [currentDevice] : [])
  }, [props.listType])

  const saveList = () => {
    props.setFieldValue(props.listType, selectedItems)
    props.onRequestClose()
  }

  function toggleList(item: Blocklist | Device) {
    return (isSelected: boolean) => {
      const newSelections: (Blocklist | Device)[] = isSelected
        ? [...selectedItems, item]
        : selectedItems.filter((_item) => _item.id !== item.id)
      setSelectedItems(newSelections)
    }
  }

  function isSelected(item: Blocklist | Device) {
    return selectedItems.some((selectedItem) => selectedItem.id === item.id)
  }

  return (
    <TiedSModal isVisible={props.visible} onRequestClose={props.onRequestClose}>
      <View>
        {props.items.length === 0 && (
          <Text style={styles.itemText}>No {props.listType} available</Text>
        )}

        <FlatList
          data={availableItems}
          renderItem={({ item }) => (
            <View key={item.id} style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Switch
                style={styles.itemSelector}
                value={isSelected(item)}
                onValueChange={toggleList(item)}
              />
            </View>
          )}
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
