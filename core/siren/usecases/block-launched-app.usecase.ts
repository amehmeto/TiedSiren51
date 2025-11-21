import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectTargetedApps } from '../selectors/selectTargetedApps'

export const blockLaunchedApp = createAppAsyncThunk(
  'siren/blockLaunchedApp',
  async (
    { packageName }: { packageName: string },
    { extra: { sirenTier, dateProvider }, getState },
  ) => {
    const targetedApps = selectTargetedApps(getState(), dateProvider)

    const isTargeted = targetedApps.some(
      (app) => app.packageName === packageName,
    )

    if (isTargeted) await sirenTier.block(packageName)
  },
)
