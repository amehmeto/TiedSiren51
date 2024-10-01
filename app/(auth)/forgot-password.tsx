import React from 'react'
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'

export default function ForgotPasswordScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{'RESET YOUR PASSWORD'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        keyboardType="email-address"
        placeholderTextColor={T.color.grey}
      />
      <Button
        title={'SEND PASSWORD RESET EMAIL'}
        onPress={() => router.replace('/(auth)/login')}
        color={T.color.lightBlue}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: T.spacing.medium,
    justifyContent: 'center',
    backgroundColor: T.color.applyBackgroundColor,
  },
  title: {
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    marginBottom: T.spacing.large,
  },
  input: {
    borderWidth: T.border.width.thin,
    borderColor: T.color.darkBlue,
    padding: T.spacing.medium,
    marginBottom: T.spacing.medium,
    borderRadius: T.border.radius.roundedSmall,
    backgroundColor: T.color.white,
    color: T.color.text,
  },
})
