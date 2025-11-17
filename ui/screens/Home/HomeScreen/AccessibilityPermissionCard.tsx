import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'

export const AccessibilityPermissionCard = () => {
  if (Platform.OS !== 'android') return null

  return (
    <TiedSCard style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={T.largeIconSize}
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
          onPress={async () => await AccessibilityService.askPermission()}
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
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  description: {
    fontSize: T.font.size.small,
    color: T.color.text,
    textAlign: 'center',
    lineHeight: T.font.size.medium,
    opacity: T.opacity.semiTransparent,
  },
  buttonContainer: {
    width: T.layout.width.full,
  },
})
