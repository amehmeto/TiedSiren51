import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FormMode } from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { BlocklistForm } from '@/ui/screens/Blocklists/BlocklistForm'

const HEADER_HEIGHT = 56

export default function CreateBlocklistScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[styles.container, { paddingTop: insets.top + HEADER_HEIGHT }]}
    >
      <BlocklistForm mode={FormMode.Create} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
