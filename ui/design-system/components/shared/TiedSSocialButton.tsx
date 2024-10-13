import React from 'react'
import { Text, StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
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
      style={({ pressed }) => [
        styles.button,
        style,
        { opacity: pressed ? 0.5 : 1 },
      ]}
      onPress={onPress}
    >
      <Ionicons name={iconName} size={T.size.large} color={T.color.white} />
      <Text style={styles.buttonText}>{text}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
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
