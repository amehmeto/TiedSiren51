import { createSlice } from '@reduxjs/toolkit'
import { fetchAvailableSirens } from './usecases/fetch-available-sirens.usecase'
import { Sirens } from './sirens'
import { addKeywordToSirens } from './usecases/add-keyword-to-sirens.usecase'
import { addWebsiteToSirens } from './usecases/add-website-to-sirens.usecase'
import { tieSirens } from './usecases/tie-sirens.usecase'
import { loadUser } from '../auth/usecases/load-user.usecase'

export const sirenSlice = createSlice({
  name: 'siren',
  initialState: {
    availableSirens: {
      android: [],
      windows: [],
      macos: [],
      ios: [],
      linux: [],
      websites: [],
      keywords: [],
    } as Sirens,
    loading: false,
  },
  reducers: {
    setSirens: (state, action) => {
      state.availableSirens = action.payload
    },
  },
  extraReducers(builder) {
    builder
      .addCase(loadUser.fulfilled, (state, action) => {
        state.availableSirens = action.payload.sirens
        state.loading = false
      })
      .addCase(fetchAvailableSirens.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchAvailableSirens.fulfilled, (state, action) => {
        state.availableSirens = action.payload
        state.loading = false
      })
      .addCase(fetchAvailableSirens.rejected, (state) => {
        state.loading = false
      })
      .addCase(addKeywordToSirens.fulfilled, (state, action) => {
        state.availableSirens.keywords.push(action.payload)
      })
      .addCase(addWebsiteToSirens.fulfilled, (state, action) => {
        state.availableSirens.websites.push(action.payload)
      })
      .addCase(tieSirens.fulfilled, () => {
        // eslint-disable-next-line no-console
        console.log('sirens tied!')
      })
  },
})

export const { setSirens } = sirenSlice.actions
export default sirenSlice.reducer
