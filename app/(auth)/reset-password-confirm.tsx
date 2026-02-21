import { useRouter } from 'expo-router'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '@/core/_redux_/createStore'
import { clearConfirmPasswordResetState } from '@/core/auth/reducer'
import {
  ResetPasswordConfirmViewState,
  selectResetPasswordConfirmViewModel,
} from '@/ui/screens/Auth/ResetPasswordConfirm/reset-password-confirm.view-model'
import { ResetPasswordConfirmForm } from '@/ui/screens/Auth/ResetPasswordConfirm/ResetPasswordConfirmForm'
import { ResetPasswordConfirmSuccessView } from '@/ui/screens/Auth/ResetPasswordConfirm/ResetPasswordConfirmSuccessView'

export default function ResetPasswordConfirmScreen() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const viewModel = useSelector(selectResetPasswordConfirmViewModel)

  const handleBackToLogin = () => {
    dispatch(clearConfirmPasswordResetState())
    router.replace('/(auth)/login')
  }

  const handleRequestNewLink = () => {
    dispatch(clearConfirmPasswordResetState())
    router.replace('/(auth)/forgot-password')
  }

  return viewModel.type === ResetPasswordConfirmViewState.Success ? (
    <ResetPasswordConfirmSuccessView onBackToLogin={handleBackToLogin} />
  ) : (
    <ResetPasswordConfirmForm
      onBackToLogin={handleBackToLogin}
      onRequestNewLink={handleRequestNewLink}
    />
  )
}
