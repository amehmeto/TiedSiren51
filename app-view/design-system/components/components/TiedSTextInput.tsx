import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native'
import { T } from '@/app-view/design-system/theme'
import { useState } from 'react'

interface TiedSTextInputProps extends TextInputProps {
  label?: string
}

export function TiedSTextInput(props: Readonly<TiedSTextInputProps>) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.container}>
      {props.label && <Text style={styles.text}>{props.label}</Text>}
      <TextInput
        style={[
          styles.input,
          { borderColor: isFocused ? T.color.lightBlue : T.color.white },
        ]}
        placeholderTextColor={T.color.white}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    height: T.width.textInputHeight,
    padding: T.spacing.small,
    fontSize: T.font.size.regular,
    borderWidth: T.border.width.thin,
    borderColor: T.color.lightBlue,
    borderRadius: T.border.radius.roundedSmall,
    color: T.color.white,
    width: '100%',
  },
  text: {
    color: T.color.white,
    marginBottom: T.spacing.medium,
  },
  container: {
    width: '100%',
  },
})
