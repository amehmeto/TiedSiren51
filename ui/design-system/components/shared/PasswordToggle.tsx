import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

type PasswordToggleOwnProps = {
  isPasswordShown: boolean
  onToggle: () => void
}

type PasswordToggleProps = Readonly<PasswordToggleOwnProps>

export function PasswordToggle({
  isPasswordShown,
  onToggle,
}: PasswordToggleProps) {
  return (
    <Pressable style={styles.iconContainer} onPress={onToggle}>
      <Ionicons
        name={isPasswordShown ? 'eye-outline' : 'eye-off-outline'}
        size={T.icon.size.large}
        color={T.color.grey}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    right: T.spacing.small,
    top: T.spacing.small,
  },
})
