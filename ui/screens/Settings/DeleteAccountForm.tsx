import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { clearDeleteAccountError } from '@/core/auth/reducer'
import { deleteAccount } from '@/core/auth/usecases/delete-account.usecase'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

const DELETE_CONFIRMATION = 'DELETE'

type DeleteAccountFormProps = Readonly<{
  isDeletingAccount: boolean
  deleteAccountError: string | null
}>

export function DeleteAccountForm({
  isDeletingAccount,
  deleteAccountError,
}: DeleteAccountFormProps) {
  const dispatch = useDispatch<AppDispatch>()
  const [confirmText, setConfirmText] = useState('')
  const isConfirmed = confirmText === DELETE_CONFIRMATION

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Delete Account</Text>
      <Text style={styles.warning}>
        This action is permanent and cannot be undone. All your data including
        block sessions, blocklists, and sirens will be permanently deleted.
      </Text>
      <Text style={styles.instruction}>
        Type {DELETE_CONFIRMATION} to confirm:
      </Text>
      <TextInput
        style={styles.input}
        value={confirmText}
        onChangeText={(text) => {
          setConfirmText(text)
          if (deleteAccountError) dispatch(clearDeleteAccountError())
        }}
        placeholder={DELETE_CONFIRMATION}
        placeholderTextColor={T.color.grey}
        autoCapitalize="characters"
      />
      {deleteAccountError && (
        <Text style={styles.error}>{deleteAccountError}</Text>
      )}
      <TiedSButton
        onPress={() => dispatch(deleteAccount())}
        text={isDeletingAccount ? 'Deleting...' : 'Delete My Account'}
        isDisabled={!isConfirmed || isDeletingAccount}
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
