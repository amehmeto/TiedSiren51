import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'

export function TextInputModal(props: {
  visible: boolean
  label: string
  initialText: string
  onRequestClose: () => void
  onCancel: () => void
  onSave: (inputText: string) => void
}) {
  const [inputText, setInputText] = useState(props.initialText)

  return (
    <TiedSModal
      style={styles.renameModal}
      isVisible={props.visible}
      onRequestClose={props.onRequestClose}
    >
      <TiedSTextInput
        label={props.label}
        value={inputText}
        onChangeText={(text) => setInputText(text)}
      />
      <View style={styles.buttonContainer}>
        <TiedSButton
          style={styles.modalButton}
          onPress={props.onCancel}
          text={'Cancel'}
        />
        <TiedSButton
          style={styles.modalButton}
          onPress={() => {
            props.onSave(inputText)
          }}
          text={'Save'}
        />
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: T.layout.width.full,
  },
  modalButton: { marginLeft: T.spacing.large },
  renameModal: { flexDirection: 'column' },
})
