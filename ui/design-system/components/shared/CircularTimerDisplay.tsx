import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import {
  StrictModeViewModel,
  StrictModeViewState,
} from '@ui/screens/StrictMode/strict-mode.view-model'

type CircularTimerDisplayProps = {
  viewModel: StrictModeViewModel
}

export const CircularTimerDisplay = ({
  viewModel,
}: Readonly<CircularTimerDisplayProps>) => {
  const isActive = viewModel.type === StrictModeViewState.Active

  return (
    <View style={styles.container}>
      {isActive && (
        <Ionicons
          name="lock-closed-outline"
          size={T.icon.size.xLarge}
          color={T.color.lightBlue}
        />
      )}
      <Text style={styles.timerText}>{viewModel.countdown}</Text>
      {viewModel.type === StrictModeViewState.Active && (
        <Text style={styles.title}>{viewModel.endDateTime}</Text>
      )}

      <Text style={styles.statusMessage}>{viewModel.statusMessage}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: T.spacing.xx_large,
  },
  title: {
    color: T.color.textMuted,
    fontSize: T.font.size.small,
    marginBottom: T.spacing.small,
    fontFamily: T.font.family.primary,
  },
  timerText: {
    color: T.color.text,
    fontSize: T.font.size.xxLarge,
    fontFamily: T.font.family.heading,
    letterSpacing: T.font.letterSpacing.tight,
  },
  statusMessage: {
    color: T.color.textMuted,
    fontSize: T.font.size.regular,
    textAlign: 'center',
    marginTop: T.spacing.large,
    lineHeight: T.font.size.large,
    fontFamily: T.font.family.primary,
    paddingHorizontal: T.spacing.xx_large,
  },
})
