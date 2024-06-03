import { Dimensions, Modal, StyleSheet, View } from 'react-native'
import { T } from '@/app/design-system/theme'
import { TiedSBlurView } from './TiedSBlurView'
import React from 'react'

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
      <View style={[styles.centeredView]}>
        <TiedSBlurView style={props.style}>{props.children}</TiedSBlurView>
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
    shadowOffset: {
      width: T.shadow.offset.width,
      height: T.shadow.offset.height,
    },
    width: Dimensions.get('window').width * 0.9,
    shadowOpacity: T.shadow.opacity,
    shadowRadius: T.shadow.radius,
    elevation: 5,
  },
})
