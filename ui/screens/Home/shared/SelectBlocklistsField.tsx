import { FormikErrors } from 'formik'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Blocklist } from '@/core/blocklist/blocklist'
import { T } from '@/ui/design-system/theme'
import { BlocklistsModal } from '@/ui/screens/Home/shared/BlocklistsModal'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'

type SelectBlocklistsFieldProps = Readonly<{
  values: BlockSessionFormValues
  setFieldValue: (
    field: string,
    value: string[],
    shouldValidate?: boolean,
  ) => Promise<void | FormikErrors<BlockSessionFormValues>>
  items: Blocklist[]
  lockedIds?: string[]
}>

export function SelectBlocklistsField({
  values,
  setFieldValue,
  items,
  lockedIds = [],
}: SelectBlocklistsFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const selectedIds = values.blocklistIds
  const displayText =
    selectedIds.length === 0
      ? 'Select blocklists...'
      : items
          .filter((bl) => selectedIds.includes(bl.id))
          .map((bl) => bl.name)
          .join(', ')

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>Blocklists</Text>
        <Pressable onPress={() => setIsModalOpen(true)}>
          <Text style={styles.option}>{displayText}</Text>
        </Pressable>
      </View>
      <BlocklistsModal
        isVisible={isModalOpen}
        currentSelections={selectedIds}
        onRequestClose={() => setIsModalOpen(false)}
        setFieldValue={setFieldValue}
        items={items}
        lockedIds={lockedIds}
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
