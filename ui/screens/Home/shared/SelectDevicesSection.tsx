import { FormikProps } from 'formik'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { FieldErrors } from '@/ui/screens/Home/shared/FieldErrors'
import { SelectDevicesField } from '@/ui/screens/Home/shared/SelectDevicesField'
import { useDevices } from '@/ui/screens/Home/shared/useDevices'

type SelectDevicesSectionProps = {
  form: FormikProps<BlockSessionFormValues>
  devices: ReturnType<typeof useDevices>
  hasFieldError: (field: keyof BlockSessionFormValues) => boolean
}

export function SelectDevicesSection({
  form,
  devices,
  hasFieldError,
}: SelectDevicesSectionProps) {
  return (
    <>
      <SelectDevicesField
        selectedDevices={form.values.devices}
        setFieldValue={form.setFieldValue}
        availableDevices={devices}
      />
      {hasFieldError('devices') && (
        <FieldErrors errors={form.errors} fieldName={'devices'} />
      )}
    </>
  )
}
