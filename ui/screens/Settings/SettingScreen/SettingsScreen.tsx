import { Text, View, StyleSheet } from 'react-native'
import { TiedSLinearBackground } from '../../../design-system/components/TiedSLinearBackground.tsx'
import { T } from '../../../design-system/theme.ts'

/*type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<ScreenList, 'Settings'>
}*/

export function SettingsScreen() {
  return (
    <TiedSLinearBackground>
      <View style={styles.container}>
        <Text style={styles.text}>Settings</Text>
      </View>
    </TiedSLinearBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: T.color.white,
  },
})
