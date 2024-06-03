import { InstalledApp } from '../installed-app/InstalledApp'

export interface InstalledAppRepository {
  getInstalledApps(): Promise<InstalledApp[]>
}
