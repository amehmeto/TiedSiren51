export type AuthBaseViewModel<TState extends string> = {
  type: TState
  buttonText: string
  isInputDisabled: boolean
}
