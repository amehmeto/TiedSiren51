import { FormikProps } from 'formik'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { FormError } from '@/ui/screens/Home/shared/FormError'

export function FieldErrors(props: {
  errors: FormikProps<Session>['errors']
  fieldName: keyof Session
}) {
  const errors = props.errors[props.fieldName]

  if (Array.isArray(errors))
    return errors.map((error) => <FormError error={error} />)
  if (typeof errors === 'string') return <FormError error={errors} />

  return null
}
