import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TimeRemaining } from '@/core/timer/timer'
import { T } from '@/ui/design-system/theme'
import { formatInlineRemaining } from '@/ui/utils/timeFormat'

type UnlockMethodCardProps = {
  timeRemaining: TimeRemaining
}

export const UnlockMethodCard = ({
  timeRemaining,
}: Readonly<UnlockMethodCardProps>) => {
  return (
    <View style={styles.advancedSection}>
      <Text style={styles.advancedTitle}>{'UNLOCK METHOD'}</Text>
      <View style={styles.unlockMethodCard}>
        <View style={styles.unlockMethodRow}>
          <View style={styles.unlockMethodLeft}>
            <Ionicons name="time-outline" size={22} color={T.color.lightBlue} />
            <Text style={styles.unlockMethodLabel}>{'Timer'}</Text>
          </View>
          <Text style={styles.unlockMethodValue}>
            {formatInlineRemaining(timeRemaining)}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  advancedSection: {
    paddingHorizontal: T.spacing.large,
    marginTop: T.spacing.xx_large,
  },
  advancedTitle: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
    letterSpacing: 1,
  },
  unlockMethodCard: {
    backgroundColor: T.color.darkBlueGray,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.medium,
    borderWidth: T.border.width.thin,
    borderColor: T.color.lightBlueShade,
  },
  unlockMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unlockMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.medium,
  },
  unlockMethodLabel: {
    color: T.color.white,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
  },
  unlockMethodValue: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
  },
})
