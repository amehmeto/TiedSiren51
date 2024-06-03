import { useEffect, useState } from 'react'
import { FormikProps } from 'formik'
import { StyleSheet, View } from 'react-native'
import { T } from '@/app/design-system/theme'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { deviceRepository } from '@/app/dependencies'
import { Device } from '@/core/device/device'
import { useSelector } from 'react-redux'
import { RootState } from '@/core/_redux_/createStore'
import { selectAllBlocklists } from '@/core/blocklist/selectors/selectAllBlocklists'
import { ScreenList } from '@/app/navigation/screen-lists/screenLists'
import { TabScreens } from '@/app/navigation/screen-lists/TabScreens'
import { Session } from '@/app/screens/Home/shared/BlockSessionForm'
import { TiedSBlurView } from '@/app/design-system/components/components/TiedSBlurView'
import { ChooseName } from '@/app/screens/Home/shared/ChooseName'
import { SelectFromList } from '@/app/screens/Home/shared/SelectFromList'
import { SelectTime } from '@/app/screens/Home/shared/SelectTime'
import { TiedSButton } from '@/app/design-system/components/components/TiedSButton'
import { HomeStackScreens } from '@/app/navigation/screen-lists/HomeStackScreens'

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
