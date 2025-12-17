import { listInstalledApps } from '@amehmeto/expo-list-installed-apps'
import {
  InstalledApp,
  AppType,
} from '@amehmeto/expo-list-installed-apps/build/ExpoListInstalledApps.types'
import { InstalledAppRepository } from '@/core/_ports_/installed-app.repository'
import { Logger } from '@/core/_ports_/logger'
import { InstalledApp as AppModel } from '@/core/installed-app/installed-app'

export class ExpoListInstalledAppsRepository implements InstalledAppRepository {
  constructor(private readonly logger: Logger) {}

  async getInstalledApps(): Promise<AppModel[]> {
    try {
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
    } catch (error) {
      this.logger.error(
        `[ExpoListInstalledAppsRepository] Failed to getInstalledApps: ${error}`,
      )
      throw error
    }
  }
}
