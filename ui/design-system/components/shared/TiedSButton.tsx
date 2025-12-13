import { ReactNode } from 'react'
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

export function TiedSButton(
  props: Readonly<{
    onPress: () => void
    text: string | ReactNode
    style?: StyleProp<ViewStyle>
    disabled?: boolean
  }>,
) {
  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.container,
        props.style,
        props.disabled && styles.disabled,
        { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
      ]}
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!props.disabled }}
    >
      {typeof props.text === 'string' ? (
        <Text style={styles.buttonText}>{props.text}</Text>
      ) : (
        props.text
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: T.border.radius.roundedMedium,
    backgroundColor: T.color.lightBlue,
    marginTop: T.spacing.large,
    padding: T.spacing.small,
  },
  buttonText: {
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    textAlign: 'center',
    borderRadius: T.border.radius.roundedSmall,
  },
  disabled: {
    backgroundColor: T.color.grey,
    opacity: T.opacity.disabled,
  },
})
