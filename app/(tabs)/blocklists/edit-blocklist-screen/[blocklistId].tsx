import { useLocalSearchParams } from 'expo-router'
import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FormMode } from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { BlocklistForm } from '@/ui/screens/Blocklists/BlocklistForm'

export default function EditBlocklistScreen() {
  const { blocklistId } = useLocalSearchParams<{ blocklistId: string }>()
  const insets = useSafeAreaInsets()
  if (!blocklistId) return null

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <BlocklistForm mode={FormMode.Edit} blocklistId={blocklistId} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
