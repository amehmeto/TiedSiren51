import { StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

export const reauthFormStyles = StyleSheet.create({
  description: {
    color: T.color.text,
    fontSize: T.font.size.regular,
    fontFamily: T.font.family.primary,
    textAlign: 'center',
    marginBottom: T.spacing.medium,
  },
})
