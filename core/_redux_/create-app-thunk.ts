import { createAsyncThunk } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from './createStore'
import { Dependencies } from './dependencies'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
  extra: Dependencies
}>()
