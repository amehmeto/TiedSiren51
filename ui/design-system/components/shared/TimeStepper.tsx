import React, { useCallback } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSIconButton } from './TiedSIconButton'

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

  const label = selectedValue === 1 ? labelSingular : labelPlural

  const changeValue = useCallback(
    (delta: number) => {
      const next = selectedValue + delta
      if (next >= 0 && next <= max) onValueChange(next)
    },
    [selectedValue, max, onValueChange],
  )

  return (
    <View style={styles.container}>
      <TiedSIconButton
        iconName="add-circle"
        isDisabled={isMax}
        onPress={() => changeValue(1)}
      />

      <View style={styles.valueContainer}>
        <Text style={styles.valueNumber}>{selectedValue}</Text>
        <Text style={styles.valueLabel}>{label}</Text>
      </View>

      <TiedSIconButton
        iconName="remove-circle"
        isDisabled={isMin}
        onPress={() => changeValue(-1)}
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
  valueContainer: {
    minHeight: T.spacing.xxx_large,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: T.spacing.small,
  },
  valueNumber: {
    color: T.color.white,
    fontSize: T.font.size.xLarge,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
  },
  valueLabel: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginTop: T.spacing.extraExtraSmall,
  },
})
