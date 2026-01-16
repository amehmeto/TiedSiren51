import { StyleSheet, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'

type NoSessionBoardProps = Readonly<{
  sessions: {
    title: string
    message: string
  }
}>

export function NoSessionBoard({ sessions }: NoSessionBoardProps) {
  return (
    <>
      <Text style={styles.title}>{sessions.title}</Text>
      <Text style={[styles.text, { marginBottom: T.spacing.large }]}>
        {sessions.message}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    fontSize: T.font.size.small,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
  },
  text: { color: T.color.text },
})
