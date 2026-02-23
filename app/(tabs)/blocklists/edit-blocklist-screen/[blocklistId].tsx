import { useHeaderHeight } from '@react-navigation/elements'
import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { FormMode } from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { BlocklistForm } from '@/ui/screens/Blocklists/BlocklistForm'

export default function EditBlocklistScreen() {
  const { blocklistId } = useLocalSearchParams<{ blocklistId: string }>()
  const headerHeight = useHeaderHeight()
  if (!blocklistId) return null

  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      <BlocklistForm mode={FormMode.Edit} blocklistId={blocklistId} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
