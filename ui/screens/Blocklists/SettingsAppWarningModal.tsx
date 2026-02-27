import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { formatDuration } from '@/core/strict-mode/format-duration'
import { selectIsStrictModeActive } from '@/core/strict-mode/selectors/selectIsStrictModeActive'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'
import { dependencies } from '@/ui/dependencies'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

type SettingsAppWarningModalProps = {
  readonly isVisible: boolean
  readonly onRequestClose: () => void
  readonly onCancel: () => void
  readonly onConfirm: () => void
}

export function SettingsAppWarningModal({
  isVisible,
  onRequestClose,
  onCancel,
  onConfirm,
}: SettingsAppWarningModalProps) {
  const isStrictModeActive = useSelector((state: RootState) =>
    selectIsStrictModeActive(state, dependencies.dateProvider),
  )

  const strictModeTimeLeft = useSelector((state: RootState) =>
    selectStrictModeTimeLeft(state, dependencies.dateProvider),
  )

  const formattedTimeLeft = formatDuration(strictModeTimeLeft)

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
      {isStrictModeActive && (
        <Text style={styles.strictModeText}>
          Strict mode is on ({formattedTimeLeft} left). You will not be able to
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
