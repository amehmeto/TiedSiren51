import { StyleSheet, Switch, View } from 'react-native'
import { TiedSTextLink } from '@/ui/design-system/components/shared/TiedSTextLink'
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
      <View style={styles.nameContainer}>
        <TiedSTextLink
          text={name}
          onPress={onNavigate}
          style={styles.nameLink}
        />
      </View>
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
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
  },
  toggle: { marginLeft: T.spacing.medium },
})
