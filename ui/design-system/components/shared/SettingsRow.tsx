import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { OpacityPressable } from '@/ui/design-system/components/shared/OpacityPressable'
import { T } from '@/ui/design-system/theme'

type SettingsRowOwnProps = {
  label: string
  icon?: keyof typeof Ionicons.glyphMap
  value?: string
  hasChevron?: boolean
  onPress?: () => void
  labelColor?: string
  hasDivider?: boolean
  accessibilityLabel?: string
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
  accessibilityLabel,
}: SettingsRowProps) {
  const content = (
    <>
      <View style={styles.row}>
        {icon && (
          <Ionicons
            name={icon}
            size={T.icon.size.medium}
            color={labelColor}
            style={styles.icon}
          />
        )}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        <View style={styles.rightAccessory}>
          {value && <Text style={styles.value}>{value}</Text>}
          {hasChevron && (
            <Ionicons
              name="chevron-forward"
              size={T.icon.size.small}
              color={T.color.grey}
            />
          )}
        </View>
      </View>
      {hasDivider && <View style={styles.divider} />}
    </>
  )

  return onPress ? (
    <OpacityPressable onPress={onPress} accessibilityLabel={accessibilityLabel}>
      {content}
    </OpacityPressable>
  ) : (
    <View accessibilityLabel={accessibilityLabel}>{content}</View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: T.spacing.smallMedium,
    paddingHorizontal: T.spacing.medium,
    minHeight: T.height.settingsRow,
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
