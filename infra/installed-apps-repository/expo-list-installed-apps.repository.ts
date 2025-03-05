import { InstalledAppRepository } from '@/core/ports/installed-app.repository'
import { InstalledApp as AppModel } from '@/core/installed-app/InstalledApp'
import * as ExpoListInstalledApps from '@amehmeto/expo-list-installed-apps'
import { InstalledApp } from '@amehmeto/expo-list-installed-apps/build/ExpoListInstalledApps.types'

const mapToAppModel = (app: InstalledApp): AppModel => ({
  packageName: app.packageName,
  versionName: app.versionName,
  versionCode: app.versionCode,
  firstInstallTime: app.firstInstallTime,
  lastUpdateTime: app.lastUpdateTime,
  appName: app.appName,
  icon: app.icon,
  apkDir: app.apkDir,
  size: app.size,
})

export class ExpoListInstalledAppsRepository implements InstalledAppRepository {
  getInstalledApps(): Promise<AppModel[]> {
    const installedApps = ExpoListInstalledApps.listInstalledApps()
    return Promise.resolve(
      installedApps
        .sort((a: InstalledApp, b: InstalledApp) =>
          a.appName.localeCompare(b.appName),
        )
        .map(mapToAppModel),
    )
  }
}
