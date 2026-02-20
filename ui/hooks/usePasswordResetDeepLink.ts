import * as Linking from 'expo-linking'
import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { clearConfirmPasswordResetState } from '@/core/auth/reducer'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'
import {
  extractOobCode,
  FirebaseDeepLinkMode,
} from '@/ui/auth-schemas/extract-oob-code.helper'
import { dependencies } from '@/ui/dependencies'

export function usePasswordResetDeepLink() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsUserAuthenticated)
  const isAuthenticatedRef = useRef(isAuthenticated)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  useEffect(() => {
    isUnmountedRef.current = false

    const handleUrl = (event: { url: string }) => {
      if (isAuthenticatedRef.current) return
      const oobCode = extractOobCode(
        event.url,
        FirebaseDeepLinkMode.ResetPassword,
      )
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
      .catch((error) =>
        dependencies.logger.warn(
          `[usePasswordResetDeepLink] getInitialURL failed: ${error}`,
        ),
      )

    return () => {
      isUnmountedRef.current = true
      subscription.remove()
    }
  }, [router, dispatch])
}
