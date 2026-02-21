import React from 'react'
import { Modal, StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSCard } from './TiedSCard'

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
  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.centeredView}>
        <TiedSCard style={[styles.cardColumn, style]}>{children}</TiedSCard>
      </View>
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
