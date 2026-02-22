import { StyleSheet, Text, View } from 'react-native'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

type SettingsWarningModalProps = {
  readonly isVisible: boolean
  readonly onRequestClose: () => void
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function SettingsWarningModal({
  isVisible,
  onRequestClose,
  onCancel,
  onConfirm,
}: SettingsWarningModalProps) {
  return (
    <TiedSModal
      style={styles.modal}
      isVisible={isVisible}
      onRequestClose={onRequestClose}
    >
      <Text style={styles.title}>Block Settings?</Text>
      <Text style={styles.warningText}>
        Blocking the Settings app will prevent you from accessing device
        settings (Wi-Fi, Bluetooth, permissions, etc.) during active block
        sessions. Make sure you have configured everything you need before
        starting a session.
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
          text={'I understand, add it'}
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
