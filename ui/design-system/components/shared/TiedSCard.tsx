import { BlurView } from 'expo-blur'
import React, { useEffect } from 'react'
import {
  Platform,
  StyleProp,
  StyleSheet,
  ViewStyle,
  findNodeHandle,
} from 'react-native'
import { useBlurTarget } from '@/ui/design-system/contexts/BlurTargetContext'
import { T } from '@/ui/design-system/theme'

type TiedSCardOwnProps = {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

type TiedSCardProps = Readonly<TiedSCardOwnProps>

const isAndroid = Platform.OS === 'android'

export function TiedSCard({ children, style }: TiedSCardProps) {
  const blurTarget = useBlurTarget()

  useEffect(() => {
    const node = blurTarget?.current
    const handle = findNodeHandle(node ?? null)
    // eslint-disable-next-line no-console
    console.log('[TiedSCard] blurTarget debug:', {
      hasRef: blurTarget !== null,
      hasCurrent: node !== null,
      nodeHandle: handle,
      isAndroid,
    })
  }, [blurTarget])

  return (
    <BlurView
      blurReductionFactor={
        isAndroid ? T.effects.blur.reductionFactor : undefined
      }
      blurMethod={isAndroid ? T.effects.blur.method.android : undefined}
      blurTarget={isAndroid && blurTarget ? blurTarget : undefined}
      intensity={T.effects.blur.intensity.modal}
      style={[styles.container, style]}
      tint={T.effects.blur.tint.dark}
    >
      {children}
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: T.color.cardBackground,
    padding: T.spacing.medium,
    marginTop: T.spacing.small,
    marginBottom: T.spacing.small,
    borderRadius: T.border.radius.roundedMedium,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
})
