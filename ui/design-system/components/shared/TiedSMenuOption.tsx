import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text } from 'react-native'
import { MenuOption } from 'react-native-popup-menu'
import { TiedSMenu } from '@/ui/design-system/components/shared/ThreeDotMenu'
import { T } from '@/ui/design-system/theme'

type TiedSMenuOptionOwnProps = {
  option: TiedSMenu
}

type TiedSMenuOptionProps = Readonly<TiedSMenuOptionOwnProps>

export function TiedSMenuOption({ option }: TiedSMenuOptionProps) {
  const { name, iconName, isDisabled = false } = option
  const enabledColor = isDisabled ? T.color.grey : T.color.white

  return (
    <MenuOption
      value={name}
      style={[styles.menuOption, isDisabled && styles.menuOptionDisabled]}
    >
      <Text style={[styles.menuOptionText, { color: enabledColor }]}>
        {name}
      </Text>
      <Ionicons name={iconName} size={T.icon.size.large} color={enabledColor} />
    </MenuOption>
  )
}

const styles = StyleSheet.create({
  menuOptionText: {
    color: T.color.white,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    flex: 1,
  },
  menuOption: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: T.spacing.smallMedium,
    minHeight: T.height.settingsRow,
    backgroundColor: T.color.transparent,
  },
  menuOptionDisabled: {
    opacity: T.opacity.disabled,
  },
})
