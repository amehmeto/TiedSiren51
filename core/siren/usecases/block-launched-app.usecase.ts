import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { buildBlockingSchedule } from '@/core/_tests_/data-builders/blocking-schedule.builder'
import { buildSirens } from '@/core/_tests_/data-builders/sirens.builder'
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
      const blockingSchedule = buildBlockingSchedule({
        id: `immediate-${packageName}`,
        startTime: now,
        endTime: now,
        sirens: buildSirens({ android: [targetedApp] }),
      })
      await sirenTier.block([blockingSchedule])
    } else {
      logger.info(
        `[blockLaunchedApp] App launched: ${packageName} - not a siren`,
      )
    }
  },
)
