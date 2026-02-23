import { createSlice } from '@reduxjs/toolkit'
import { Device } from '@/core/device/device'
import { loadDevices } from './usecases/load-devices.usecase'

export type DeviceState = {
  list: Device[]
}

const initialState: DeviceState = {
  list: [],
}

export const deviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(loadDevices.fulfilled, (state, action) => {
      state.list = action.payload
    })
  },
})
