import * as Linking from 'expo-linking'
import { usePathname, useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { selectIsUserAuthenticated } from '@/core/auth/selectors/selectIsUserAuthenticated'
import { applyEmailVerificationCode } from '@/core/auth/usecases/apply-email-verification-code.usecase'
import { showToast } from '@/core/toast/toast.slice'
import { extractVerifyEmailOobCode } from '@/ui/auth-schemas/extract-verify-email-oob-code.helper'

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
      if (!isAuthenticatedRef.current) return
      const oobCode = extractVerifyEmailOobCode(event.url)
      if (!oobCode) return

      const verificationAction = await dispatch(
        applyEmailVerificationCode(oobCode),
      )
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
      .catch(() => {})

    return () => {
      isUnmountedRef.current = true
      subscription.remove()
    }
  }, [dispatch, router])
}
