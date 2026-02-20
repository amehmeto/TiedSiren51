import { useRouter } from 'expo-router'
import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useSelector } from 'react-redux'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

const logoSource = require('@/assets/tiedsirenlogo.png')

export default function RegisterScreen() {
  const isUserAuthenticated = useSelector(selectIsUserAuthenticated)
  const router = useRouter()

  useEffect(() => {
    if (isUserAuthenticated) router.push('/')
  }, [isUserAuthenticated, router])

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={logoSource} />
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
    fontFamily: T.font.family.heading,
    marginBottom: T.spacing.large,
    textAlign: 'center',
  },
  button: {
    paddingVertical: T.spacing.small,
    paddingHorizontal: T.spacing.xx_large,
    marginBottom: T.spacing.x_large,
  },
  haveAccountText: {
    color: T.color.textMuted,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
  },
  image: {
    width: T.width.tiedSirenLogo,
    height: T.width.tiedSirenLogo,
    marginBottom: T.spacing.large,
  },
})
