import { ReactNode, useState } from 'react'
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native'
import { T } from '@/ui/design-system/theme'

export enum TiedSButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
}

type TiedSButtonOwnProps = {
  onPress: () => void
  text: string | ReactNode
  style?: StyleProp<ViewStyle>
  isDisabled?: boolean
  variant?: TiedSButtonVariant
}

type TiedSButtonProps = Readonly<TiedSButtonOwnProps>

const PRESS_SCALE = 0.97
const ANIMATION_DURATION = 100
const INITIAL_SCALE = 1

const variantContainerStyles: Record<
  TiedSButtonVariant,
  StyleProp<ViewStyle>
> = {
  [TiedSButtonVariant.Primary]: null,
  [TiedSButtonVariant.Secondary]: {
    backgroundColor: T.color.surfaceElevated,
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
    shadowOpacity: T.spacing.none,
    elevation: T.elevation.none,
  },
  [TiedSButtonVariant.Danger]: {
    backgroundColor: T.color.red,
  },
}

const variantTextStyles: Record<TiedSButtonVariant, StyleProp<TextStyle>> = {
  [TiedSButtonVariant.Primary]: null,
  [TiedSButtonVariant.Secondary]: { color: T.color.text },
  [TiedSButtonVariant.Danger]: { color: T.color.text },
}

export function TiedSButton({
  onPress,
  text,
  style,
  isDisabled,
  variant = TiedSButtonVariant.Primary,
}: TiedSButtonProps) {
  const [scaleAnim] = useState(() => new Animated.Value(INITIAL_SCALE))

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        style={({ pressed: isPressed }) => [
          styles.container,
          variantContainerStyles[variant],
          isDisabled && styles.disabled,
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
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!isDisabled }}
      >
        {typeof text === 'string' ? (
          <Text style={[styles.buttonText, variantTextStyles[variant]]}>
            {text}
          </Text>
        ) : (
          text
        )}
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: T.border.radius.roundedMedium,
    backgroundColor: T.color.lightBlue,
    marginTop: T.spacing.large,
    paddingVertical: T.spacing.smallMedium,
    paddingHorizontal: T.spacing.medium,
    minHeight: T.height.settingsRow,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: T.shadow.color,
    shadowOffset: T.shadow.offsets.medium,
    shadowOpacity: T.shadow.opacity,
    shadowRadius: T.shadow.radius.medium,
    elevation: T.elevation.medium,
  },
  buttonText: {
    fontWeight: T.font.weight.semibold,
    fontFamily: T.font.family.semibold,
    color: T.color.darkBlue,
    textAlign: 'center',
    fontSize: T.font.size.base,
    letterSpacing: T.font.letterSpacing.tight,
  },
  disabled: {
    backgroundColor: T.color.borderSubtle,
    opacity: T.opacity.disabled,
  },
})
