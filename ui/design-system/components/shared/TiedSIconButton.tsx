import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

type TiedSIconButtonProps = Readonly<{
  iconName: keyof typeof Ionicons.glyphMap
  onPress: () => void
  isDisabled?: boolean
  iconSize?: number
}>

export function TiedSIconButton({
  iconName,
  onPress,
  isDisabled = false,
  iconSize = T.icon.size.large,
}: TiedSIconButtonProps) {
  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.container,
        isDisabled && styles.disabled,
        {
          opacity:
            isPressed && !isDisabled ? T.opacity.pressed : T.opacity.full,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <Ionicons
        name={iconName}
        size={iconSize}
        color={isDisabled ? T.color.grey : T.color.white}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: T.width.iconButton,
    height: T.width.iconButton,
    borderRadius: T.border.radius.fullRound,
    backgroundColor: T.color.darkBlueGray,
    borderWidth: T.border.width.thin,
    borderColor: T.color.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    borderColor: T.color.grey,
    opacity: T.opacity.disabled,
  },
})
