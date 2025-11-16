import * as AccessibilityService from '@amehmeto/expo-accessibility-service'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'

export const AccessibilityPermissionCard = () => {
  const [hasAccessibilityPermission, setHasAccessibilityPermission] =
    useState(true) // Default to true to avoid flashing the card on load

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const isEnabled = await AccessibilityService.isEnabled()
        setHasAccessibilityPermission(isEnabled)
      } catch {
        // If there's an error checking, assume permission is not granted
        setHasAccessibilityPermission(false)
      }
    }

    void checkPermission()
  }, [])

  const handleOpenSettings = async () => {
    try {
      await AccessibilityService.askPermission()
      // Recheck permission after a short delay when user returns
      setTimeout(async () => {
        try {
          const isEnabled = await AccessibilityService.isEnabled()
          setHasAccessibilityPermission(isEnabled)
        } catch {
          setHasAccessibilityPermission(false)
        }
      }, 1000)
    } catch {
      // Handle error silently - user can try again
    }
  }

  if (Platform.OS !== 'android' || hasAccessibilityPermission) return null

  return (
    <TiedSCard style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={32}
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
