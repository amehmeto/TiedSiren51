import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type NoBlocklistMessageProps = Readonly<{
  message: string
}>

export function NoBlocklistMessage({ message }: NoBlocklistMessageProps) {
  return (
    <View>
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: { color: T.color.white },
})
