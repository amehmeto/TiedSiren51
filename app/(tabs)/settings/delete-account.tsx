import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { ReauthenticationModal } from '@/ui/design-system/components/shared/ReauthenticationModal'
import { T } from '@/ui/design-system/theme'
import {
  DeleteAccountViewState,
  selectDeleteAccountViewModel,
} from '@/ui/screens/Settings/delete-account.view-model'
import { DeleteAccountForm } from '@/ui/screens/Settings/DeleteAccountForm'

export default function DeleteAccountScreen() {
  const viewModel = useSelector((state: RootState) =>
    selectDeleteAccountViewModel(state),
  )
  const [isReauthVisible, setIsReauthVisible] = useState(true)
  const [isReauthenticated, setIsReauthenticated] = useState(false)

  if (viewModel.type === DeleteAccountViewState.Deleted) return null

  const { isDeletingAccount, deleteAccountError } = viewModel

  return (
    <View style={styles.container}>
      {isReauthenticated ? (
        <DeleteAccountForm
          isDeletingAccount={isDeletingAccount}
          deleteAccountError={deleteAccountError}
        />
      ) : (
        <Text style={styles.info}>
          Please re-authenticate to delete your account.
        </Text>
      )}

      <ReauthenticationModal
        isVisible={isReauthVisible}
        onRequestClose={() => setIsReauthVisible(false)}
        onSuccess={() => {
          setIsReauthVisible(false)
          setIsReauthenticated(true)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: T.spacing.medium,
  },
  info: {
    color: T.color.text,
    fontSize: T.font.size.base,
    textAlign: 'center',
  },
})
