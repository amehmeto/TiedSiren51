import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'

export default function RegisterScreen() {
  const isUserAuthenticated = useSelector((state: RootState) =>
    selectIsUserAuthenticated(state),
  )
  const router = useRouter()

  useEffect(() => {
    if (isUserAuthenticated) {
      router.push('/')
    }
  }, [isUserAuthenticated, router])

  return (
    <TiedSLinearBackground>
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
    </TiedSLinearBackground>
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
