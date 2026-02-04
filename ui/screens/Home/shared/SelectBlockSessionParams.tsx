import { FormikProps } from 'formik'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Device } from '@/core/device/device'
import { dependencies } from '@/ui/dependencies'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { ChooseName } from '@/ui/screens/Home/shared/ChooseName'
import { FieldErrors } from '@/ui/screens/Home/shared/FieldErrors'
import { FormError } from '@/ui/screens/Home/shared/FormError'
import { SelectBlockingCondition } from '@/ui/screens/Home/shared/SelectBlockingCondition'
import { SelectBlocklistsField } from '@/ui/screens/Home/shared/SelectBlocklistsField'
import { SelectDevicesField } from '@/ui/screens/Home/shared/SelectDevicesField'
import { SelectTime, StrictBound } from '@/ui/screens/Home/shared/SelectTime'

function computeLockedIds(
  isStrictModeActive: boolean,
  ids: string[],
): string[] {
  if (!isStrictModeActive) return []
  return ids
}

function computeStrictBound(
  isStrictModeActive: boolean,
  direction: 'earlier' | 'later',
  limit: string | null | undefined,
): StrictBound | undefined {
  if (!isStrictModeActive || !limit) return undefined
  return { direction, limit }
}

type SelectBlockSessionParamsProps = {
  form: FormikProps<BlockSessionFormValues>
  isStrictModeActive?: boolean
  initialValues?: BlockSessionFormValues
}

export function SelectBlockSessionParams({
  form,
  isStrictModeActive = false,
  initialValues,
}: SelectBlockSessionParamsProps) {
  const lockedBlocklistIds = computeLockedIds(
    isStrictModeActive,
    initialValues?.blocklistIds ?? [],
  )
  const lockedDeviceIds = computeLockedIds(
    isStrictModeActive,
    initialValues?.devices.map((d) => d.id) ?? [],
  )
  const startTimeBound = computeStrictBound(
    isStrictModeActive,
    'earlier',
    initialValues?.startedAt,
  )
  const endTimeBound = computeStrictBound(
    isStrictModeActive,
    'later',
    initialValues?.endedAt,
  )
  const [devices, setDevices] = useState<Device[]>([])
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] =
    useState<boolean>(false)
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] =
    useState<boolean>(false)

  useEffect(() => {
    dependencies.deviceRepository.findAll().then((foundDevices) => {
      setDevices(foundDevices)
    })
  }, [])

  function hasFieldError(field: keyof BlockSessionFormValues): boolean {
    return !!form.touched[field] && !!form.errors[field]
  }

  const handleNameChange = form.handleChange('name')

  return (
    <View>
      <TiedSCard style={styles.blockSession}>
        <ChooseName
          values={form.values}
          onChange={handleNameChange}
          setFieldValue={form.setFieldValue}
          onBlur={() => form.handleBlur('name')}
        />
        {hasFieldError('name') && <FormError error={form.errors.name} />}
        <SelectBlocklistsField
          values={form.values}
          setFieldValue={form.setFieldValue}
          lockedIds={lockedBlocklistIds}
        />
        {hasFieldError('blocklistIds') && (
          <FieldErrors errors={form.errors} fieldName={'blocklistIds'} />
        )}
        <SelectDevicesField
          values={form.values}
          setFieldValue={form.setFieldValue}
          items={devices}
          lockedIds={lockedDeviceIds}
        />
        {hasFieldError('devices') && (
          <FieldErrors errors={form.errors} fieldName={'devices'} />
        )}
        <SelectTime
          timeField={'startedAt'}
          setIsTimePickerVisible={setIsStartTimePickerVisible}
          values={form.values}
          isTimePickerVisible={isStartTimePickerVisible}
          setFieldValue={form.setFieldValue}
          handleChange={form.handleChange}
          strictBound={startTimeBound}
        />
        {hasFieldError('startedAt') && (
          <FormError error={form.errors.startedAt} />
        )}
        <SelectTime
          timeField={'endedAt'}
          setIsTimePickerVisible={setIsEndTimePickerVisible}
          values={form.values}
          isTimePickerVisible={isEndTimePickerVisible}
          setFieldValue={form.setFieldValue}
          handleChange={form.handleChange}
          strictBound={endTimeBound}
        />
        {hasFieldError('endedAt') && <FormError error={form.errors.endedAt} />}
        <SelectBlockingCondition form={form} />
        {hasFieldError('blockingConditions') && (
          <FieldErrors errors={form.errors} fieldName={'blockingConditions'} />
        )}
      </TiedSCard>

      <TiedSButton text={'START'} onPress={() => form.handleSubmit()} />
    </View>
  )
}

const styles = StyleSheet.create({
  blockSession: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
})
