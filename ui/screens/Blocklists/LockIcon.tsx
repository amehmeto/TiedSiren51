import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type LockIconProps = Readonly<{
  testID: string
}>

export function LockIcon({ testID }: LockIconProps) {
  return (
    <View style={styles.container} testID={testID}>
      <Ionicons
        name="lock-closed"
        size={T.icon.size.large}
        color={T.color.textMuted}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: T.spacing.small,
  },
})
