import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { clearConfirmPasswordResetState } from '@/core/auth/reducer'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'

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
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsUserAuthenticated)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    if (isAuthenticated) return

    isUnmountedRef.current = false

    const handleUrl = (event: { url: string }) => {
      const oobCode = extractOobCode(event.url)
      if (oobCode) {
        dispatch(clearConfirmPasswordResetState())
        router.push({
          pathname: '/(auth)/reset-password-confirm',
          params: { oobCode },
        })
      }
    }

    const subscription = Linking.addEventListener('url', handleUrl)

    Linking.getInitialURL()
      .then((url) => {
        if (!isUnmountedRef.current && url) handleUrl({ url })
      })
      .catch(() => {})

    return () => {
      isUnmountedRef.current = true
      subscription.remove()
    }
  }, [router, dispatch, isAuthenticated])
}
