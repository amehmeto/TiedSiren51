import { createAction } from '@reduxjs/toolkit'

export const sirenDetected = createAction<{ packageName: string }>(
  'siren/sirenDetected',
)
