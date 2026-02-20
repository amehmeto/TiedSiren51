import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'
import { Sirens } from '../sirens'

export const fetchAvailableSirens = createAppAsyncThunk(
  'siren/fetchAvailableSirens',
  async (
    _,
    { extra: { installedAppRepository, sirensRepository, logger }, getState },
  ) => {
    const userId = selectAuthUserId(getState())
    const emptySirens: Sirens = {
      android: [],
      ios: [],
      windows: [],
      macos: [],
      linux: [],
      websites: [],
      keywords: [],
    }
    const [installedApps, remoteSirens] = await Promise.all([
      installedAppRepository.getInstalledApps(),
      sirensRepository.getSelectableSirens(userId).catch((error) => {
        logger.error(
          `[fetchAvailableSirens] Failed to get remote sirens, using empty defaults: ${error}`,
        )
        return emptySirens
      }),
    ])
    const availableSirens: Sirens = {
      android: installedApps.map(({ packageName, appName, icon }) => ({
        packageName,
        appName,
        icon,
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
