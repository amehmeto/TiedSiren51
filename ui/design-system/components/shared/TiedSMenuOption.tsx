import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text } from 'react-native'
import { TiedSMenu } from '@/ui/design-system/components/shared/ThreeDotMenu'
import { T } from '@/ui/design-system/theme'

type TiedSMenuOptionOwnProps = {
  option: TiedSMenu
  onSelect: (name: string) => void
}

type TiedSMenuOptionProps = Readonly<TiedSMenuOptionOwnProps>

export function TiedSMenuOption({ option, onSelect }: TiedSMenuOptionProps) {
  const { name, iconName, isDisabled = false } = option
  const enabledColor = isDisabled ? T.color.textMuted : T.color.text

  return (
    <Pressable
      onPress={() => onSelect(name)}
      style={[styles.menuOption, isDisabled && styles.menuOptionDisabled]}
    >
      <Text style={[styles.menuOptionText, { color: enabledColor }]}>
        {name}
      </Text>
      <Ionicons name={iconName} size={T.icon.size.large} color={enabledColor} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  menuOptionText: {
    color: T.color.text,
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
