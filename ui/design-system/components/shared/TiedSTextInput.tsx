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
          style={[styles.input, isFocused && styles.inputFocused]}
          placeholderTextColor={T.color.textMuted}
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
    paddingVertical: T.spacing.smallMedium,
    paddingHorizontal: T.spacing.medium,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
    borderRadius: T.border.radius.roundedMedium,
    color: T.color.text,
    width: T.layout.width.full,
    backgroundColor: T.color.inputBackground,
  },
  inputFocused: {
    borderColor: T.color.lightBlue,
    borderWidth: T.border.width.medium,
  },
  text: {
    color: T.color.text,
    fontFamily: T.font.family.medium,
    fontSize: T.font.size.small,
    letterSpacing: T.font.letterSpacing.tight,
    marginBottom: T.spacing.small,
  },
})
