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

export function TiedSTitle(
  props: Readonly<{
    text: string
    style?: StyleProp<ViewStyle>
    textStyle?: StyleProp<TextStyle>
  }>,
) {
  return (
    <View style={[styles.container, props.style]}>
      <Text style={[styles.title, props.textStyle]}>{props.text}</Text>
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
    color: T.color.white,
    fontSize: T.font.size.xLarge,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
})
