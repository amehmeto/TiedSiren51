import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ToastState = {
  message: string | null
}

const initialState: ToastState = {
  message: null,
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.message = action.payload
    },
    clearToast: (state) => {
      state.message = null
    },
  },
})

export const { showToast, clearToast } = toastSlice.actions
