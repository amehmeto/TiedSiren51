import { StyleSheet, Text, View } from 'react-native'
import {
  TiedSButton,
  TiedSButtonVariant,
} from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { T } from '@/ui/design-system/theme'

const DELETE_CONFIRMATION = 'DELETE'

type DeleteAccountFormFields = {
  confirmText: string
  isDeleteDisabled: boolean
  buttonText: string
  deleteAccountError: string | null
  onConfirmTextChange: (text: string) => void
  onDeleteAccount: () => void
}

type DeleteAccountFormProps = Readonly<DeleteAccountFormFields>

export function DeleteAccountForm({
  confirmText,
  isDeleteDisabled,
  buttonText,
  deleteAccountError,
  onConfirmTextChange,
  onDeleteAccount,
}: DeleteAccountFormProps) {
  return (
    <View style={styles.content}>
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.warning}>
        This action is permanent and cannot be undone. All your data including
        block sessions, blocklists, and sirens will be permanently deleted.
      </Text>
      <Text style={styles.instruction}>
        Type <Text style={styles.confirmKeyword}>{DELETE_CONFIRMATION}</Text> to
        confirm:
      </Text>
      <TiedSTextInput
        style={styles.input}
        value={confirmText}
        onChangeText={onConfirmTextChange}
        placeholder={DELETE_CONFIRMATION}
        accessibilityLabel="Type DELETE to confirm"
        placeholderTextColor={T.color.textMuted}
        autoCapitalize="characters"
      />
      {deleteAccountError && (
        <Text style={styles.error}>{deleteAccountError}</Text>
      )}
      <TiedSButton
        onPress={onDeleteAccount}
        text={buttonText}
        isDisabled={isDeleteDisabled}
        variant={TiedSButtonVariant.Danger}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.heading,
    marginBottom: T.spacing.medium,
  },
  warning: {
    color: T.color.red,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.medium,
  },
  instruction: {
    color: T.color.text,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.small,
  },
  confirmKeyword: {
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.heading,
  },
  input: {
    width: '100%',
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.smallMedium,
    color: T.color.text,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
    textAlign: 'center',
    minHeight: T.height.settingsRow,
  },
  error: {
    color: T.color.red,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
})
