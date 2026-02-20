import { StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

type ReauthPromptProps = Readonly<{
  onReauthenticate: () => void
}>

export function ReauthPrompt({ onReauthenticate }: ReauthPromptProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.info}>
        Please re-authenticate to delete your account.
      </Text>
      <TiedSButton onPress={onReauthenticate} text="Re-authenticate" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: T.spacing.medium,
  },
  info: {
    color: T.color.text,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
  },
})
