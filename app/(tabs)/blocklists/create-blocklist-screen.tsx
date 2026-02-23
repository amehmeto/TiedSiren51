import { useHeaderHeight } from '@react-navigation/elements'
import { StyleSheet, View } from 'react-native'
import { FormMode } from '@/ui/screens/Blocklists/blocklist-form.view-model'
import { BlocklistForm } from '@/ui/screens/Blocklists/BlocklistForm'

export default function CreateBlocklistScreen() {
  const headerHeight = useHeaderHeight()
  return (
    <View style={[styles.container, { paddingTop: headerHeight }]}>
      <BlocklistForm mode={FormMode.Create} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
