import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
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
  },
})
