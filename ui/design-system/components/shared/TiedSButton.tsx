import { ReactNode } from 'react'
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

type TiedSButtonOwnProps = {
  onPress: () => void
  text: string | ReactNode
  style?: StyleProp<ViewStyle>
  isDisabled?: boolean
}

type TiedSButtonProps = Readonly<TiedSButtonOwnProps>

export function TiedSButton({
  onPress,
  text,
  style,
  isDisabled,
}: TiedSButtonProps) {
  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.container,
        style,
        isDisabled && styles.disabled,
        { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled }}
    >
      {typeof text === 'string' ? (
        <Text style={styles.buttonText}>{text}</Text>
      ) : (
        text
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: T.border.radius.roundedMedium,
    backgroundColor: T.color.lightBlue,
    marginTop: T.spacing.large,
    paddingVertical: T.spacing.smallMedium,
    paddingHorizontal: T.spacing.medium,
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
    backgroundColor: T.color.grey,
    opacity: T.opacity.disabled,
  },
})
