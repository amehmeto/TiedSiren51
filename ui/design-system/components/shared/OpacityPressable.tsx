import React from 'react'
import type { ReactNode } from 'react'
import { Pressable } from 'react-native'
import { T } from '@/ui/design-system/theme'

type OpacityPressableOwnProps = {
  onPress: () => void
  accessibilityLabel?: string
  children: ReactNode
}

type OpacityPressableProps = Readonly<OpacityPressableOwnProps>

export function OpacityPressable({
  onPress,
  accessibilityLabel,
  children,
}: OpacityPressableProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed: isPressed }) => ({
        opacity: isPressed ? T.opacity.pressed : T.opacity.full,
      })}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  )
}
