import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

type CloseButtonProps = {
  onClose: () => void
  iconColor?: string
  iconSize?: number
}

export function TiedSCloseButton({
  onClose,
  iconColor = T.color.white,
  iconSize = T.icon.size.large,
}: CloseButtonProps) {
  return (
    <Pressable style={styles.closeIconContainer} onPress={onClose}>
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
