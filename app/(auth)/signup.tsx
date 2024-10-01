import React from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { T } from '@/ui/design-system/theme'

export default function SignUpScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.crossButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={T.size.large} color={T.color.white} />
      </TouchableOpacity>
      <Text style={styles.subtitle}>{'GET STARTED FOR FREE'}</Text>
      <TouchableOpacity style={styles.socialButton}>
        <Ionicons
          name="logo-google"
          size={T.size.large}
          color={T.color.white}
        />
        <Text style={styles.socialButtonText}> {'CONTINUE WITH GOOGLE'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.socialButton}>
        <Ionicons name="logo-apple" size={T.size.large} color={T.color.white} />
        <Text style={styles.socialButtonText}> {'CONTINUE WITH APPLE'}</Text>
      </TouchableOpacity>
      <Text style={styles.orText}>OR</Text>
      <TextInput
        style={styles.input}
        placeholder="Your Email"
        placeholderTextColor={T.color.grey}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Create Password"
          placeholderTextColor={T.color.grey}
          secureTextEntry={true}
        />
        <TouchableOpacity>
          <Ionicons
            name="eye-outline"
            size={T.size.large}
            color={T.color.grey}
            style={styles.passwordIcon}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text style={styles.createAccountText}>{'CREATE YOUR ACCOUNT'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: T.color.applyBackgroundColor,
    paddingHorizontal: T.spacing.large,
  },
  crossButton: {
    position: 'absolute',
    top: T.spacing.xx_large,
    left: T.spacing.medium,
    zIndex: 1,
  },
  subtitle: {
    color: T.color.text,
    fontSize: T.font.size.large,
    marginBottom: T.spacing.large,
  },
  socialButton: {
    width: '90%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: T.color.registerBackgroundColor,
    padding: T.spacing.medium,
    borderRadius: T.border.radius.roundedMedium,
    marginBottom: T.spacing.medium,
  },
  socialButtonText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
    marginLeft: T.spacing.medium,
  },
  orText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    marginVertical: T.spacing.medium,
  },
  input: {
    backgroundColor: T.color.white,
    padding: T.spacing.medium,
    borderRadius: T.border.radius.roundedSmall,
    marginBottom: T.spacing.medium,
    color: T.color.text,
    width: '90%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    backgroundColor: T.color.white,
    borderRadius: T.border.radius.roundedSmall,
    paddingHorizontal: T.spacing.small,
    marginBottom: T.spacing.medium,
  },
  passwordInput: {
    flex: 1,
    padding: T.spacing.medium,
    color: T.color.text,
  },
  passwordIcon: {
    paddingLeft: T.spacing.small,
  },
  createAccountButton: {
    backgroundColor: T.color.lightBlue,
    padding: T.spacing.medium,
    borderRadius: T.border.radius.roundedSmall,
    marginTop: T.spacing.medium,
    alignItems: 'center',
    width: '90%',
  },
  createAccountText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
  },
})
