import { useEffect, useState } from 'react'
import { FormikProps } from 'formik'
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { deviceRepository } from '@/ui/dependencies'
import { Device } from '@/core/device/device'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { Session } from '@/ui/screens/Home/shared/BlockSessionForm'
import { TiedSBlurView } from '@/ui/design-system/components/components/TiedSBlurView'
import { ChooseName } from '@/ui/screens/Home/shared/ChooseName'
import { SelectFromList } from '@/ui/screens/Home/shared/SelectFromList'
import { SelectTime } from '@/ui/screens/Home/shared/SelectTime'
import { TiedSButton } from '@/ui/design-system/components/components/TiedSButton'
import { useRouter } from 'expo-router'
import BlockingConditionModal from '@/ui/design-system/components/components/BlockingConditionModal'

enum BlockSessionParams {
  BUTTON_TEXT_START = 'START',
  LIST_TYPE_BLOCKLISTS = 'blocklists',
  LIST_TYPE_DEVICES = 'devices',
  LABEL_BLOCKING_CONDITIONS = 'Blocking Conditions',
  DEFAULT_BLOCKING_CONDITION = 'Select Blocking Conditions',
  ROUTE_TABS = '/(tabs)',
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

  const router = useRouter()

  useEffect(() => {
    deviceRepository.findAll().then((devices) => {
      setDevices(devices)
    })
  }, [])

  const handleSelectBlockingCondition = (selectedCondition: string) => {
    setFieldValue('blockingCondition', selectedCondition)
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

        <SelectFromList
          values={values}
          listType={BlockSessionParams.LIST_TYPE_BLOCKLISTS}
          setFieldValue={setFieldValue}
          items={blocklists}
        />
        <SelectFromList
          values={values}
          listType={BlockSessionParams.LIST_TYPE_DEVICES}
          setFieldValue={setFieldValue}
          items={devices}
        />
        <SelectTime
          timeField={'startedAt'}
          setIsTimePickerVisible={setIsStartTimePickerVisible}
          values={values}
          isTimePickerVisible={isStartTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />

        <SelectTime
          timeField={'endedAt'}
          setIsTimePickerVisible={setIsEndTimePickerVisible}
          values={values}
          isTimePickerVisible={isEndTimePickerVisible}
          setFieldValue={setFieldValue}
          handleChange={handleChange}
        />

        <TouchableOpacity
          style={styles.blockingCondition}
          onPress={() => setBlockingConditionModalVisible(true)}
        >
          <Text style={styles.label}>
            {BlockSessionParams.LABEL_BLOCKING_CONDITIONS}
          </Text>
          <Text style={styles.option}>
            {values.blockingCondition ||
              BlockSessionParams.DEFAULT_BLOCKING_CONDITION}
          </Text>
        </TouchableOpacity>
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
          router.push(BlockSessionParams.ROUTE_TABS)
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
  param: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: T.spacing.medium,
    paddingBottom: T.spacing.medium,
    paddingLeft: T.spacing.small,
    paddingRight: T.spacing.small,
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
    borderBottomWidth: 1,
    borderBottomColor: T.color.lightBlue,
  },
})
