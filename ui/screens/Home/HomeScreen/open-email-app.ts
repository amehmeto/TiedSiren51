import * as IntentLauncher from 'expo-intent-launcher'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'
import { getEmailProvider, getWebUrl } from '@/core/auth/email-provider'
import { dependencies } from '@/ui/dependencies'

function resolveAndroidPackage(providerName: string): string | null {
  const packages: Record<string, string> = {
    Gmail: 'com.google.android.gm',
    Outlook: 'com.microsoft.office.outlook',
    'Yahoo Mail': 'com.yahoo.mobile.client.android.mail',
    'Proton Mail': 'ch.protonmail.android',
  }
  return packages[providerName] ?? null
}

async function tryAndroidIntentLaunch(packageName: string): Promise<boolean> {
  try {
    await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
      packageName,
      category: 'android.intent.category.LAUNCHER',
    })
    return true
  } catch {
    return false
  }
}

async function tryOpenUrl(url: string): Promise<boolean> {
  try {
    await Linking.openURL(url)
    return true
  } catch {
    return false
  }
}

async function openAndroidEmailApp(email: string): Promise<void> {
  const provider = getEmailProvider(email)

  if (provider) {
    const packageName = resolveAndroidPackage(provider.name)
    if (packageName) {
      const didLaunch = await tryAndroidIntentLaunch(packageName)
      if (didLaunch) return
    }

    const didOpen = await tryOpenUrl(provider.deepLink)
    if (didOpen) return
  }

  const webUrl = getWebUrl(email)
  if (webUrl) {
    await Linking.openURL(webUrl)
    return
  }

  await Linking.openURL(`mailto:${email}`)
}

async function openIosEmailApp(email: string): Promise<void> {
  const provider = getEmailProvider(email)

  if (provider) {
    const canOpen = await Linking.canOpenURL(provider.deepLink)
    if (canOpen) {
      await Linking.openURL(provider.deepLink)
      return
    }
  }

  const webUrl = getWebUrl(email)
  if (webUrl) {
    await Linking.openURL(webUrl)
    return
  }

  await Linking.openURL(`mailto:${email}`)
}

export async function openEmailApp(email: string): Promise<void> {
  try {
    await (Platform.OS === 'android'
      ? openAndroidEmailApp(email)
      : openIosEmailApp(email))
  } catch (error) {
    dependencies.logger.error(
      `[openEmailApp] Failed to open email app: ${error}`,
    )
  }
}
