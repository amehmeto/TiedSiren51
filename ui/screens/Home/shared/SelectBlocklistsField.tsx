import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { T } from '@/ui/design-system/theme'
import { BlocklistsModal } from '@/ui/screens/Home/shared/BlocklistsModal'

type SelectBlocklistsFieldFields = {
  blocklistIds: string[]
  setFieldValue: (field: string, value: string[]) => void
}

type SelectBlocklistsFieldProps = Readonly<SelectBlocklistsFieldFields>

export function SelectBlocklistsField({
  blocklistIds,
  setFieldValue,
}: SelectBlocklistsFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const blocklists = useSelector(selectAllBlocklists)
  const displayText =
    blocklistIds.length === 0
      ? 'Select blocklists...'
      : blocklists
          .filter((bl) => blocklistIds.includes(bl.id))
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
        currentSelections={blocklistIds}
        onRequestClose={() => setIsModalOpen(false)}
        setFieldValue={setFieldValue}
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
