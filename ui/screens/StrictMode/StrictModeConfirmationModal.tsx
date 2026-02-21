import { StyleSheet, Text, View } from 'react-native'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

type StrictModeConfirmationModalFields = {
  isVisible: boolean
  formattedDuration: string
  onRequestClose: () => void
  onCancel: () => void
  onConfirm: () => void
}

type StrictModeConfirmationModalProps =
  Readonly<StrictModeConfirmationModalFields>

export function StrictModeConfirmationModal({
  isVisible,
  formattedDuration,
  onRequestClose,
  onCancel,
  onConfirm,
}: StrictModeConfirmationModalProps) {
  return (
    <TiedSModal
      style={styles.modal}
      isVisible={isVisible}
      onRequestClose={onRequestClose}
    >
      <Text style={styles.title}>Enable Strict Mode?</Text>
      <Text style={styles.warningText}>
        You are about to enable strict mode for {formattedDuration}.
      </Text>
      <Text style={styles.warningText}>
        Once started, strict mode cannot be canceled or shortened. You will not
        be able to access blocked apps until the timer expires.
      </Text>
      <View style={styles.buttonContainer}>
        <TiedSButton
          style={styles.cancelButton}
          onPress={onCancel}
          text={'Cancel'}
          variant={TiedSButtonVariant.Secondary}
        />
        <TiedSButton
          onPress={onConfirm}
          text={'Confirm'}
          variant={TiedSButtonVariant.Danger}
        />
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  modal: {
    flexDirection: 'column',
    padding: T.spacing.large,
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.heading,
    marginBottom: T.spacing.medium,
    textAlign: 'center',
  },
  warningText: {
    color: T.color.text,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.small,
    lineHeight: T.font.size.base * T.font.lineHeight.relaxed,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: T.layout.width.full,
    marginTop: T.spacing.medium,
  },
  cancelButton: {
    marginRight: T.spacing.small,
  },
})
