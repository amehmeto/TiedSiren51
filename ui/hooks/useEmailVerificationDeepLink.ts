import * as Linking from 'expo-linking'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'
import { applyEmailVerificationCode } from '@/core/auth/usecases/apply-email-verification-code.usecase'
import { showToast } from '@/core/toast/toast.slice'
import {
  extractOobCode,
  FirebaseDeepLinkMode,
} from '@/ui/auth-schemas/extract-oob-code.helper'
import { dependencies } from '@/ui/dependencies'

export function useEmailVerificationDeepLink() {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useDispatch<AppDispatch>()
  const isAuthenticated = useSelector(selectIsUserAuthenticated)
  const isAuthenticatedRef = useRef(isAuthenticated)
  const pathnameRef = useRef(pathname)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated
  }, [isAuthenticated])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    isUnmountedRef.current = false

    const handleUrl = async (event: { url: string }) => {
      const oobCode = extractOobCode(
        event.url,
        FirebaseDeepLinkMode.VerifyEmail,
      )
      if (!oobCode) return

      // oobCode is intentionally discarded when unauthenticated — Firebase
      // verification codes are single-use, so the user will need a new link
      // after signing in. They can request one from Settings.
      if (!isAuthenticatedRef.current) {
        router.replace('/register')
        return
      }

      const verificationAction = await dispatch(
        applyEmailVerificationCode(oobCode),
      )
      // Error toast lives here because core prohibits try-catch
      // (no-try-catch-in-core). Success toast is dispatched inside the usecase.
      if (applyEmailVerificationCode.rejected.match(verificationAction)) {
        const message =
          verificationAction.error.message ??
          'Could not verify email. Please try again.'
        dispatch(showToast(message))
      }

      if (pathnameRef.current !== '/home') router.replace('/home')
    }

    const subscription = Linking.addEventListener('url', handleUrl)

    Linking.getInitialURL()
      .then((url) => {
        if (!isUnmountedRef.current && url) handleUrl({ url })
      })
      .catch((error) =>
        dependencies.logger.warn(
          `[useEmailVerificationDeepLink] getInitialURL failed: ${error}`,
        ),
      )

    return () => {
      isUnmountedRef.current = true
      subscription.remove()
    }
  }, [dispatch, router])
}
