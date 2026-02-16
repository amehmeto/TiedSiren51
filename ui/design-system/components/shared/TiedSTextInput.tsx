import { useState } from 'react'
import { StyleSheet, TextInput, TextInputProps, View, Text } from 'react-native'
import { PasswordToggle } from '@/ui/design-system/components/shared/PasswordToggle'
import { T } from '@/ui/design-system/theme'

interface TiedSTextInputProps extends TextInputProps {
  label?: string
  hasPasswordToggle?: boolean
  testID?: string
}

export function TiedSTextInput({
  label,
  hasPasswordToggle = false,
  secureTextEntry: isSecureTextEntry,
  ...props
}: TiedSTextInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordShown, setIsPasswordShown] = useState(false)

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
          secureTextEntry={
            hasPasswordToggle ? !isPasswordShown : isSecureTextEntry
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {hasPasswordToggle && (
          <PasswordToggle
            isPasswordShown={isPasswordShown}
            onToggle={() => setIsPasswordShown(!isPasswordShown)}
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: T.layout.width.full,
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
    width: T.layout.width.full,
  },
  text: {
    color: T.color.white,
    marginBottom: T.spacing.medium,
  },
})
