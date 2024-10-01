import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'

export default function RegisterScreen() {
  const router = useRouter()

  return (
    // <ImageBackground
    //   style={styles.background}
    //   source={require('@/assets/images/background-image.png')}
    // >
    <TiedSLinearBackground>
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require('@/assets/tiedsirenlogo.png')}
        />
        <Text style={styles.title}>{"Let's make it productive"}</Text>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push('/(auth)/signup')}
        >
          <Text style={styles.signupText}>SIGN UP</Text>
        </TouchableOpacity>
        <Text style={styles.haveAccountText}>ALREADY HAVE AN ACCOUNT?</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>LOG IN</Text>
        </TouchableOpacity>
      </View>
    </TiedSLinearBackground>
    // </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: T.spacing.large,
    backgroundColor: T.color.registerBackgroundColor,
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.xLarge,
    fontWeight: T.font.weight.bold,
    marginBottom: T.spacing.large,
    textAlign: 'center',
  },
  signupButton: {
    backgroundColor: T.color.lightBlue,
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    borderRadius: T.border.radius.roundedSmall,
    marginBottom: T.spacing.x_large,
  },
  signupText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
  },
  haveAccountText: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    marginBottom: T.spacing.medium,
  },
  loginButton: {
    paddingVertical: T.spacing.medium,
    paddingHorizontal: T.spacing.large,
  },
  loginText: {
    color: T.color.lightBlue,
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
  },
  image: {
    width: T.width.tiedSirenLogo,
    height: T.width.tiedSirenLogo,
    marginBottom: T.spacing.large,
  },
})
