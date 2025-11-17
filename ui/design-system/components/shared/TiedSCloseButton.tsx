import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

type CloseButtonProps = {
  onClose: () => void
  iconColor?: string
  iconSize?: number
  style?: StyleProp<ViewStyle>
}

export function TiedSCloseButton({
  onClose,
  iconColor = T.color.lightBlue,
  iconSize = T.icon.size.large,
  style,
}: CloseButtonProps) {
  return (
    <Pressable style={[styles.closeIconContainer, style]} onPress={onClose}>
      <Ionicons name="close" size={iconSize} color={iconColor} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  closeIconContainer: {
    position: 'absolute',
    right: T.component.size.small,
    zIndex: 1,
    backgroundColor: T.color.transparent,
    padding: T.component.size.tiny,
  },
})
