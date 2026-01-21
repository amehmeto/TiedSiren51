import { FormikErrors } from 'formik'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Device } from '@/core/device/device'
import { T } from '@/ui/design-system/theme'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { DevicesModal } from '@/ui/screens/Home/shared/DevicesModal'

type SelectDevicesFieldProps = Readonly<{
  values: BlockSessionFormValues
  setFieldValue: (
    field: string,
    value: Device[],
    shouldValidate?: boolean,
  ) => Promise<void | FormikErrors<BlockSessionFormValues>>
  items: Device[]
}>

export function SelectDevicesField({
  values,
  setFieldValue,
  items,
}: SelectDevicesFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectedDevices = values.devices
  const displayText =
    selectedDevices.length === 0
      ? 'Select devices...'
      : selectedDevices.map((d) => d.name).join(', ')

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>Devices</Text>
        <Pressable onPress={() => setIsModalOpen(true)}>
          <Text style={styles.option}>{displayText}</Text>
        </Pressable>
      </View>
      <DevicesModal
        isVisible={isModalOpen}
        currentSelections={selectedDevices}
        onRequestClose={() => setIsModalOpen(false)}
        setFieldValue={setFieldValue}
        items={items}
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
  },
  option: {
    color: T.color.lightBlue,
    textAlign: 'right',
  },
})
