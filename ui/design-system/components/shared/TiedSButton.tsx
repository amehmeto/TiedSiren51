import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { ReactNode } from 'react'

export function TiedSButton(
  props: Readonly<{
    onPress: () => void
    text: string | ReactNode
    style?: StyleProp<ViewStyle>
  }>,
) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        props.style,
        { opacity: pressed ? 0.5 : 1 },
      ]}
      onPress={props.onPress}
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
    borderRadius: T.border.radius.roundedSmall,
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
})
