import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'
import { Sirens } from '../sirens'

export const fetchAvailableSirens = createAppAsyncThunk(
  'siren/fetchAvailableSirens',
  async (
    _,
    { getState, extra: { installedAppRepository, sirensRepository } },
  ) => {
    const userId = selectAuthUserId(getState())
    const installedApps = await installedAppRepository.getInstalledApps()
    const remoteSirens: Sirens =
      await sirensRepository.getSelectableSirens(userId)
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
