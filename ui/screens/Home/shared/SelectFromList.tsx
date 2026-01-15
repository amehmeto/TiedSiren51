import { FormikErrors } from 'formik'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Blocklist } from '@/core/blocklist/blocklist'
import { Device } from '@/core/device/device'
import { T } from '@/ui/design-system/theme'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { SelectListModal } from '@/ui/screens/Home/shared/SelectListModal'

type SelectFromListProps = Readonly<{
  listType: 'blocklists' | 'devices'
  values: Session
  setFieldValue: (
    field: string,
    value: (Blocklist | Device)[],
    shouldValidate?: boolean,
  ) => Promise<void | FormikErrors<Session>>
  items: (Blocklist | Device)[]
}>

export function SelectFromList({
  values,
  setFieldValue,
  listType,
  items,
}: SelectFromListProps) {
  const [isListModelOpened, setIsListModelOpened] = useState<boolean>(false)

  function selectItemsFrom(
    list: Blocklist[] | Device[],
    listType: 'blocklists' | 'devices',
  ) {
    return list.length > 0
      ? values[listType].map((item) => item.name).join(', ')
      : `Select ${listType}...`
  }

  const capitalizedListParam =
    listType.charAt(0).toUpperCase() + listType.slice(1)

  return (
    <>
      <View style={styles.param}>
        <Text style={styles.label}>{capitalizedListParam}</Text>
        <Pressable onPress={() => setIsListModelOpened(true)}>
          <Text style={styles.option}>
            {selectItemsFrom(values[listType], listType)}
          </Text>
        </Pressable>
      </View>
      <SelectListModal
        isVisible={isListModelOpened}
        currentSelections={values[listType]}
        onRequestClose={() => setIsListModelOpened(!isListModelOpened)}
        setFieldValue={setFieldValue}
        listType={listType}
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
