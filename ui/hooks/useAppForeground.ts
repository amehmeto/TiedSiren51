import { useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export function useAppForeground(callback: () => void, runOnMount = true) {
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Legitimate use: sync external state (e.g. permission status) on mount and foreground
    if (runOnMount) callback()

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') callback()
    }

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => subscription.remove()
  }, [callback, runOnMount])
}
