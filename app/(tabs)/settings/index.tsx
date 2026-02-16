import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { T } from '@/ui/design-system/theme'

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Pressable onPress={() => dispatch(logOut())} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
      <Pressable
        onPress={() => router.push('/(tabs)/settings/delete-account')}
        style={styles.deleteAccountButton}
      >
        <Text style={styles.deleteAccountText}>Delete Account</Text>
      </Pressable>
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
  logoutButton: {
    padding: T.spacing.smallMedium,
  },
  logoutText: {
    color: T.color.red,
    fontSize: T.font.size.base,
  },
  deleteAccountButton: {
    padding: T.spacing.smallMedium,
    marginTop: T.spacing.large,
  },
  deleteAccountText: {
    color: T.color.red,
    fontSize: T.font.size.base,
    fontWeight: T.font.weight.bold,
  },
})
