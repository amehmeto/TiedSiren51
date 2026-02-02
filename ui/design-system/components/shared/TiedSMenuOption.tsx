import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text } from 'react-native'
import { MenuOption } from 'react-native-popup-menu'
import { T } from '@/ui/design-system/theme'

type IconName =
  | 'text-outline'
  | 'create-outline'
  | 'copy-outline'
  | 'trash-outline'

type TiedSMenuOptionProps = Readonly<{
  optionName: string
  iconName: IconName
  isDisabled?: boolean
}>

export function TiedSMenuOption({
  optionName,
  iconName,
  isDisabled = false,
}: TiedSMenuOptionProps) {
  const enabledColor = isDisabled ? T.color.grey : T.color.white

  return (
    <MenuOption
      value={optionName}
      style={[styles.menuOption, isDisabled && styles.menuOptionDisabled]}
    >
      <Text style={[styles.menuOptionText, { color: enabledColor }]}>
        {optionName}
      </Text>
      <Ionicons name={iconName} size={T.icon.size.large} color={enabledColor} />
    </MenuOption>
  )
}

const styles = StyleSheet.create({
  menuOptionText: {
    color: T.color.white,
    fontSize: T.font.size.small,
    flex: 1,
  },
  menuOption: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: T.spacing.small,
    backgroundColor: T.color.transparent,
  },
  menuOptionDisabled: {
    opacity: T.opacity.disabled,
  },
})
