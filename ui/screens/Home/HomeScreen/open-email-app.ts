import * as Linking from 'expo-linking'
import { Platform } from 'react-native'
import { getEmailProvider, getWebUrl } from '@/core/auth/email-provider'
import { dependencies } from '@/ui/dependencies'

export async function openEmailApp(email: string): Promise<void> {
  try {
    const provider = getEmailProvider(email)

    if (provider) {
      if (Platform.OS === 'android') {
        try {
          await Linking.openURL(provider.deepLink)
          return
        } catch {
          // App not installed, fall through to web/mailto fallback
        }
      } else {
        const canOpen = await Linking.canOpenURL(provider.deepLink)
        if (canOpen) {
          await Linking.openURL(provider.deepLink)
          return
        }
      }
    }

    const webUrl = getWebUrl(email)
    if (webUrl) {
      await Linking.openURL(webUrl)
      return
    }

    await Linking.openURL(`mailto:${email}`)
  } catch (error) {
    dependencies.logger.error(
      `[openEmailApp] Failed to open email app: ${error}`,
    )
  }
}
