import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { AndroidSirenLookout } from '@/core/_ports_/siren.lookout'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'

interface AccessibilityPermissionCardProps {
  sirenLookout: AndroidSirenLookout
}

export const AccessibilityPermissionCard = ({
  sirenLookout,
}: AccessibilityPermissionCardProps) => {
  if (Platform.OS !== 'android') return null

  return (
    <TiedSCard style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={T.icon.size.xxLarge}
          color={T.color.lightBlue}
        />
        <Text style={styles.title}>Enable App Blocking</Text>
        <Text style={styles.description}>
          TiedSiren needs accessibility permission to block apps on this device.
          This allows the app to monitor and restrict access to blocked
          applications.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TiedSButton
          onPress={async () => await sirenLookout.askPermission()}
          text="Open Settings"
        />
      </View>
    </TiedSCard>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: T.spacing.large,
  },
  content: {
    marginBottom: T.spacing.medium,
  },
  title: {
    fontSize: T.font.size.medium,
    fontFamily: T.font.family.heading,
    color: T.color.text,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  description: {
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    color: T.color.textMuted,
    textAlign: 'center',
    lineHeight: T.font.size.medium,
  },
  buttonContainer: {
    width: T.layout.width.full,
  },
})
