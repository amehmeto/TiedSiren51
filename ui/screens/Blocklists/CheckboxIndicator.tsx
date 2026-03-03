import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type CheckboxIndicatorOwnProps = {
  isSelected: boolean
  onPress: () => void
  testID: string
}

type CheckboxIndicatorProps = Readonly<CheckboxIndicatorOwnProps>

export function CheckboxIndicator({
  isSelected,
  onPress,
  testID,
}: CheckboxIndicatorProps) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={styles.checkboxContainer}
    >
      <View style={[styles.checkboxBox, isSelected && styles.checkboxChecked]}>
        {isSelected && (
          <Ionicons
            name="checkmark"
            size={T.icon.size.xSmall}
            color={T.color.text}
          />
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  checkboxContainer: {
    padding: T.spacing.small,
  },
  checkboxBox: {
    width: T.icon.size.medium,
    height: T.icon.size.medium,
    borderRadius: T.border.radius.roundedSmall,
    borderWidth: T.border.width.medium,
    borderColor: T.color.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: T.color.lightBlue,
    borderColor: T.color.lightBlue,
  },
})
