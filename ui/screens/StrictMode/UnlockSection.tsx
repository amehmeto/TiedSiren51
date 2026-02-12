import { StyleSheet, Text, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { UnLockMethodCard } from '@ui/screens/StrictMode/UnLockMethodCard'

type UnlockSectionProps = Readonly<{
  inlineRemaining: string
}>

export function UnlockSection({ inlineRemaining }: UnlockSectionProps) {
  return (
    <View style={styles.unlockSection}>
      <Text style={styles.sectionTitle}>{'UNLOCK METHOD'}</Text>
      <UnLockMethodCard inlineRemaining={inlineRemaining} />
    </View>
  )
}

const styles = StyleSheet.create({
  unlockSection: {
    paddingHorizontal: T.spacing.large,
    marginTop: T.spacing.xx_large,
  },
  sectionTitle: {
    color: T.color.grey,
    fontSize: T.font.size.small,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    marginBottom: T.spacing.medium,
    letterSpacing: T.font.letterSpacing.normal,
  },
})
