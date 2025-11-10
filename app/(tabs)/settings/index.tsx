import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { logOut } from '@/core/auth/usecases/log-out.usecase'
import { T } from '@/ui/design-system/theme'

export default function SettingsScreen() {
  const dispatch = useDispatch<AppDispatch>()

  const handleLogout = () => {
    // Add your logout logic here (e.g., clear tokens, reset state)
    dispatch(logOut())
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
    marginBottom: T.spacing.large,
  },
  logoutButton: {
    padding: 12,
  },
  logoutText: {
    color: T.color.red,
    fontSize: 16,
  },
})
