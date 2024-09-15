import { TiedSLinearBackground } from '@/ui/design-system/components/components/TiedSLinearBackground'
import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

export default function StrictModeScreen() {
  return (
    <TiedSLinearBackground>
      <View style={styles.container}>
        <Text style={styles.text}>Strict Mode</Text>
      </View>
    </TiedSLinearBackground>
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
