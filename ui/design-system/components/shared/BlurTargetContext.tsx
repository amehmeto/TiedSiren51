import React, { createContext, useContext } from 'react'
import { View } from 'react-native'

type BlurTargetContextType = React.RefObject<View | null> | null

export const BlurTargetContext = createContext<BlurTargetContextType>(null)

export function useBlurTarget() {
  return useContext(BlurTargetContext)
}
