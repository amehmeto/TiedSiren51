import { BlurView } from 'expo-blur'
import React from 'react'
import { Modal, Platform, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSCard } from './TiedSCard'
import { TiedSModalAndroid } from './TiedSModalAndroid'

type TiedSModalOwnProps = {
  isVisible: boolean
  children: React.ReactNode
  onRequestClose: () => void
  style?: Record<string, unknown>
}

type TiedSModalProps = Readonly<TiedSModalOwnProps>

export function TiedSModal({
  isVisible,
  children,
  onRequestClose,
  style,
}: TiedSModalProps) {
  if (Platform.OS === 'android') {
    return (
      <TiedSModalAndroid
        isVisible={isVisible}
        onRequestClose={onRequestClose}
        style={style}
      >
        {children}
      </TiedSModalAndroid>
    )
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onRequestClose}
    >
      <BlurView
        intensity={T.effects.blur.intensity.strong}
        tint={T.effects.blur.tint.dark}
        style={styles.centeredView}
      >
        <TiedSCard style={[styles.cardColumn, style]}>{children}</TiedSCard>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: T.spacing.medium,
    backgroundColor: T.color.modalBackgroundColor,
  },
  cardColumn: {
    flexDirection: 'column',
    width: T.layout.width.nineTenths,
    maxHeight: '80%',
  },
})
