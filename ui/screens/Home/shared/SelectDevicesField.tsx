import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Device } from '@/core/device/device'
import { T } from '@/ui/design-system/theme'
import { DevicesModal } from '@/ui/screens/Home/shared/DevicesModal'

type SelectDevicesFieldFields = {
  selectedDevices: Device[]
  setFieldValue: (field: string, value: Device[]) => void
  availableDevices: Device[]
}

type SelectDevicesFieldProps = Readonly<SelectDevicesFieldFields>

export function SelectDevicesField({
  selectedDevices,
  setFieldValue,
  availableDevices,
}: SelectDevicesFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const displayText =
    selectedDevices.length === 0
      ? 'Select devices...'
      : selectedDevices.map((d) => d.name).join(', ')

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>Devices</Text>
        <Pressable
          onPress={() => setIsModalOpen(true)}
          accessibilityRole="button"
        >
          <Text style={styles.option}>{displayText}</Text>
        </Pressable>
      </View>
      <DevicesModal
        isVisible={isModalOpen}
        currentSelections={selectedDevices}
        onRequestClose={() => setIsModalOpen(false)}
        setFieldValue={setFieldValue}
        devices={availableDevices}
      />
    </>
  )
}

const styles = StyleSheet.create({
  param: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: T.spacing.medium,
    paddingBottom: T.spacing.medium,
    paddingLeft: T.spacing.small,
    paddingRight: T.spacing.small,
  },
  label: {
    color: T.color.text,
    fontFamily: T.font.family.medium,
    fontSize: T.font.size.base,
  },
  option: {
    color: T.color.lightBlue,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
    textAlign: 'right',
  },
})
