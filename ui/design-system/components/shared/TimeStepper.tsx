import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from './TiedSButton'

type TimeStepperProps = {
  selectedValue: number
  max: number
  labelSingular: string
  labelPlural: string
  onValueChange: (value: number) => void
}

export const TimeStepper = ({
  selectedValue,
  max,
  labelSingular,
  labelPlural,
  onValueChange,
}: Readonly<TimeStepperProps>) => {
  const isMin = selectedValue <= 0
  const isMax = selectedValue >= max

  const displayText = useMemo(
    () =>
      `${selectedValue} ${selectedValue === 1 ? labelSingular : labelPlural}`,
    [selectedValue, labelSingular, labelPlural],
  )

  const changeValue = useCallback(
    (delta: number) => {
      const next = selectedValue + delta
      if (next >= 0 && next <= max) onValueChange(next)
    },
    [selectedValue, max, onValueChange],
  )

  const renderIcon = useCallback(
    (name: 'add-circle' | 'remove-circle', disabled: boolean) => (
      <Ionicons
        name={name}
        size={T.icon.size.large}
        color={disabled ? T.color.modalBackgroundColor : T.color.white}
      />
    ),
    [],
  )

  const buttonStyle = (disabled: boolean) => [
    styles.button,
    disabled && styles.buttonDisabled,
  ]

  return (
    <View style={styles.container}>
      <TiedSButton
        disabled={isMin}
        style={buttonStyle(isMin)}
        onPress={() => changeValue(-1)}
        text={renderIcon('remove-circle', isMin)}
      />

      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{displayText}</Text>
      </View>

      <TiedSButton
        disabled={isMax}
        style={buttonStyle(isMax)}
        onPress={() => changeValue(1)}
        text={renderIcon('add-circle', isMax)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: T.spacing.x_large,
    height: T.spacing.x_large,
    borderRadius: T.border.radius.fullRound,
    backgroundColor: T.color.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: T.spacing.extraSmall,
  },
  buttonDisabled: {
    backgroundColor: T.color.textSecondary,
    opacity: T.opacity.disabled,
  },
  valueContainer: {
    minHeight: T.spacing.xxx_large,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: T.spacing.extraSmall,
  },
  valueText: {
    color: T.color.white,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    lineHeight: T.font.size.regular * T.font.lineHeight.normal,
  },
})
