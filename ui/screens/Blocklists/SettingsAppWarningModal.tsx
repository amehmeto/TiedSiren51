import { StyleSheet, Text, View } from 'react-native'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

type SettingsAppWarningModalProps = {
  readonly isVisible: boolean
  readonly strictModeTimeLeft?: string
  readonly onRequestClose: () => void
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function SettingsAppWarningModal({
  isVisible,
  strictModeTimeLeft,
  onRequestClose,
  onCancel,
  onConfirm,
}: SettingsAppWarningModalProps) {
  return (
    <TiedSModal
      style={styles.modal}
      isVisible={isVisible}
      onRequestClose={onRequestClose}
    >
      <Text style={styles.title}>Block Settings?</Text>
      <Text style={styles.warningText}>
        During active sessions, blocking Settings will prevent access to Wi-Fi,
        Bluetooth, permissions, and app uninstallation — including TiedSiren
        itself.
      </Text>
      {strictModeTimeLeft && (
        <Text style={styles.strictModeText}>
          Strict mode is on ({strictModeTimeLeft} left). You will not be able to
          remove Settings from this blocklist until it expires.
        </Text>
      )}
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
          variant={TiedSButtonVariant.Primary}
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
  strictModeText: {
    color: T.color.red,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.semibold,
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
