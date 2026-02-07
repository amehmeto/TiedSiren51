export enum AuthMethod {
  SignInWithEmail = 'signInWithEmail',
  SignUpWithEmail = 'signUpWithEmail',
}

export type LoginCredentials = {
  email: string
  password: string
}

export type SignUpCredentials = {
  email: string
  password: string
}
