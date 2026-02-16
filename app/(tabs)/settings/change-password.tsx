import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/core/_redux_/createStore'
import {
  clearChangePasswordError,
  clearChangePasswordSuccess,
} from '@/core/auth/reducer'
import { changePassword } from '@/core/auth/usecases/change-password.usecase'
import { dependencies } from '@/ui/dependencies'
import { ReauthenticationModal } from '@/ui/design-system/components/shared/ReauthenticationModal'
import { T } from '@/ui/design-system/theme'
import { selectChangePasswordViewModel } from '@/ui/screens/Settings/change-password.view-model'
import { ChangePasswordForm } from '@/ui/screens/Settings/ChangePasswordForm'
import { ReauthPrompt } from '@/ui/screens/Settings/ReauthPrompt'

export default function ChangePasswordScreen() {
  const viewModel = useSelector((state: RootState) =>
    selectChangePasswordViewModel(state, dependencies.dateProvider),
  )
  const dispatch = useDispatch<AppDispatch>()
  const [isReauthVisible, setIsReauthVisible] = useState(true)

  const clearPreviousState = useCallback(() => {
    dispatch(clearChangePasswordError())
    dispatch(clearChangePasswordSuccess())
  }, [dispatch])
  useFocusEffect(clearPreviousState)

  const {
    isReauthenticated,
    isChangingPassword,
    changePasswordError,
    hasChangePasswordSucceeded,
    buttonText,
  } = viewModel

  return (
    <View style={styles.container}>
      {isReauthenticated ? (
        <ChangePasswordForm
          isChangingPassword={isChangingPassword}
          changePasswordError={changePasswordError}
          hasChangePasswordSucceeded={hasChangePasswordSucceeded}
          buttonText={buttonText}
          onChangePassword={(newPassword) =>
            dispatch(changePassword({ newPassword })).unwrap()
          }
        />
      ) : (
        <ReauthPrompt onReauthenticate={() => setIsReauthVisible(true)} />
      )}

      <ReauthenticationModal
        isVisible={isReauthVisible && !isReauthenticated}
        onRequestClose={() => setIsReauthVisible(false)}
        onSuccess={() => setIsReauthVisible(false)}
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
