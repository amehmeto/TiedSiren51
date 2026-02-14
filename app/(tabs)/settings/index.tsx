import { useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { ReauthenticationModal } from '@/ui/design-system/components/shared/ReauthenticationModal'
import { T } from '@/ui/design-system/theme'

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const [isReauthVisible, setShowReauth] = useState(false)

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Pressable
        onPress={() => setShowReauth(true)}
        style={styles.reauthButton}
      >
        <Text style={styles.reauthText}>Test Re-authentication</Text>
      </Pressable>
      <Pressable onPress={() => dispatch(logOut())} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
      <ReauthenticationModal
        isVisible={isReauthVisible}
        onRequestClose={() => setShowReauth(false)}
        onSuccess={() => {
          setShowReauth(false)
          Alert.alert('Success!', 'Re-authentication successful.')
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
  },
  text: {
    color: T.color.white,
    marginBottom: T.spacing.large,
  },
  reauthButton: {
    padding: T.spacing.smallMedium,
    marginBottom: T.spacing.small,
  },
  reauthText: {
    color: T.color.lightBlue,
    fontSize: T.font.size.base,
  },
  logoutButton: {
    padding: T.spacing.smallMedium,
  },
  logoutText: {
    color: T.color.red,
    fontSize: T.font.size.base,
  },
})
