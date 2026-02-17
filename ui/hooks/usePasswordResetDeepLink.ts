import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'

function extractOobCode(url: string): string | null {
  try {
    const parsed = Linking.parse(url)
    const oobCode = parsed.queryParams?.oobCode
    const mode = parsed.queryParams?.mode
    return mode === 'resetPassword' && typeof oobCode === 'string'
      ? oobCode
      : null
  } catch {
    return null
  }
}

export function usePasswordResetDeepLink() {
  const router = useRouter()

  useEffect(() => {
    const handleUrl = (event: { url: string }) => {
      const oobCode = extractOobCode(event.url)
      if (oobCode) {
        router.push({
          pathname: '/(auth)/reset-password-confirm',
          params: { oobCode },
        })
      }
    }

    const subscription = Linking.addEventListener('url', handleUrl)

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url })
    })

    return () => subscription.remove()
  }, [router])
}
