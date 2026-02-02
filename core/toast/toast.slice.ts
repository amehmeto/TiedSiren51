import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ToastState = {
  message: string
  isVisible: boolean
}

const initialState: ToastState = {
  message: '',
  isVisible: false,
}

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action: PayloadAction<string>) => {
      state.message = action.payload
      state.isVisible = true
    },
    hideToast: (state) => {
      state.isVisible = false
    },
  },
})

export const { showToast, hideToast } = toastSlice.actions
