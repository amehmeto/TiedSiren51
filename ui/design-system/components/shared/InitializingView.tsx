import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type InitializingViewProps = {
  isInitializing: boolean
  error?: string | null
}

export function InitializingView({
  isInitializing,
  error,
}: Readonly<InitializingViewProps>) {
  return (
    <View style={styles.view}>
      <Text style={styles.text}>
        {/* eslint-disable-next-line no-nested-ternary */}
        {isInitializing
          ? 'Loading...'
          : error
            ? `Error: ${error}`
            : 'Initializing...'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  text: {
    color: T.color.white,
    fontSize: T.font.size.regular,
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: T.color.darkBlueGray,
  },
})
