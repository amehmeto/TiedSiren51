import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export function useAppForeground(callback: () => void, runOnMount = true) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (runOnMount) callbackRef.current()

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') callbackRef.current()
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => subscription.remove()
  }, [runOnMount])
}
