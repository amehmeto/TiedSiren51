import * as ExpoDevice from 'expo-device'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { FlatList, StyleSheet, Switch, Text, View } from 'react-native'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
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
  const router = useRouter()

  const availableItems =
    props.listType === 'devices'
      ? [
          ...new Map(
            [currentDevice, ...props.items].map((item) => [item.id, item]),
          ).values(),
        ]
      : props.items

  const [selectedItems, setSelectedItems] = useState<(Blocklist | Device)[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedItems((currentItems) => {
      if (props.listType === 'devices') {
        const uniqueSelections = new Map(
          [...currentItems, currentDevice].map((item) => [item.id, item]),
        )
        return Array.from(uniqueSelections.values())
      }

      return []
    })
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
        {props.items.length === 0 && props.listType !== 'devices' && (
          <Text style={styles.itemText}>No {props.listType} available</Text>
        )}

        <FlatList
          data={availableItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
              <Switch
                accessibilityLabel={`Toggle ${item.name}`}
                style={styles.itemSelector}
                value={isSelected(item)}
                onValueChange={toggleList(item)}
              />
            </View>
          )}
        />
        {props.listType === 'blocklists' && props.items.length === 0 ? (
          <TiedSButton
            style={styles.button}
            onPress={() => {
              router.push('/(tabs)/blocklists/create-blocklist-screen')
              props.onRequestClose()
            }}
            text={'CREATE BLOCKLIST'}
          />
        ) : (
          <TiedSButton style={styles.button} onPress={saveList} text={'SAVE'} />
        )}
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
