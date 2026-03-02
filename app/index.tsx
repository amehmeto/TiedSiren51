import { View } from 'react-native'

// Empty View prevents a navigation race: AppWithInitialization's auth-aware
// router.replace() fires after initialization completes. Without this inert
// screen, Expo Router has no initial route to render while that happens.
export default function IndexScreen() {
  return <View />
}
