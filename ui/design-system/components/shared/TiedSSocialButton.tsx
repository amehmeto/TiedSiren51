import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { usePressScale } from '@/ui/design-system/hooks/usePressScale'
import { T } from '@/ui/design-system/theme'

type IconName = 'logo-google' | 'logo-apple'

type TiedSSocialButtonProps = {
  iconName: IconName
  text: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

export function TiedSSocialButton({
  iconName,
  text,
  onPress,
  style,
}: TiedSSocialButtonProps) {
  const { scaleStyle, handlers } = usePressScale()

  return (
    <Animated.View style={[scaleStyle, style]}>
      <Pressable
        style={({ pressed: isPressed }) => [
          styles.button,
          { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
        ]}
        onPress={onPress}
        onPressIn={handlers.onPressIn}
        onPressOut={handlers.onPressOut}
        accessibilityRole="button"
      >
        <Ionicons
          name={iconName}
          size={T.icon.size.large}
          color={T.color.text}
        />
        <Text style={styles.buttonText}>{text}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: T.layout.width.nineTenths,
    paddingVertical: T.spacing.medium,
    paddingHorizontal: T.spacing.large,
    marginBottom: T.spacing.medium,
    borderRadius: T.border.radius.roundedMedium,
    backgroundColor: T.color.surfaceElevated,
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
  buttonText: {
    marginLeft: T.spacing.medium,
    color: T.color.text,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.semibold,
  },
})

export default TiedSSocialButton
