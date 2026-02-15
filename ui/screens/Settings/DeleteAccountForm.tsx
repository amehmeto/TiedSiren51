import { StyleSheet, Text, TextInput, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

const DELETE_CONFIRMATION = 'DELETE'

type DeleteAccountFormProps = Readonly<{
  confirmText: string
  isDeleteDisabled: boolean
  buttonText: string
  deleteAccountError: string | null
  onConfirmTextChange: (text: string) => void
  onDeleteAccount: () => void
}>

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
      <TextInput
        style={styles.input}
        value={confirmText}
        onChangeText={onConfirmTextChange}
        placeholder={DELETE_CONFIRMATION}
        placeholderTextColor={T.color.grey}
        autoCapitalize="characters"
      />
      {deleteAccountError && (
        <Text style={styles.error}>{deleteAccountError}</Text>
      )}
      <TiedSButton
        onPress={onDeleteAccount}
        text={buttonText}
        isDisabled={isDeleteDisabled}
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
    marginBottom: T.spacing.medium,
  },
  warning: {
    color: T.color.red,
    fontSize: T.font.size.base,
    textAlign: 'center',
    marginBottom: T.spacing.medium,
  },
  instruction: {
    color: T.color.text,
    fontSize: T.font.size.base,
    marginBottom: T.spacing.small,
  },
  confirmKeyword: {
    fontWeight: T.font.weight.bold,
  },
  input: {
    width: '100%',
    borderWidth: T.border.width.thin,
    borderColor: T.color.grey,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.small,
    color: T.color.text,
    fontSize: T.font.size.base,
    marginBottom: T.spacing.medium,
    textAlign: 'center',
  },
  error: {
    color: T.color.red,
    fontSize: T.font.size.small,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
})
