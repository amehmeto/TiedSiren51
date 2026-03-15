import React, { createContext, useContext } from 'react'
import { View } from 'react-native'

export const BlurTargetContext =
  createContext<React.RefObject<View | null> | null>(null)

export function useBlurTarget(): React.RefObject<View | null> | undefined {
  const ref = useContext(BlurTargetContext)
  return ref ?? undefined
}
