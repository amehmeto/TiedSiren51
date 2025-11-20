import { LinearGradient } from 'expo-linear-gradient'
import { ActivityIndicator, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

export function LoadingScreen() {
  return (
    <LinearGradient
      colors={[T.color.darkBlue, T.color.darkBlueGray, T.color.darkBlue]}
      style={styles.container}
    >
      <ActivityIndicator size="large" color={T.color.lightBlue} />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
