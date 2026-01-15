import { Ionicons } from '@expo/vector-icons'
import { useMemo } from 'react'
import {
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  ViewStyle,
} from 'react-native'
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu'
import { T } from '@/ui/design-system/theme'
import { TiedSCard } from './TiedSCard'

type IconName =
  | 'text-outline'
  | 'create-outline'
  | 'copy-outline'
  | 'trash-outline'

type TiedSMenu = {
  name: string
  iconName: IconName
  action: () => void
}

type TiedSMenuOptionProps = {
  optionName: TiedSMenu['name']
  iconName: TiedSMenu['iconName']
}

function TiedSMenuOption({ optionName, iconName }: TiedSMenuOptionProps) {
  return (
    <MenuOption value={optionName} style={styles.menuOption}>
      <Text style={styles.menuOptionText}>{optionName}</Text>
      <Ionicons
        name={iconName}
        size={T.icon.size.large}
        color={T.color.white}
      />
    </MenuOption>
  )
}

type ThreeDotMenuProps = {
  menuOptions: TiedSMenu[]
  style?: StyleProp<ViewStyle>
}

export function ThreeDotMenu({ menuOptions, style }: ThreeDotMenuProps) {
  const { width: windowWidth } = useWindowDimensions()

  const menuWidth = useMemo(() => {
    const fortyPercent = windowWidth * 0.4
    const seventyPercent = windowWidth * 0.7
    // eslint-disable-next-line local-rules/prefer-inline-variable -- keep for readability
    const minWidth = 160

    const lowerBound = Math.max(fortyPercent, minWidth)
    return Math.min(lowerBound, seventyPercent)
  }, [windowWidth])

  const selectMenuOption = (optionName: TiedSMenu['name']) => {
    const selectedOption = menuOptions.find(
      (option) => option.name === optionName,
    )
    if (!selectedOption) throw new Error('Invalid menu option')
    selectedOption.action()
  }

  const dynamicStyles = useMemo(
    () => ({
      menuOption: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: menuWidth - T.spacing.medium * 2,
        padding: T.spacing.small,
        backgroundColor: T.color.transparent,
      },
      optionsContainer: {
        backgroundColor: T.color.transparent,
        borderRadius: T.border.radius.roundedSmall,
        width: menuWidth,
        marginTop: T.spacing.medium + 5,
        marginLeft: T.spacing.medium,
        padding: T.spacing.small,
      },
    }),
    [menuWidth],
  )

  return (
    <Menu onSelect={selectMenuOption} style={style}>
      <MenuTrigger>
        <Ionicons
          name={'ellipsis-horizontal'}
          size={T.icon.size.large}
          color={T.color.text}
        />
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: dynamicStyles.optionsContainer,
        }}
      >
        <TiedSCard style={styles.menuOptions}>
          {menuOptions.map((option) => (
            <TiedSMenuOption
              key={option.name}
              optionName={option.name}
              iconName={option.iconName}
            />
          ))}
        </TiedSCard>
      </MenuOptions>
    </Menu>
  )
}

const styles = StyleSheet.create({
  menuOptionText: {
    color: T.color.white,
    fontSize: T.font.size.small,
    flex: 1,
  },
  menuOptions: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: T.spacing.none,
    marginTop: T.spacing.none,
    marginBottom: T.spacing.none,
  },
  menuOption: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: T.spacing.small,
    backgroundColor: T.color.transparent,
  },
})
