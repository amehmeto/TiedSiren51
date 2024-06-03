import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { Sirens } from '../sirens'

export const fetchAvailableSirens = createAppAsyncThunk(
  'siren/fetchAvailableSirens',
  async (_, { extra: { installedAppRepository, sirensRepository } }) => {
    const installedApps = await installedAppRepository.getInstalledApps()
    const remoteSirens: Sirens = await sirensRepository.getSelectableSirens()
    const availableSirens: Sirens = {
      android: installedApps.map((app) => ({
        packageName: app.packageName,
        appName: app.appName,
        icon: app.icon,
      })),
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: remoteSirens.websites,
      keywords: remoteSirens.keywords,
    }
    return availableSirens
  },
)
