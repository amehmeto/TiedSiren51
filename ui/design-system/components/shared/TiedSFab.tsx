import { ReactNode } from 'react'
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { T } from '@/ui/design-system/theme'

type TiedSFabOwnProps = {
  onPress: () => void
  icon: ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}

type TiedSFabProps = Readonly<TiedSFabOwnProps>

export function TiedSFab({
  onPress,
  icon,
  style,
  testID,
  accessibilityLabel,
}: TiedSFabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed: isPressed }) => [
        styles.fab,
        { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
        style,
      ]}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {icon}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  fab: {
    width: T.width.roundButton,
    height: T.width.roundButton,
    borderRadius: T.border.radius.fullRound,
    backgroundColor: T.color.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: T.tabBarHeight + T.spacing.medium,
    right: T.spacing.large,
    ...Platform.select({
      ios: {
        shadowColor: T.color.shadow,
        shadowOffset: T.shadow.offsets.medium,
        shadowOpacity: T.shadow.opacity,
        shadowRadius: T.shadow.radius.large,
      },
      android: {
        elevation: T.elevation.highest,
      },
      web: {
        boxShadow: `5px 5px 10px ${T.color.shadow}`,
      },
    }),
  },
})
