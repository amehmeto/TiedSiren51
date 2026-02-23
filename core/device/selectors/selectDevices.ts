import { RootState } from '@/core/_redux_/createStore'

export const selectDevices = (state: RootState) => state.device.list
