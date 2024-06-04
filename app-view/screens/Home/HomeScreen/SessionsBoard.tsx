import { FlatList, StyleSheet, Text } from 'react-native'
import { T } from '@/app-view/design-system/theme'
import { SessionCard } from './SessionCard'

import { ViewModelBlockSession } from './home-view-model.types'

import { SessionType } from './SessionType'

export function SessionsBoard(
  props: Readonly<{
    sessions: {
      title: string
      blockSessions: ViewModelBlockSession[]
    }
    type: SessionType
  }>,
) {
  return (
    <>
      <Text style={styles.title}>{props.sessions.title}</Text>
      <FlatList
        style={styles.cardList}
        data={props.sessions.blockSessions}
        renderItem={({ item }) => (
          <SessionCard session={item} type={props.type} />
        )}
      />
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
  cardList: {
    marginBottom: T.spacing.small,
    flexGrow: 0,
  },
})
