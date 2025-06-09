import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { logOut } from '@/core/auth/usecases/log-out.usecase'

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const handleLogout = () => {
    // Add your logout logic here (e.g., clear tokens, reset state)

    dispatch(logOut())
    router.replace('/(auth)/register')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
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
    marginBottom: 20,
  },
  logoutButton: {
    padding: 12,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
})
