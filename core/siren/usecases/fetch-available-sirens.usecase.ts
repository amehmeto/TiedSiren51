import { createAppAsyncThunk } from '../../_redux_/create-app-thunk'
import { selectAuthUserId } from '../../auth/selectors/selectAuthUserId'
import { EMPTY_SIRENS, Sirens } from '../sirens'

export const fetchAvailableSirens = createAppAsyncThunk(
  'siren/fetchAvailableSirens',
  async (
    _,
    { extra: { installedAppRepository, sirensRepository, logger }, getState },
  ) => {
    const userId = selectAuthUserId(getState())
    const [installedApps, remoteSirens] = await Promise.all([
      installedAppRepository.getInstalledApps(),
      sirensRepository.getSelectableSirens(userId).catch((error) => {
        logger.error(
          `[fetchAvailableSirens] Failed to get remote sirens, using empty defaults: ${error}`,
        )
        return EMPTY_SIRENS
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
