import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { T } from '@/ui/design-system/theme'
import { TiedSLinearBackground } from '@/ui/design-system/components/shared/TiedSLinearBackground'
import { TiedSTextInput } from '@/ui/design-system/components/shared/TiedSTextInput'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { Ionicons } from '@expo/vector-icons'

export default function ForgotPasswordScreen() {
  const router = useRouter()

  return (
    <TiedSLinearBackground>
      <View style={styles.container}>
        <TiedSButton
          style={styles.crossButton}
          onPress={() => router.back()}
          text={
            <Ionicons name="close" size={T.size.large} color={T.color.white} />
          }
        />
        <Text style={styles.title}>{'RESET YOUR PASSWORD'}</Text>
        <TiedSTextInput
          placeholder={'Your Email'}
          placeholderTextColor={T.color.grey}
        />
        <TiedSButton
          onPress={() => router.replace('/(auth)/login')}
          text={'SEND PASSWORD RESET EMAIL'}
        />
      </View>
    </TiedSLinearBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: T.spacing.medium,
    justifyContent: 'center',
  },
  crossButton: {
    position: 'absolute',
    top: T.spacing.xx_large,
    left: T.spacing.medium,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    marginBottom: T.spacing.large,
  },
})
