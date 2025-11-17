import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'

type StrictModeButtonsProps = {
  isActive: boolean
  onStartTimer: () => void
  onExtendTimer: () => void
  onStopTimer: () => void
}

export const StrictModeButtons = ({
  isActive,
  onStartTimer,
  onExtendTimer,
  onStopTimer,
}: Readonly<StrictModeButtonsProps>) => {
  if (!isActive) {
    return (
      <View style={styles.actionButtons}>
        <Pressable style={styles.primaryButton} onPress={onStartTimer}>
          {({ pressed }) => (
            <LinearGradient
              colors={[T.color.buttonPrimary, T.color.buttonPrimaryDark]}
              style={[styles.buttonGradient, pressed && styles.pressed]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.buttonText}>{'Start Timer'}</Text>
            </LinearGradient>
          )}
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.actionButtons}>
      <Pressable style={styles.secondaryButton} onPress={onExtendTimer}>
        {({ pressed }) => (
          <View style={pressed && styles.pressed}>
            <Text style={styles.secondaryButtonText}>{'Extend Timer'}</Text>
          </View>
        )}
      </Pressable>
      <Pressable style={styles.dangerButton} onPress={onStopTimer}>
        {({ pressed }) => (
          <View style={pressed && styles.pressed}>
            <Text style={styles.dangerButtonText}>{'Stop Timer'}</Text>
          </View>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  actionButtons: {
    paddingHorizontal: T.spacing.large,
    gap: T.spacing.medium,
  },
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
  buttonGradient: {
    paddingVertical: T.spacing.medium,
    alignItems: 'center',
  },
  buttonText: {
    color: T.color.white,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  secondaryButton: {
    backgroundColor: T.color.buttonSecondaryBg,
    borderRadius: T.border.radius.extraRounded,
    paddingVertical: T.spacing.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.color.buttonSecondaryBorder,
  },
  secondaryButtonText: {
    color: T.color.white,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  dangerButton: {
    backgroundColor: T.color.buttonDangerBg,
    borderRadius: T.border.radius.extraRounded,
    paddingVertical: T.spacing.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.color.buttonDangerBorder,
  },
  dangerButtonText: {
    color: T.color.buttonDangerText,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
  },
  pressed: {
    opacity: 0.7,
  },
})
