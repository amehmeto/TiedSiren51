import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import {
  Animated,
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native'
import { T } from '@/ui/design-system/theme'

type IconName = 'logo-google' | 'logo-apple'

type TiedSSocialButtonProps = {
  iconName: IconName
  text: string
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

const PRESS_SCALE = 0.97
const ANIMATION_DURATION = 100
const INITIAL_SCALE = 1

export function TiedSSocialButton({
  iconName,
  text,
  onPress,
  style,
}: TiedSSocialButtonProps) {
  const [scaleAnim] = useState(() => new Animated.Value(INITIAL_SCALE))

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        style={({ pressed: isPressed }) => [
          styles.button,
          { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
        ]}
        onPress={onPress}
        onPressIn={() =>
          Animated.timing(scaleAnim, {
            toValue: PRESS_SCALE,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }).start()
        }
        onPressOut={() =>
          Animated.timing(scaleAnim, {
            toValue: INITIAL_SCALE,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }).start()
        }
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
    fontWeight: T.font.weight.semibold,
    fontFamily: T.font.family.semibold,
  },
})

export default TiedSSocialButton
