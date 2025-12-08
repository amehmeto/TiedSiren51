import { useState } from 'react'
import { isAndroidSirenLookout } from '@/core/_ports_/siren.lookout'
import { dependencies } from '@/ui/dependencies'
import { useAppForeground } from './useAppForeground'

export function useAccessibilityPermission() {
  const { sirenLookout } = dependencies
  const [hasPermission, setHasPermission] = useState(true)

  const checkPermission = async () => {
    if (isAndroidSirenLookout(sirenLookout)) {
      const isEnabled = await sirenLookout.isEnabled()
      setHasPermission(isEnabled)
    } else setHasPermission(true)
  }

  useAppForeground(() => {
    void checkPermission()
  })

  return hasPermission
}
