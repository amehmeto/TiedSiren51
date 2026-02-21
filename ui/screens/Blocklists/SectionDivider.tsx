import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

export function SectionDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
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
    backgroundColor: T.color.borderSubtle,
  },
})
