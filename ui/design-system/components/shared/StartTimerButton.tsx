import { StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from './TiedSButton'

type StartTimerButtonProps = {
  onStartTimer: () => void
}

export const StartTimerButton = ({
  onStartTimer,
}: Readonly<StartTimerButtonProps>) => {
  return (
    <View style={styles.actionButtons}>
      <TiedSButton
        onPress={onStartTimer}
        text="Start Timer"
        style={styles.primaryButton}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: T.border.radius.extraRounded,
    overflow: 'hidden',
    shadowColor: T.color.lightBlue,
    shadowOffset: T.shadow.offsets.medium,
    shadowOpacity: 0.3,
    shadowRadius: T.shadow.radius.medium,
    elevation: T.elevation.highest,
  },
  actionButtons: {
    paddingHorizontal: T.spacing.large,
    gap: T.spacing.medium,
  },
})
