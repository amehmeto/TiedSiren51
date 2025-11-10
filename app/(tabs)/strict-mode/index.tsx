import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

export default function StrictModeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Strict Mode</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.color.transparent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: T.color.white,
  },
})
