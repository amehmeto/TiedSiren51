export function validateSignUpInput(
  email: string,
  password: string,
): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Invalid email address.'

  if (password.length < 8) return 'Password must be at least 8 characters.'

  return null
}
