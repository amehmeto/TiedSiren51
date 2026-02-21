import React from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native'
import { T } from '@/ui/design-system/theme'

type TiedSTitleOwnProps = {
  text: string
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

type TiedSTitleProps = Readonly<TiedSTitleOwnProps>

export function TiedSTitle({ text, style, textStyle }: TiedSTitleProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, textStyle]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: T.spacing.large,
    paddingHorizontal: T.spacing.large,
    position: 'relative',
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.xLarge,
    fontFamily: T.font.family.heading,
    letterSpacing: T.font.letterSpacing.tight,
  },
})
