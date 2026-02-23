import { FormikProps } from 'formik'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { FieldErrors } from '@/ui/screens/Home/shared/FieldErrors'
import { SelectDevicesField } from '@/ui/screens/Home/shared/SelectDevicesField'

type SelectDevicesSectionProps = {
  form: FormikProps<BlockSessionFormValues>
  hasFieldError: (field: keyof BlockSessionFormValues) => boolean
}

export function SelectDevicesSection({
  form,
  hasFieldError,
}: SelectDevicesSectionProps) {
  const { values, setFieldValue, errors } = form
  return (
    <>
      <SelectDevicesField
        selectedDevices={values.devices}
        setFieldValue={setFieldValue}
      />
      {hasFieldError('devices') && (
        <FieldErrors errors={errors} fieldName={'devices'} />
      )}
    </>
  )
}
