import { Text, View, StyleSheet } from 'react-native'
import { T } from '@/app/design-system/theme'
import { TiedSLinearBackground } from '@/app/design-system/components/components/TiedSLinearBackground'

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
