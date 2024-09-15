import { useEffect, useState } from 'react'
import { FormikProps } from 'formik'
import { StyleSheet, View } from 'react-native'
import { TiedSBlurView } from '../../../design-system/components/TiedSBlurView.tsx'
import { TiedSButton } from '../../../design-system/components/TiedSButton.tsx'
import { T } from '../../../design-system/theme.ts'
import { Session } from './BlockSessionForm.tsx'
import { HomeStackScreens } from '../../../navigators/screen-lists/HomeStackScreens.ts'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ScreenList } from '../../../navigators/screen-lists/screenLists.ts'
import { TabScreens } from '../../../navigators/screen-lists/TabScreens.ts'
import { SelectFromList } from './SelectFromList.tsx'
import { deviceRepository } from '../../../dependencies.ts'
import { ChooseName } from './ChooseName.tsx'
import { SelectTime } from './SelectTime.tsx'
import { Device } from '../../../../core/device/device.ts'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../core/_redux_/createStore.ts'
import { selectAllBlocklists } from '../../../../core/blocklist/selectors/selectAllBlocklists.ts'

export function SelectBlockSessionParams(
  props: Readonly<{
    navigation: NativeStackNavigationProp<ScreenList, TabScreens.HOME>
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

  const blocklists = useSelector((state: RootState) =>
    selectAllBlocklists(state),
  )

  useEffect(() => {
    deviceRepository.findAll().then((devices) => {
      setDevices(devices)
    })
  }, [])

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
          listType={'blocklists'}
          setFieldValue={setFieldValue}
          items={blocklists}
        />
        <SelectFromList
          values={values}
          listType={'devices'}
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
      </TiedSBlurView>

      <TiedSButton
        text={'START'}
        onPress={() => {
          handleSubmit()
          props.navigation.navigate(HomeStackScreens.MAIN_HOME)
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
})
