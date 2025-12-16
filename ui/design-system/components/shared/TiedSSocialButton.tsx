import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native'
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
  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.button,
        style,
        { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={iconName}
        size={T.icon.size.large}
        color={T.color.white}
      />
      <Text style={styles.buttonText}>{text}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: T.layout.width.nineTenths,
    padding: T.spacing.medium,
    marginBottom: T.spacing.medium,
    borderRadius: T.border.radius.roundedMedium,
    backgroundColor: T.color.modalBackgroundColor,
  },
  buttonText: {
    marginLeft: T.spacing.medium,
    color: T.color.white,
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
  },
})

export default TiedSSocialButton
