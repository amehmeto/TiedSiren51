import { InstalledAppRepository } from '@/core/ports/installed-app.repository'
import { InstalledApp as AppModel } from '@/core/installed-app/InstalledApp'
import * as ExpoListInstalledApps from '@amehmeto/expo-list-installed-apps'
import { InstalledApp } from '@amehmeto/expo-list-installed-apps/build/ExpoListInstalledApps.types'

const isSystemApp = (packageName: string): boolean => {
  const systemPrefixes = [
    'com.android.',
    'com.google.android.',
    'android.',
    'com.sec.android.',
    'com.samsung.',
    'com.oneplus.',
    'com.huawei.',
    'com.xiaomi.',
    'com.oppo.',
    'com.vivo.',
    'com.motorola.',
    'com.htc.',
    'com.lge.',
    'com.asus.',
    'com.sony.',
    'com.nokia.',
    'com.sec.',
  ]

  const knownSystemApps = [
    'com.amazon.kindle',
    'com.facebook.system',
    'com.facebook.appmanager',
    'com.facebook.services',
    'com.qualcomm.',
    'com.mediatek.',
  ]

  if (systemPrefixes.some((prefix) => packageName.startsWith(prefix))) {
    return true
  }

  if (knownSystemApps.some((app) => packageName.startsWith(app))) {
    return true
  }

  const commonUserApps = [
    'com.facebook.katana', // Facebook
    'com.instagram.android', // Instagram
    'com.twitter.android', // Twitter
    'com.snapchat.android', // Snapchat
    'com.zhiliaoapp.musically', // TikTok
    'com.netflix.mediaclient', // Netflix
    'com.spotify.music', // Spotify
    'com.amazon.mShop', // Amazon
    'com.whatsapp', // WhatsApp
    'com.youtube.android', // YouTube
  ]

  if (commonUserApps.some((app) => packageName === app)) {
    return false
  }

  return false
}

export class ExpoListInstalledAppsRepository implements InstalledAppRepository {
  private filterSystemApps: boolean

  constructor(filterSystemApps = true) {
    this.filterSystemApps = filterSystemApps
  }

  getInstalledApps(): Promise<AppModel[]> {
    const installedApps = ExpoListInstalledApps.listInstalledApps()

    let filteredApps = installedApps

    // Only filter if the option is enabled
    if (this.filterSystemApps) {
      filteredApps = filteredApps.filter(
        (app: InstalledApp) => !isSystemApp(app.packageName),
      )
    }

    const sortedApps = filteredApps
      .sort((a: InstalledApp, b: InstalledApp) =>
        a.appName.localeCompare(b.appName),
      )
      .map((app: InstalledApp) => ({
        packageName: app.packageName,
        versionName: app.versionName,
        versionCode: app.versionCode,
        firstInstallTime: app.firstInstallTime,
        lastUpdateTime: app.lastUpdateTime,
        appName: app.appName,
        icon: app.icon,
        apkDir: app.apkDir,
        size: app.size,
      }))

    return Promise.resolve(sortedApps)
  }
}
