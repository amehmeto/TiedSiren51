import { FormikProps } from 'formik'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
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
import { SelectTime } from '@/ui/screens/Home/shared/SelectTime'

type SelectBlockSessionParamsProps = {
  form: FormikProps<BlockSessionFormValues>
}

export function SelectBlockSessionParams({
  form,
}: SelectBlockSessionParamsProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] =
    useState<boolean>(false)
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] =
    useState<boolean>(false)

  const blocklists = useSelector((state: RootState) =>
    selectAllBlocklists(state),
  )

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
          items={blocklists}
        />
        {hasFieldError('blocklistIds') && (
          <FieldErrors errors={form.errors} fieldName={'blocklistIds'} />
        )}
        <SelectDevicesField
          values={form.values}
          setFieldValue={form.setFieldValue}
          items={devices}
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
