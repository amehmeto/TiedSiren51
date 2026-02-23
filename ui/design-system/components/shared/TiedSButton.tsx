import { ReactNode } from 'react'
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native'
import { usePressScale } from '@/ui/design-system/hooks/usePressScale'
import { T } from '@/ui/design-system/theme'

export enum TiedSButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
}

const { Primary, Secondary, Danger } = TiedSButtonVariant

type TiedSButtonOwnProps = {
  onPress: () => void
  text: string | ReactNode
  style?: StyleProp<ViewStyle>
  isDisabled?: boolean
  variant?: TiedSButtonVariant
  testID?: string
  accessibilityLabel?: string
}

type TiedSButtonProps = Readonly<TiedSButtonOwnProps>

const variantContainerStyles: Record<
  TiedSButtonVariant,
  StyleProp<ViewStyle>
> = {
  [Primary]: null,
  [Secondary]: {
    backgroundColor: T.color.surfaceElevated,
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
    shadowOpacity: T.spacing.none,
    elevation: T.elevation.none,
  },
  [Danger]: {
    backgroundColor: T.color.red,
  },
}

const variantTextStyles: Record<TiedSButtonVariant, StyleProp<TextStyle>> = {
  [Primary]: null,
  [Secondary]: { color: T.color.text },
  [Danger]: { color: T.color.text },
}

export function TiedSButton({
  onPress,
  text,
  style,
  isDisabled,
  variant = Primary,
  testID,
  accessibilityLabel,
}: TiedSButtonProps) {
  const { scaleStyle, handlers } = usePressScale()

  return (
    <Animated.View style={[scaleStyle, style]}>
      <Pressable
        style={({ pressed: isPressed }) => [
          styles.container,
          variantContainerStyles[variant],
          isDisabled && styles.disabled,
          { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
        ]}
        onPress={onPress}
        onPressIn={handlers.onPressIn}
        onPressOut={handlers.onPressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: !!isDisabled }}
        testID={testID}
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
