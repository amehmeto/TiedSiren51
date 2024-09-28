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

export function SelectBlockSessionParams(
  props: Readonly<{
    form: FormikProps<Session>
  }>,
) {
  const { handleChange, handleBlur, handleSubmit, setFieldValue, values } =
    props.form
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
    props.form.setFieldTouched('blockingCondition', true)
    setBlockingConditionModalVisible(false)
  }
  // console.log('blocklists', values.blocklists)
  // console.log('Form values:', props.form.values)
  // console.log('Form errors:', props.form.errors)
  // console.log('Touched fields:', props.form.touched)

  return (
    <View>
      <TiedSBlurView style={styles.blockSession}>
        <ChooseName
          values={values}
          onChange={(text) => handleChange('name')(text)}
          setFieldValue={setFieldValue}
          onBlur={() => handleBlur('name')}
        />
        {props.form.touched.name && props.form.errors.name && (
          <Text style={styles.errorText}>{props.form.errors.name}</Text>
        )}

        <SelectFromList
          values={values}
          listType={BlockSessionParams.LIST_TYPE_BLOCKLISTS}
          setFieldValue={setFieldValue}
          items={blocklists}
        />
        {props.form.touched.blocklists &&
          props.form.errors.blocklists &&
          (Array.isArray(props.form.errors.blocklists) ? (
            props.form.errors.blocklists.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </Text>
            ))
          ) : (
            <Text style={styles.errorText}>
              {typeof props.form.errors.blocklists === 'string'
                ? props.form.errors.blocklists
                : JSON.stringify(props.form.errors.blocklists)}
            </Text>
          ))}
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
        {props.form.touched.devices &&
          props.form.errors.devices &&
          (Array.isArray(props.form.errors.devices) ? (
            props.form.errors.devices.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </Text>
            ))
          ) : (
            <Text style={styles.errorText}>
              {typeof props.form.errors.devices === 'string'
                ? props.form.errors.devices
                : JSON.stringify(props.form.errors.devices)}
            </Text>
          ))}
        <SelectTime
          timeField={'startedAt'}
          setIsTimePickerVisible={setIsStartTimePickerVisible}
          values={values}
          isTimePickerVisible={isStartTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
        {props.form.touched.startedAt && props.form.errors.startedAt && (
          <Text style={styles.errorText}>{props.form.errors.startedAt}</Text>
        )}

        <SelectTime
          timeField={'endedAt'}
          setIsTimePickerVisible={setIsEndTimePickerVisible}
          values={values}
          isTimePickerVisible={isEndTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />
        {props.form.touched.endedAt && props.form.errors.endedAt && (
          <Text style={styles.errorText}>{props.form.errors.endedAt}</Text>
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
        {props.form.touched.blockingCondition &&
          props.form.errors.blockingCondition && (
            <Text style={styles.errorText}>
              {props.form.errors.blockingCondition}
            </Text>
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
