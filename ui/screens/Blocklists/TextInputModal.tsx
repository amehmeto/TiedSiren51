import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'

type TextInputModalProps = {
  isVisible: boolean
  label: string
  initialText: string
  onRequestClose: () => void
  onCancel: () => void
  onSave: (inputText: string) => void
}

export function TextInputModal({
  isVisible,
  label,
  initialText,
  onRequestClose,
  onCancel,
  onSave,
}: TextInputModalProps) {
  const [inputText, setInputText] = useState(initialText)

  return (
    <TiedSModal
      style={styles.renameModal}
      isVisible={isVisible}
      onRequestClose={onRequestClose}
    >
      <TiedSTextInput
        label={label}
        value={inputText}
        onChangeText={(text) => setInputText(text)}
      />
      <View style={styles.buttonContainer}>
        <TiedSButton
          style={styles.modalButton}
          onPress={onCancel}
          text={'Cancel'}
          variant={TiedSButtonVariant.Secondary}
        />
        <TiedSButton
          style={styles.modalButton}
          onPress={() => {
            onSave(inputText)
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
    marginTop: T.spacing.small,
  },
  modalButton: { marginLeft: T.spacing.large },
  renameModal: { flexDirection: 'column' },
})
