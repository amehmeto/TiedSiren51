import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'

export default function RegisterScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require('@/assets/tiedsirenlogo.png')}
      />
      <Text style={styles.title}>{"Let's make it productive"}</Text>
      <TiedSButton
        style={styles.button}
        text={'SIGN UP'}
        onPress={() => router.push('/(auth)/signup')}
      />
      <Text style={styles.haveAccountText}>{'ALREADY HAVE AN ACCOUNT?'}</Text>
      <TiedSButton
        style={styles.button}
        text={'LOG IN'}
        onPress={() => router.push('/(auth)/login')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    marginBottom: T.spacing.large,
    textAlign: 'center',
  },
  button: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    marginBottom: T.spacing.x_large,
  },
  haveAccountText: {
    color: T.color.text,
    fontSize: T.font.size.small,
    marginBottom: T.spacing.medium,
  },
  image: {
    width: T.width.tiedSirenLogo,
    height: T.width.tiedSirenLogo,
    marginBottom: T.spacing.large,
  },
})
