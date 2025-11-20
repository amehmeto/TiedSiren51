import React from 'react'
import { Dimensions, Modal, StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSCard } from './TiedSCard'

export function TiedSModal(
  props: Readonly<{
    isVisible: boolean
    children: React.ReactNode
    onRequestClose: () => void
    style?: Record<string, unknown>
  }>,
) {
  return (
    <Modal
      style={styles.modalView}
      animationType="slide"
      transparent={true}
      visible={props.isVisible}
      onRequestClose={props.onRequestClose}
    >
      <View style={styles.centeredView}>
        <TiedSCard style={props.style}>{props.children}</TiedSCard>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: T.spacing.large,
  },
  modalView: {
    margin: T.spacing.large,
    borderRadius: T.border.radius.extraRounded,
    padding: T.spacing.xx_large,
    alignItems: 'center',
    shadowColor: T.shadow.color,
    shadowOffset: T.shadow.offset,
    width: Dimensions.get('window').width * 0.9,
    shadowOpacity: T.shadow.opacity,
    shadowRadius: T.shadow.radius.large,
    elevation: T.elevation.high,
  },
})
