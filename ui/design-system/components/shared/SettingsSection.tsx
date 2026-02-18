import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type SettingsSectionOwnProps = {
  children: React.ReactNode
  title?: string
}

type SettingsSectionProps = Readonly<SettingsSectionOwnProps>

export function SettingsSection({ children, title }: SettingsSectionProps) {
  return (
    <View style={styles.wrapper}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.card}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: T.spacing.medium,
  },
  title: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontWeight: T.font.weight.medium,
    textTransform: 'uppercase',
    marginBottom: T.spacing.small,
    marginLeft: T.spacing.extraSmall,
  },
  card: {
    backgroundColor: T.color.darkBlueGray,
    borderRadius: T.border.radius.roundedMedium,
    overflow: 'hidden',
  },
})
