import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectStrictModeTimeLeft } from '@/core/strict-mode/selectors/selectStrictModeTimeLeft'
import { showToast } from '@/core/toast/toast.slice'
import { formatDuration } from '../format-duration'

export const notifyLockedSiren = createAppAsyncThunk<void, void>(
  'strictMode/notifyLockedSiren',
  (_, { dispatch, getState, extra: { dateProvider } }) => {
    const timeLeft = selectStrictModeTimeLeft(getState(), dateProvider)
    const timeLeftFormatted = formatDuration(timeLeft)
    dispatch(showToast(`Locked (${timeLeftFormatted} left)`))
  },
)
