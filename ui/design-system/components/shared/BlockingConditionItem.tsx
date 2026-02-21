import { Ionicons } from '@expo/vector-icons'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { BlockingCondition } from '@/ui/design-system/components/shared/BlockingConditionModal'
import { T } from '@/ui/design-system/theme'

type BlockingConditionItemOwnProps = {
  condition: BlockingCondition
  onSelect: () => void
}

type BlockingConditionItemProps = Readonly<BlockingConditionItemOwnProps>

export function BlockingConditionItem({
  condition,
  onSelect,
}: BlockingConditionItemProps) {
  const { iconName, title, subtitle } = condition

  return (
    <Pressable
      style={({ pressed: isPressed }) => [
        styles.conditionContainer,
        { opacity: isPressed ? T.opacity.pressed : T.opacity.full },
      ]}
      onPress={onSelect}
      accessibilityRole="button"
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
    backgroundColor: T.color.surfaceElevated,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.medium,
    marginBottom: T.spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
  conditionIcon: {
    marginRight: T.spacing.medium,
  },
  conditionTitle: {
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.semibold,
    fontFamily: T.font.family.semibold,
    color: T.color.text,
  },
  conditionSubtitle: {
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    color: T.color.textMuted,
  },
})
