import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { T } from '@/ui/design-system/theme'

type CloseButtonProps = {
  onClose: () => void
  iconColor?: string
  iconSize?: number
}

export function TiedSCloseButton({
  onClose,
  iconColor = T.color.blueIconColor,
  iconSize = T.size.large,
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
    top: T.size.tiny,
    right: T.size.tiny,
    zIndex: 1,
    backgroundColor: T.color.transparent,
    padding: T.size.tiny,
  },
})
