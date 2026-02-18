import { Action } from '@reduxjs/toolkit'
import { RootState } from './createStore'

export function sanitizeState(state: RootState): RootState {
  return !state.auth.password
    ? state
    : {
        ...state,
        auth: {
          ...state.auth,
          password: '[REDACTED]',
        },
      }
}

function hasAuthPassword(
  value: unknown,
): value is { auth: { password: string } } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'auth' in value &&
    typeof value.auth === 'object' &&
    value.auth !== null &&
    'password' in value.auth &&
    typeof value.auth.password === 'string'
  )
}

export function sanitizeDevToolsState<S>(state: S, _index: number): S {
  if (!hasAuthPassword(state) || !state.auth.password) return state

  return Object.assign({}, state, {
    auth: Object.assign({}, state.auth, { password: '[REDACTED]' }),
  })
}

export function sanitizeDevToolsAction<A extends Action>(
  action: A,
  _id: number,
): A {
  return action.type !== 'auth/setPassword'
    ? action
    : Object.assign({}, action, { payload: '[REDACTED]' })
}
