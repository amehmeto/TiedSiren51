import { MaterialCommunityIcons } from '@expo/vector-icons'
import React from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'

export const AccessibilityPermissionCard = () => {
  // Only show on Android
  if (Platform.OS !== 'android') return null

  const handleOpenSettings = () => {
    // TODO: Implement navigation to accessibility settings
  }

  return (
    <TiedSCard style={styles.container}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name="link-variant"
          size={32}
          color={T.color.lightBlue}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enable App Blocking</Text>
        <Text style={styles.description}>
          TiedSiren needs accessibility permission to block apps on this device.
          This allows the app to monitor and restrict access to blocked
          applications.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TiedSButton onPress={handleOpenSettings} text="Open Settings" />
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
  iconContainer: {
    alignSelf: 'center',
    marginBottom: T.spacing.small,
  },
  content: {
    marginBottom: T.spacing.medium,
  },
  title: {
    fontSize: T.size.medium,
    fontWeight: T.font.weight.bold,
    color: T.color.text,
    textAlign: 'center',
    marginBottom: T.spacing.small,
  },
  description: {
    fontSize: T.size.small,
    color: T.color.text,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
  buttonContainer: {
    width: '100%',
  },
})
