import { FlatList, StyleSheet, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { ViewModelBlockSession } from '@/ui/screens/Home/HomeScreen/home-view-model.types'
import { SessionCard } from '@/ui/screens/Home/HomeScreen/SessionCard'
import { SessionType } from '@/ui/screens/Home/HomeScreen/SessionType'

type SessionsBoardSessions = {
  title: string
  blockSessions: ViewModelBlockSession[]
}

type SessionsBoardOwnProps = {
  sessions: SessionsBoardSessions
  type: SessionType
}

type SessionsBoardProps = Readonly<SessionsBoardOwnProps>

export function SessionsBoard({ sessions, type }: SessionsBoardProps) {
  return (
    <>
      <Text style={styles.title}>{sessions.title}</Text>
      <FlatList
        style={styles.cardList}
        data={sessions.blockSessions}
        renderItem={({ item }) => <SessionCard session={item} type={type} />}
      />
    </>
  )
}

const styles = StyleSheet.create({
  title: {
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.heading,
    color: T.color.text,
    fontSize: T.font.size.small,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
  },
  cardList: {
    marginBottom: T.spacing.small,
    flexGrow: 0,
  },
})
