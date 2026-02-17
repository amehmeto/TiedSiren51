import * as React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type SectionDividerProps = Readonly<{
  label?: string
}>

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {label ? <View style={styles.line} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: T.spacing.small,
    paddingHorizontal: T.spacing.small,
  },
  line: {
    flex: 1,
    height: T.border.width.thin,
    backgroundColor: T.color.grey,
  },
  label: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    marginHorizontal: T.spacing.small,
  },
})
