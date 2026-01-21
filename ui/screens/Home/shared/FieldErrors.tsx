import { FormikProps } from 'formik'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { FormError } from '@/ui/screens/Home/shared/FormError'

type FieldErrorsProps = {
  errors: FormikProps<BlockSessionFormValues>['errors']
  fieldName: keyof BlockSessionFormValues
}

export function FieldErrors({ errors, fieldName }: FieldErrorsProps) {
  const fieldErrors = errors[fieldName]

  if (Array.isArray(fieldErrors))
    return fieldErrors.map((error) => <FormError error={error} />)
  if (typeof fieldErrors === 'string') return <FormError error={fieldErrors} />

  return null
}
