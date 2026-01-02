import { BlockingWindow } from '@/core/_ports_/siren.tier'
import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectTargetedApps } from '../selectors/selectTargetedApps'

export const blockLaunchedApp = createAppAsyncThunk(
  'siren/blockLaunchedApp',
  async (
    { packageName }: { packageName: string },
    { extra: { sirenTier, dateProvider, logger }, getState },
  ) => {
    const targetedApps = selectTargetedApps(getState(), dateProvider)

    const targetedApp = targetedApps.find(
      (app) => app.packageName === packageName,
    )

    if (targetedApp) {
      logger.info(`Siren detected: ${packageName} - blocking`)
      const now = dateProvider.getISOStringNow()
      const window: BlockingWindow = {
        id: `immediate-${packageName}`,
        startTime: now,
        endTime: now,
        sirens: {
          android: [targetedApp],
          windows: [],
          macos: [],
          ios: [],
          linux: [],
          websites: [],
          keywords: [],
        },
      }
      await sirenTier.block([window])
    } else logger.info(`App launched: ${packageName} - not a siren, ignoring`)
  },
)
