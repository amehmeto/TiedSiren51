import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ToastState = {
  message: string | null
  isDebug: boolean
}

const initialState: ToastState = {
  message: null,
  isDebug: false,
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.message = action.payload
      state.isDebug = false
    },
    showDebugToast: (state, action: PayloadAction<string>) => {
      state.message = action.payload
      state.isDebug = true
    },
    clearToast: (state) => {
      state.message = null
      state.isDebug = false
    },
  },
})

export const { showToast, showDebugToast, clearToast } = toastSlice.actions
