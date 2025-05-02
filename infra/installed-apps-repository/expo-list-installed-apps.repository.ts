import { InstalledAppRepository } from '@/core/ports/installed-app.repository'
import { InstalledApp as AppModel } from '@/core/installed-app/InstalledApp'
import { listInstalledApps, AppType } from '@amehmeto/expo-list-installed-apps'
import { InstalledApp } from '@amehmeto/expo-list-installed-apps/build/ExpoListInstalledApps.types'

export class ExpoListInstalledAppsRepository implements InstalledAppRepository {
  async getInstalledApps(): Promise<AppModel[]> {
    const installedApps = await listInstalledApps({
      type: AppType.USER,
    })

    const sortedApps = installedApps
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
