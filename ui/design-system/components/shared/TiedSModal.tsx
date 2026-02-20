import React from 'react'
import { Dimensions, Modal, StyleSheet, View } from 'react-native'
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
      style={styles.modalView}
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.centeredView}>
        <TiedSCard style={style}>{children}</TiedSCard>
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
  modalView: {
    margin: T.spacing.large,
    borderRadius: T.border.radius.extraRounded,
    padding: T.spacing.xx_large,
    alignItems: 'center',
    shadowColor: T.shadow.color,
    shadowOffset: T.shadow.offsets.large,
    width: Dimensions.get('window').width * 0.9,
    shadowOpacity: T.shadow.opacity,
    shadowRadius: T.shadow.radius.large,
    elevation: T.elevation.high,
  },
})
