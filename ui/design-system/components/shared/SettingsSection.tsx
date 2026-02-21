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
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: T.spacing.medium,
  },
  title: {
    color: T.color.textMuted,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.medium,
    textTransform: 'uppercase',
    letterSpacing: T.font.letterSpacing.wide,
    marginBottom: T.spacing.small,
    marginLeft: T.spacing.extraSmall,
  },
  card: {
    backgroundColor: T.color.surfaceElevated,
    borderRadius: T.border.radius.roundedMedium,
    overflow: 'hidden',
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
})
