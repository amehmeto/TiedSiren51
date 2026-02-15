import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { ReauthenticationModal } from '@/ui/design-system/components/shared/ReauthenticationModal'
import { T } from '@/ui/design-system/theme'
import {
  DeleteAccountViewState,
  selectDeleteAccountViewModel,
} from '@/ui/screens/Settings/delete-account.view-model'
import { DeleteAccountForm } from '@/ui/screens/Settings/DeleteAccountForm'

export default function DeleteAccountScreen() {
  const viewModel = useSelector(selectDeleteAccountViewModel)
  const router = useRouter()
  const [isReauthVisible, setIsReauthVisible] = useState(true)
  const [isReauthenticated, setIsReauthenticated] = useState(false)

  // When deleted, Firebase's onAuthStateChanged(null) triggers the existing
  // logout flow which redirects to the login screen.
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
        onRequestClose={() => router.back()}
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
