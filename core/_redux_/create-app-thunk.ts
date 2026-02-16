import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './createStore'
import { Dependencies } from './dependencies'

type AppThunkConfig = {
  state: RootState
  dispatch: AppDispatch
  extra: Dependencies
}

export const createAppAsyncThunk = createAsyncThunk.withTypes<AppThunkConfig>()
