import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type BlocklistRowFields = {
  name: string
  isSelected: boolean
  onToggle: (isNowSelected: boolean) => void
  onNavigate: () => void
}

type BlocklistRowProps = Readonly<BlocklistRowFields>

export function BlocklistRow({
  name,
  isSelected,
  onToggle,
  onNavigate,
}: BlocklistRowProps) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onNavigate} style={styles.nameContainer}>
        <Text style={styles.nameLink}>{name}</Text>
      </Pressable>
      <Switch
        accessibilityLabel={`Toggle ${name}`}
        style={styles.toggle}
        value={isSelected}
        onValueChange={onToggle}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: T.spacing.small,
  },
  nameContainer: {
    flexShrink: 1,
    flexGrow: 1,
    marginRight: T.spacing.small,
  },
  nameLink: {
    color: T.color.lightBlue,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
    textDecorationLine: 'underline',
  },
  toggle: { marginLeft: T.spacing.medium },
})
