import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuOptionsCustomStyle,
  MenuTrigger,
} from 'react-native-popup-menu'
import { Ionicons } from '@expo/vector-icons'
import { TiedSBlurView } from './TiedSBlurView'
import {
  Dimensions,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native'
import { T } from '@/ui/design-system/theme'

type IconName =
  | 'text-outline'
  | 'create-outline'
  | 'copy-outline'
  | 'trash-outline'

type TiedSMenu = {
  name: string
  iconName: IconName
  action: () => void
  textStyle?: StyleProp<TextStyle>
}

function TiedSMenuOption(props: {
  optionName: TiedSMenu['name']
  iconName: TiedSMenu['iconName']
  textStyle?: StyleProp<TextStyle>
}) {
  return (
    <MenuOption value={props.optionName} style={styles.menuOption}>
      <Text style={[styles.menuOptionText, props.textStyle]}>
        {props.optionName}
      </Text>
      <Ionicons
        name={props.iconName}
        size={T.size.large}
        color={T.color.text}
      />
    </MenuOption>
  )
}

export function ThreeDotMenu(props: {
  menuOptions: TiedSMenu[]
  style?: StyleProp<ViewStyle>
}) {
  const selectMenuOption = (optionName: TiedSMenu['name']) => {
    const selectedOption = props.menuOptions.find(
      (option) => option.name === optionName,
    )
    if (!selectedOption) throw new Error('Invalid menu option')
    selectedOption.action()
  }

  return (
    <Menu onSelect={selectMenuOption} style={[props.style]}>
      <MenuTrigger>
        <Ionicons
          name={'ellipsis-horizontal'}
          size={T.size.large}
          color={T.color.text}
        />
      </MenuTrigger>
      <MenuOptions customStyles={optionsStyles}>
        <TiedSBlurView style={styles.menuOptions}>
          {props.menuOptions.map((option) => (
            <TiedSMenuOption
              key={option.name}
              optionName={option.name}
              iconName={option.iconName}
              textStyle={option.textStyle}
            />
          ))}
        </TiedSBlurView>
      </MenuOptions>
    </Menu>
  )
}
// TODO: hacky, should be fixed by finding a way to apply width 100% and flex options
const betweenHalfAndThirdOfWindow = Dimensions.get('window').width / 2.5

const styles = StyleSheet.create({
  menuOptionText: {
    color: T.color.text,
    fontSize: T.size.small,
    flex: 1,
  },
  menuOptions: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: T.spacing.none,
    marginTop: T.spacing.none,
    marginBottom: T.spacing.none,
    backgroundColor: T.color.transparent,
  },
  menuOption: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: betweenHalfAndThirdOfWindow - T.spacing.medium * 2,
    padding: T.spacing.small,
    backgroundColor: T.color.transparent,
  },
})

const optionsStyles: MenuOptionsCustomStyle = {
  optionsContainer: {
    backgroundColor: T.color.transparent,
    borderRadius: T.border.radius.roundedSmall,
    width: betweenHalfAndThirdOfWindow,
    marginTop: T.spacing.medium + 5,
    marginLeft: T.spacing.medium,
    padding: T.spacing.small,
  },
  optionsWrapper: {
    backgroundColor: T.color.transparent,
  },
  optionWrapper: {
    backgroundColor: T.color.transparent,
  },
}
