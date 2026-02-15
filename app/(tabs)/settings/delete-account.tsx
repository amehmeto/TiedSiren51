import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { setDeleteConfirmText } from '@/core/auth/reducer'
import { deleteAccount } from '@/core/auth/usecases/delete-account.usecase'
import { ReauthenticationModal } from '@/ui/design-system/components/shared/ReauthenticationModal'
import { T } from '@/ui/design-system/theme'
import {
  DeleteAccountViewState,
  selectDeleteAccountViewModel,
} from '@/ui/screens/Settings/delete-account.view-model'
import { DeleteAccountForm } from '@/ui/screens/Settings/DeleteAccountForm'
import { ReauthPrompt } from '@/ui/screens/Settings/ReauthPrompt'

export default function DeleteAccountScreen() {
  const viewModel = useSelector(selectDeleteAccountViewModel)
  const dispatch = useDispatch<AppDispatch>()
  const [isReauthVisible, setIsReauthVisible] = useState(true)
  const [isReauthenticated, setIsReauthenticated] = useState(false)

  if (viewModel.type === DeleteAccountViewState.Deleted) return null

  const { confirmText, isDeleteDisabled, buttonText, deleteAccountError } =
    viewModel

  return (
    <View style={styles.container}>
      {isReauthenticated ? (
        <DeleteAccountForm
          confirmText={confirmText}
          isDeleteDisabled={isDeleteDisabled}
          buttonText={buttonText}
          deleteAccountError={deleteAccountError}
          onConfirmTextChange={(text) => dispatch(setDeleteConfirmText(text))}
          onDeleteAccount={() => dispatch(deleteAccount())}
        />
      ) : (
        <ReauthPrompt onReauthenticate={() => setIsReauthVisible(true)} />
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
})
