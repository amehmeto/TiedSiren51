import { StyleSheet, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'

type NoSessionBoardSessions = {
  title: string
  message: string
}

type NoSessionBoardProps = Readonly<{
  sessions: NoSessionBoardSessions
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
    fontWeight: T.font.weight.semibold,
    fontFamily: T.font.family.semibold,
    color: T.color.text,
    fontSize: T.font.size.small,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
    letterSpacing: T.font.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  text: { color: T.color.textMuted, fontFamily: T.font.family.primary },
})
