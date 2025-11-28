import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, StyleSheet, View } from 'react-native'
import { TiedSCard } from '@ui/design-system/components/shared/TiedSCard'
import { T } from '@ui/design-system/theme'

export function UnLockMethodCard(props: { inlineRemaining: string }) {
  return (
    <TiedSCard style={styles.unlockCard}>
      <View style={styles.unlockCardContent}>
        <View style={styles.unlockCardLeft}>
          <Ionicons
            name="time-outline"
            size={T.icon.size.medium}
            color={T.color.lightBlue}
          />
          <Text style={styles.unlockLabel}>{'Timer'}</Text>
        </View>
        <Text style={styles.unlockValue}>{props.inlineRemaining}</Text>
      </View>
    </TiedSCard>
  )
}

const styles = StyleSheet.create({
  unlockCard: {
    flexDirection: 'column',
    borderWidth: T.border.width.thin,
    borderColor: T.color.lightBlueShade,
  },
  unlockCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  unlockCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: T.spacing.medium,
  },
  unlockLabel: {
    color: T.color.white,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
  },
  unlockValue: {
    color: T.color.grey,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
  },
})
