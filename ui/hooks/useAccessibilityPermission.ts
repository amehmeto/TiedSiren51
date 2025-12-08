import { useCallback, useState } from 'react'
import {
  isAndroidSirenLookout,
  SirenLookout,
} from '@/core/_ports_/siren.lookout'
import { useAppForeground } from './useAppForeground'

export function useAccessibilityPermission(sirenLookout: SirenLookout) {
  const [hasPermission, setHasPermission] = useState(true)

  const checkPermission = useCallback(async () => {
    if (isAndroidSirenLookout(sirenLookout)) {
      const isEnabled = await sirenLookout.isEnabled()
      setHasPermission(isEnabled)
    } else setHasPermission(true)
  }, [sirenLookout])

  useAppForeground(() => {
    void checkPermission()
  })

  return hasPermission
}
