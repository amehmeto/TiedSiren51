import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { AuthProvider } from '@/core/auth/auth-user'
import { clearReauthError } from '@/core/auth/reducer'
import { selectAuthProvider } from '@/core/auth/selectors/selectAuthProvider'
import { selectReauthStatus } from '@/core/auth/selectors/selectReauthStatus'
import { GoogleReauthForm } from '@/ui/design-system/components/shared/GoogleReauthForm'
import { PasswordReauthForm } from '@/ui/design-system/components/shared/PasswordReauthForm'
import { TiedSModal } from '@/ui/design-system/components/shared/TiedSModal'
import { T } from '@/ui/design-system/theme'

type ReauthenticationModalOwnProps = {
  isVisible: boolean
  onRequestClose: () => void
}

type ReauthenticationModalProps = Readonly<ReauthenticationModalOwnProps>

export function ReauthenticationModal({
  isVisible,
  onRequestClose,
}: ReauthenticationModalProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { reauthError } = useSelector(selectReauthStatus)
  const authProvider = useSelector(selectAuthProvider)

  const handleClose = () => {
    dispatch(clearReauthError())
    onRequestClose()
  }

  const isGoogleProvider = authProvider === AuthProvider.Google

  return (
    <TiedSModal isVisible={isVisible} onRequestClose={handleClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Confirm your identity</Text>
        {isGoogleProvider ? (
          <GoogleReauthForm onCancel={handleClose} />
        ) : (
          <PasswordReauthForm onCancel={handleClose} />
        )}
        {reauthError && <Text style={styles.error}>{reauthError}</Text>}
      </View>
    </TiedSModal>
  )
}

const styles = StyleSheet.create({
  container: {
    width: T.layout.width.full,
    padding: T.spacing.medium,
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  error: {
    color: T.color.red,
    fontSize: T.font.size.small,
    textAlign: 'center',
    marginTop: T.spacing.small,
  },
})
