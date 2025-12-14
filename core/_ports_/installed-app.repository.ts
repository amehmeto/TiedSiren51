import { InstalledApp } from '../installed-app/installed-app'

export interface InstalledAppRepository {
  getInstalledApps(): Promise<InstalledApp[]>
}
