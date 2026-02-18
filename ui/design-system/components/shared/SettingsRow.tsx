import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type SettingsRowOwnProps = {
  label: string
  icon?: keyof typeof Ionicons.glyphMap
  value?: string
  hasChevron?: boolean
  onPress?: () => void
  labelColor?: string
  hasDivider?: boolean
}

type SettingsRowProps = Readonly<SettingsRowOwnProps>

export function SettingsRow({
  label,
  icon,
  value,
  hasChevron = false,
  onPress,
  labelColor = T.color.text,
  hasDivider = false,
}: SettingsRowProps) {
  const content = (
    <>
      <View style={styles.row}>
        {icon ? (
          <Ionicons
            name={icon}
            size={T.icon.size.medium}
            color={labelColor}
            style={styles.icon}
          />
        ) : null}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <View style={styles.rightAccessory}>
          {value ? <Text style={styles.value}>{value}</Text> : null}
          {hasChevron ? (
            <Ionicons
              name="chevron-forward"
              size={T.icon.size.small}
              color={T.color.grey}
            />
          ) : null}
        </View>
      </View>
      {hasDivider ? <View style={styles.divider} /> : null}
    </>
  )

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed: isPressed }) => ({
          opacity: isPressed ? T.opacity.pressed : T.opacity.full,
        })}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    )
  }

  return <View>{content}</View>
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: T.spacing.smallMedium,
    paddingHorizontal: T.spacing.medium,
    minHeight: T.width.settingsRowMinHeight,
  },
  icon: {
    marginRight: T.spacing.smallMedium,
  },
  label: {
    fontSize: T.font.size.base,
    flex: 1,
  },
  rightAccessory: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    color: T.color.grey,
    fontSize: T.font.size.base,
    marginRight: T.spacing.small,
  },
  divider: {
    height: T.border.width.thin,
    backgroundColor: T.color.grey,
    opacity: T.opacity.divider,
    marginLeft: T.spacing.medium,
  },
})
