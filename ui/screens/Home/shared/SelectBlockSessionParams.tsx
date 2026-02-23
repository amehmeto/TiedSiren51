import { FormikProps } from 'formik'
import { useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import { selectFeatureFlags } from '@/core/feature-flag/selectors/selectFeatureFlags'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { BlockSessionFormValues } from '@/ui/screens/Home/shared/BlockSessionForm'
import { ChooseName } from '@/ui/screens/Home/shared/ChooseName'
import { FieldErrors } from '@/ui/screens/Home/shared/FieldErrors'
import { FormError } from '@/ui/screens/Home/shared/FormError'
import { SelectBlockingCondition } from '@/ui/screens/Home/shared/SelectBlockingCondition'
import { SelectBlocklistsField } from '@/ui/screens/Home/shared/SelectBlocklistsField'
import { SelectDevicesSection } from '@/ui/screens/Home/shared/SelectDevicesSection'
import { SelectTime, TimeField } from '@/ui/screens/Home/shared/SelectTime'

type SelectBlockSessionParamsProps = {
  form: FormikProps<BlockSessionFormValues>
}

export function SelectBlockSessionParams({
  form,
}: SelectBlockSessionParamsProps) {
  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleChange,
    handleBlur,
    initialValues,
  } = form

  const {
    name: nameError,
    startedAt: startedAtError,
    endedAt: endedAtError,
  } = errors

  const {
    MULTI_DEVICE: isMultiDevice,
    BLOCKING_CONDITIONS: isBlockingConditions,
  } = useSelector(selectFeatureFlags)

  const [isStartTimePickerVisible, setIsStartTimePickerVisible] =
    useState<boolean>(false)
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] =
    useState<boolean>(false)

  function hasFieldError(field: keyof BlockSessionFormValues): boolean {
    return !!touched[field] && !!errors[field]
  }

  const handleNameChange = handleChange('name')

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <TiedSCard style={styles.blockSession}>
        <ChooseName
          values={values}
          onChange={handleNameChange}
          onBlur={() => handleBlur('name')}
        />
        {hasFieldError('name') && <FormError error={nameError} />}
        <SelectBlocklistsField
          blocklistIds={values.blocklistIds}
          setFieldValue={setFieldValue}
        />
        {hasFieldError('blocklistIds') && (
          <FieldErrors errors={errors} fieldName={'blocklistIds'} />
        )}
        {isMultiDevice && (
          <SelectDevicesSection form={form} hasFieldError={hasFieldError} />
        )}
        <SelectTime
          timeField={TimeField.StartedAt}
          setIsTimePickerVisible={setIsStartTimePickerVisible}
          values={values}
          isTimePickerVisible={isStartTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
          initialTime={initialValues.startedAt}
          initialOtherTime={initialValues.endedAt}
        />
        {hasFieldError('startedAt') && <FormError error={startedAtError} />}
        <SelectTime
          timeField={TimeField.EndedAt}
          setIsTimePickerVisible={setIsEndTimePickerVisible}
          values={values}
          isTimePickerVisible={isEndTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
          initialTime={initialValues.endedAt}
          initialOtherTime={initialValues.startedAt}
        />
        {hasFieldError('endedAt') && <FormError error={endedAtError} />}
        {isBlockingConditions && <SelectBlockingCondition form={form} />}
        {isBlockingConditions && hasFieldError('blockingConditions') && (
          <FieldErrors errors={errors} fieldName={'blockingConditions'} />
        )}
      </TiedSCard>

      <TiedSButton text={'START'} onPress={() => form.handleSubmit()} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center' as const,
  },
  blockSession: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
})
