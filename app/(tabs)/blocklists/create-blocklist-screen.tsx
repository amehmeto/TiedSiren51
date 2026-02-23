import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { T } from '@/ui/design-system/theme'
import { FormMode } from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { BlocklistForm } from '@/ui/screens/Blocklists/BlocklistForm'

export default function CreateBlocklistScreen() {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[styles.container, { paddingTop: insets.top + T.height.header }]}
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
