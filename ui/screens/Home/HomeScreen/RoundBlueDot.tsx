import { StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

export function RoundBlueDot() {
  return <View style={styles.dot} />
}

const styles = StyleSheet.create({
  dot: {
    margin: T.spacing.small,
    marginRight: T.spacing.x_large,
    width: T.component.roundDot,
    height: T.component.roundDot,
    borderRadius: T.component.roundDot / 2,
    backgroundColor: T.color.lightBlue,
  },
})
