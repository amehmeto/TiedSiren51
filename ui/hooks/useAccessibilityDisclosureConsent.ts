import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

export function useAccessibilityDisclosureConsent() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)

  useEffect(() => {
    void AsyncStorage.getItem('accessibility_disclosure_consent').then(
      (value) => {
        setHasConsented(value === 'true')
      },
    )
  }, [])

  const giveConsent = useCallback(async () => {
    await AsyncStorage.setItem('accessibility_disclosure_consent', 'true')
    setHasConsented(true)
  }, [])

  return { hasConsented, giveConsent }
}
