import { FormikProps } from 'formik'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { FormError } from '@/ui/screens/Home/shared/FormError'

type FieldErrorsProps = {
  errors: FormikProps<Session>['errors']
  fieldName: keyof Session
}

export function FieldErrors({ errors, fieldName }: FieldErrorsProps) {
  const fieldErrors = errors[fieldName]

  if (Array.isArray(fieldErrors))
    return fieldErrors.map((error) => <FormError error={error} />)
  if (typeof fieldErrors === 'string') return <FormError error={fieldErrors} />

  return null
}
