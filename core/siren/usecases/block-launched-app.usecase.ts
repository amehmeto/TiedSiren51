import { BlockingSchedule } from '@/core/_ports_/siren.tier'
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
      logger.info(
        `[blockLaunchedApp] Siren detected: ${packageName} - blocking`,
      )
      const now = dateProvider.getISOStringNow()
      const blockingSchedule: BlockingSchedule = {
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
      await sirenTier.block([blockingSchedule])
    } else {
      logger.info(
        `[blockLaunchedApp] App launched: ${packageName} - not a siren`,
      )
    }
  },
)
