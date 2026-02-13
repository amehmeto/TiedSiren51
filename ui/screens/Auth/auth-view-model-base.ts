export type AuthBaseViewModel<TState extends string> = {
  type: TState
  buttonText: string
  isInputDisabled: boolean
}

export type AuthErrorViewModel<TState extends string> =
  AuthBaseViewModel<TState> & {
    error: string
  }
