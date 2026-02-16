import { Ionicons } from '@expo/vector-icons'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

type IconName =
  | 'time-outline'
  | 'location-outline'
  | 'wifi-outline'
  | 'hourglass-outline'
  | 'power-outline'

type BlockingConditionItemOwnProps = {
  iconName: IconName
  title: string
  subtitle: string
  onSelect: () => void
}

type BlockingConditionItemProps = Readonly<BlockingConditionItemOwnProps>

export function BlockingConditionItem({
  iconName,
  title,
  subtitle,
  onSelect,
}: BlockingConditionItemProps) {
  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.conditionContainer,
        { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
      ]}
      onPress={onSelect}
    >
      <Ionicons
        name={iconName}
        size={T.icon.size.large}
        color={T.color.lightBlue}
        style={styles.conditionIcon}
      />
      <View>
        <Text style={styles.conditionTitle}>{title}</Text>
        <Text style={styles.conditionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  conditionContainer: {
    backgroundColor: T.color.darkBlueGray,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.medium,
    marginBottom: T.spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionIcon: {
    marginRight: T.spacing.medium,
  },
  conditionTitle: {
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    color: T.color.white,
  },
  conditionSubtitle: {
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    color: T.color.grey,
  },
})
