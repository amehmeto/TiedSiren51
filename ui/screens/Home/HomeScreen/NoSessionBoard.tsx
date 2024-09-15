import { StyleSheet, Text } from 'react-native'
import { T } from '../../../design-system/theme.ts'

export function NoSessionBoard(
  props: Readonly<{
    sessions: {
      title: string
      message: string
    }
  }>,
) {
  return (
    <>
      <Text style={styles.title}>{props.sessions.title}</Text>
      <Text style={[styles.text, { marginBottom: T.spacing.large }]}>
        {props.sessions.message}
      </Text>
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    fontSize: T.size.small,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
  },
  text: { color: T.color.text },
})
