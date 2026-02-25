import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'

export enum TiedSTextLinkVariant {
  Default = 'DEFAULT',
  Highlight = 'HIGHLIGHT',
}

type TiedSTextLinkOwnProps = {
  text: string
  onPress: () => void
  variant?: TiedSTextLinkVariant
  style?: StyleProp<ViewStyle>
}

type TiedSTextLinkProps = Readonly<TiedSTextLinkOwnProps>

export function TiedSTextLink({
  text,
  onPress,
  variant = TiedSTextLinkVariant.Default,
  style,
}: TiedSTextLinkProps) {
  const colorStyle =
    variant === TiedSTextLinkVariant.Highlight
      ? styles.highlight
      : styles.default

  return (
    <Text
      style={[styles.base, colorStyle, style]}
      onPress={onPress}
      accessibilityRole="link"
    >
      {text}
    </Text>
  )
}

const styles = StyleSheet.create({
  base: {
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.medium,
    textDecorationLine: 'underline',
  },
  default: {
    color: T.color.text,
  },
  highlight: {
    color: T.color.lightBlue,
  },
})
