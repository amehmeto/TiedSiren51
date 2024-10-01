import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { ReactNode, useState } from 'react'

interface TiedSTextInputProps extends TextInputProps {
  label?: string
  rightIcon?: ReactNode
}

export function TiedSTextInput({
  label,
  rightIcon,
  ...props
}: TiedSTextInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.container}>
      {label && <Text style={styles.text}>{label}</Text>}
      <View style={styles.inputContainer}>
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
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: T.spacing.medium,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
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
  iconContainer: {
    position: 'absolute',
    right: T.spacing.small,
    top: T.spacing.small,
  },
})
