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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButtons: {
    paddingHorizontal: T.spacing.large,
    gap: T.spacing.medium,
  },
})
