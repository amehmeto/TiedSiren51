import { RefObject, createContext, useContext } from 'react'
import { View } from 'react-native'

export const BlurTargetContext = createContext<RefObject<View | null> | null>(
  null,
)

export function useBlurTarget(): RefObject<View | null> | null {
  return useContext(BlurTargetContext)
}
