import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSButton } from './TiedSButton'

type TimeStepperProps = {
  selectedValue: number
  onValueChange: (value: number) => void
  max: number
  labelSingular: string
  labelPlural: string
}

export const TimeStepper = ({
  selectedValue,
  onValueChange,
  max,
  labelSingular,
  labelPlural,
}: Readonly<TimeStepperProps>) => {
  const handleIncrement = () => {
    if (selectedValue < max) onValueChange(selectedValue + 1)
  }

  const handleDecrement = () => {
    if (selectedValue > 0) onValueChange(selectedValue - 1)
  }

  const label = selectedValue !== 1 ? labelPlural : labelSingular
  const displayText = `${selectedValue} ${label}`

  const isDecrementDisabled = selectedValue === 0
  const isIncrementDisabled = selectedValue === max

  const decrementIconColor = isDecrementDisabled
    ? T.color.modalBackgroundColor
    : T.color.white
  const incrementIconColor = isIncrementDisabled
    ? T.color.modalBackgroundColor
    : T.color.white

  const decrementButtonStyle = [
    styles.button,
    isDecrementDisabled && styles.buttonDisabled,
  ]
  const incrementButtonStyle = [
    styles.button,
    isIncrementDisabled && styles.buttonDisabled,
  ]

  const decrementIcon = (
    <Ionicons
      name="remove-circle"
      size={T.icon.size.large}
      color={decrementIconColor}
    />
  )

  const incrementIcon = (
    <Ionicons
      name="add-circle"
      size={T.icon.size.large}
      color={incrementIconColor}
    />
  )

  return (
    <View style={styles.container}>
      <TiedSButton
        onPress={handleDecrement}
        disabled={isDecrementDisabled}
        text={decrementIcon}
        style={decrementButtonStyle}
      />

      <View style={styles.valueContainer}>
        <Text style={styles.valueText}>{displayText}</Text>
      </View>

      <TiedSButton
        onPress={handleIncrement}
        disabled={isIncrementDisabled}
        text={incrementIcon}
        style={incrementButtonStyle}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
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
    padding: 0,
    marginBottom: T.spacing.extraSmall,
    minWidth: T.spacing.x_large,
    maxWidth: T.spacing.x_large,
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
