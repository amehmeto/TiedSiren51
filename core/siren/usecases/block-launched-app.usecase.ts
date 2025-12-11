import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectTargetedApps } from '../selectors/selectTargetedApps'

export const blockLaunchedApp = createAppAsyncThunk(
  'siren/blockLaunchedApp',
  async (
    { packageName }: { packageName: string },
    { extra: { sirenTier, dateProvider, logger }, getState },
  ) => {
    const targetedApps = selectTargetedApps(getState(), dateProvider)

    const isTargeted = targetedApps.some(
      (app) => app.packageName === packageName,
    )

    if (isTargeted) {
      logger.info(`Siren detected: ${packageName} - blocking`)
      await sirenTier.block(packageName)
    } else logger.info(`App launched: ${packageName} - not a siren, ignoring`)
  },
)
