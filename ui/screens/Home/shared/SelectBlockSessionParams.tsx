import { useEffect, useState } from 'react'
import { FormikProps } from 'formik'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { deviceRepository } from '@/ui/dependencies'
import { Device } from '@/core/device/device'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { ChooseName } from '@/ui/screens/Home/shared/ChooseName'
import { SelectFromList } from '@/ui/screens/Home/shared/SelectFromList'
import { SelectTime } from '@/ui/screens/Home/shared/SelectTime'
import BlockingConditionModal from '@/ui/design-system/components/shared/BlockingConditionModal'
import { TiedSBlurView } from '@/ui/design-system/components/shared/TiedSBlurView'
import { TiedSButton } from '@/ui/design-system/components/shared/TiedSButton'

enum BlockSessionParams {
  BUTTON_TEXT_START = 'START',
  LIST_TYPE_BLOCKLISTS = 'blocklists',
  LIST_TYPE_DEVICES = 'devices',
  LABEL_BLOCKING_CONDITIONS = 'Blocking Conditions',
  DEFAULT_BLOCKING_CONDITION = 'Select blocking conditions...',
}

const hasFieldError = (
  form: FormikProps<Session>,
  field: keyof Session,
): boolean => !!form.touched[field] && !!form.errors[field]

const renderFieldError = (error: unknown): JSX.Element => (
  <Text key={String(error)} style={styles.errorText}>
    {typeof error === 'string' ? error : JSON.stringify(error)}
  </Text>
)

const renderArrayFieldErrors = (
  fieldErrors: FormikProps<Session>['errors'],
  fieldName: keyof Session,
): JSX.Element[] | JSX.Element | null => {
  const errors = fieldErrors[fieldName]

  if (Array.isArray(errors)) {
    return errors.map(renderFieldError)
  } else if (errors) {
    return renderFieldError(errors)
  }

  return null
}

export function SelectBlockSessionParams({
  form,
}: {
  form: FormikProps<Session>
}) {
  const { handleChange, handleBlur, handleSubmit, setFieldValue, values } = form
  const [devices, setDevices] = useState<Device[]>([])
  const [isStartTimePickerVisible, setIsStartTimePickerVisible] =
    useState<boolean>(false)
  const [isEndTimePickerVisible, setIsEndTimePickerVisible] =
    useState<boolean>(false)
  const [isBlockingConditionModalVisible, setBlockingConditionModalVisible] =
    useState<boolean>(false)

  const blocklists = useSelector((state: RootState) =>
    selectAllBlocklists(state),
  )

  useEffect(() => {
    deviceRepository.findAll().then((devices) => {
      setDevices(devices)
    })
  }, [])

  const handleSelectBlockingCondition = (selectedCondition: string) => {
    setFieldValue('blockingCondition', selectedCondition)
    form.setFieldTouched('blockingCondition', true)
    setBlockingConditionModalVisible(false)
  }

  return (
    <View>
      <TiedSBlurView style={styles.blockSession}>
        <ChooseName
          values={values}
          onChange={(text) => handleChange('name')(text)}
          setFieldValue={setFieldValue}
          onBlur={() => handleBlur('name')}
        />
        {hasFieldError(form, 'name') && (
          <Text style={styles.errorText}>{form.errors.name}</Text>
        )}

        <SelectFromList
          values={values}
          listType={BlockSessionParams.LIST_TYPE_BLOCKLISTS}
          setFieldValue={setFieldValue}
          items={blocklists}
        />
        {renderArrayFieldErrors(form.errors, 'blocklists')}
        <SelectFromList
          values={values}
          listType={BlockSessionParams.LIST_TYPE_DEVICES}
          setFieldValue={(field, selectedDevices) =>
            setFieldValue(
              field,
              selectedDevices.map((device) => ({
                id: device.id,
                name: device.name,
              })),
            )
          }
          items={devices}
        />
        {renderArrayFieldErrors(form.errors, 'devices')}
        <SelectTime
          timeField={'startedAt'}
          setIsTimePickerVisible={setIsStartTimePickerVisible}
          values={values}
          isTimePickerVisible={isStartTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
        {hasFieldError(form, 'startedAt') && (
          <Text style={styles.errorText}>{form.errors.startedAt}</Text>
        )}

        <SelectTime
          timeField={'endedAt'}
          setIsTimePickerVisible={setIsEndTimePickerVisible}
          values={values}
          isTimePickerVisible={isEndTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
        {hasFieldError(form, 'endedAt') && (
          <Text style={styles.errorText}>{form.errors.endedAt}</Text>
        )}

        <TouchableOpacity
          style={styles.blockingCondition}
          onPress={() => setBlockingConditionModalVisible(true)}
        >
          <Text style={styles.label}>{'Blocking Conditions'}</Text>
          <Text style={styles.option}>
            {values.blockingCondition || 'Select blocking conditions...'}
          </Text>
        </TouchableOpacity>
        {hasFieldError(form, 'blockingCondition') && (
          <Text style={styles.errorText}>{form.errors.blockingCondition}</Text>
        )}
      </TiedSBlurView>

      <BlockingConditionModal
        visible={isBlockingConditionModalVisible}
        onClose={() => setBlockingConditionModalVisible(false)}
        onSelectBlockingCondition={handleSelectBlockingCondition}
      />

      <TiedSButton
        text={BlockSessionParams.BUTTON_TEXT_START}
        onPress={() => {
          handleSubmit()
        }}
      />
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
  blockingCondition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: T.spacing.medium,
    paddingBottom: T.spacing.medium,
    paddingLeft: T.spacing.small,
    paddingRight: T.spacing.small,
  },
  errorText: {
    color: T.color.red,
    fontSize: T.font.size.small,
    marginTop: T.spacing.extraSmall,
    fontWeight: T.font.weight.bold,
  },
})
