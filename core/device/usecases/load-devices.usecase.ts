import { createAppAsyncThunk } from '@/core/_redux_/create-app-thunk'
import { selectAuthUserId } from '@/core/auth/selectors/selectAuthUserId'
import { Device } from '@/core/device/device'

export const loadDevices = createAppAsyncThunk<Device[]>(
  'device/loadDevices',
  async (_, { getState, extra: { deviceRepository } }) => {
    const userId = selectAuthUserId(getState())
    return deviceRepository.findAll(userId)
  },
)
