import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { T } from '@/ui/design-system/theme'

type NoBlocklistMessageProps = Readonly<{
  message: string
}>

export function NoBlocklistMessage({ message }: NoBlocklistMessageProps) {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons
          name="shield-outline"
          size={T.icon.size.xxLarge * 2}
          color={T.color.lightBlue}
        />
      </View>
      <Text style={styles.title}>No Blocklists Yet</Text>
      <Text style={styles.subtitle}>{message}</Text>
      <TiedSButton
        onPress={() =>
          router.push('/(tabs)/blocklists/create-blocklist-screen')
        }
        text="Create a Blocklist"
        style={styles.button}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: T.spacing.xx_large,
  },
  iconContainer: {
    marginBottom: T.spacing.x_large,
    opacity: T.opacity.semiTransparent,
  },
  title: {
    color: T.color.text,
    fontSize: T.font.size.large,
    fontFamily: T.font.family.heading,
    textAlign: 'center',
    marginBottom: T.spacing.smallMedium,
  },
  subtitle: {
    color: T.color.textMuted,
    fontSize: T.font.size.base,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    lineHeight: T.font.size.base * T.font.lineHeight.relaxed,
    paddingHorizontal: T.spacing.medium,
    marginBottom: T.spacing.large,
  },
  button: {
    paddingHorizontal: T.spacing.xx_large,
  },
})
