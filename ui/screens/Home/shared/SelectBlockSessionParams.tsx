import { useEffect, useState } from 'react'
import { FormikProps } from 'formik'
import { StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { Device } from '@/core/device/device'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { ChooseName } from '@/ui/screens/Home/shared/ChooseName'
import { SelectFromList } from '@/ui/screens/Home/shared/SelectFromList'
import { SelectTime } from '@/ui/screens/Home/shared/SelectTime'
import { TiedSBlurView } from '@/ui/design-system/components/shared/TiedSBlurView'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { SelectBlockingCondition } from '@/ui/screens/Home/shared/SelectBlockingCondition'
import { FormError } from '@/ui/screens/Home/shared/FormError'
import { FieldErrors } from '@/ui/screens/Home/shared/FieldErrors'
import { dependencies } from '@/ui/dependencies'

export function SelectBlockSessionParams({
  form,
}: {
  form: FormikProps<Session>
}) {
  // TODO: It was a mistake from my side, I shouldn't have destructured form here. It complicates things unnecessarily.
  const { handleChange, handleBlur, handleSubmit, setFieldValue, values } = form
  const [devices, setDevices] = useState<Device[]>([])
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] =
    useState<boolean>(false)
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] =
    useState<boolean>(false)

  const blocklists = useSelector((state: RootState) =>
    selectAllBlocklists(state),
  )

  useEffect(() => {
    dependencies.deviceRepository.findAll().then((devices) => {
      setDevices(devices)
    })
  }, [])

  function hasFieldError(field: keyof Session): boolean {
    return !!form.touched[field] && !!form.errors[field]
  }

  return (
    <View>
      <TiedSBlurView style={styles.blockSession}>
        <ChooseName
          values={values}
          onChange={handleChange('name')}
          setFieldValue={setFieldValue}
          onBlur={() => handleBlur('name')}
        />
        {hasFieldError('name') && <FormError error={form.errors.name} />}
        <SelectFromList
          values={values}
          listType={'blocklists'}
          setFieldValue={setFieldValue}
          items={blocklists}
        />
        {hasFieldError('blocklists') && (
          <FieldErrors errors={form.errors} fieldName={'blocklists'} />
        )}
        <SelectFromList
          values={values}
          listType={'devices'}
          setFieldValue={setFieldValue}
          items={devices}
        />
        {hasFieldError('devices') && (
          <FieldErrors errors={form.errors} fieldName={'devices'} />
        )}
        <SelectTime
          timeField={'startedAt'}
          setIsTimePickerVisible={setIsStartTimePickerVisible}
          values={values}
          isTimePickerVisible={isStartTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
        {hasFieldError('startedAt') && (
          <FormError error={form.errors.startedAt} />
        )}
        <SelectTime
          timeField={'endedAt'}
          setIsTimePickerVisible={setIsEndTimePickerVisible}
          values={values}
          isTimePickerVisible={isEndTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
        {hasFieldError('endedAt') && <FormError error={form.errors.endedAt} />}
        <SelectBlockingCondition form={form} />
        {hasFieldError('blockingConditions') && (
          <FieldErrors errors={form.errors} fieldName={'blockingConditions'} />
        )}
      </TiedSBlurView>

      <TiedSButton text={'START'} onPress={() => handleSubmit()} />
    </View>
  )
}

const styles = StyleSheet.create({
  blockSession: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  label: {
    color: T.color.text,
  },
  option: {
    color: T.color.lightBlue,
    textAlign: 'right',
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    marginTop: T.spacing.extraSmall,
    fontWeight: T.font.weight.bold,
  },
})
