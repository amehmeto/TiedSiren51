import { BlurTargetView, BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useRef } from 'react'
import { Modal, Platform, StyleSheet, View } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { BlurTargetContext } from './BlurTargetContext'
import { TiedSCard } from './TiedSCard'

type TiedSModalOwnProps = {
  isVisible: boolean
  children: React.ReactNode
  onRequestClose: () => void
  style?: Record<string, unknown>
}

type TiedSModalProps = Readonly<TiedSModalOwnProps>

const gradientColors = [
  T.color.darkBlue,
  T.color.gradientMid,
  T.color.purple,
] as const

const gradientStart = { x: 0, y: 0 }
const gradientEnd = { x: 1, y: 1 }

export function TiedSModal({
  isVisible,
  children,
  onRequestClose,
  style,
}: TiedSModalProps) {
  const blurTargetRef = useRef<View | null>(null)

  if (Platform.OS === 'android') {
    return (
      <Modal
        animationType="slide"
        transparent
        visible={isVisible}
        onRequestClose={onRequestClose}
      >
        <View style={styles.centeredView}>
          <View style={[styles.cardColumn, styles.blurWrapper, style]}>
            <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
              <LinearGradient
                colors={gradientColors}
                start={gradientStart}
                end={gradientEnd}
                style={styles.fill}
              />
            </BlurTargetView>
            <BlurTargetContext.Provider value={blurTargetRef}>
              <TiedSCard style={styles.cardFull}>{children}</TiedSCard>
            </BlurTargetContext.Provider>
          </View>
        </View>
      </Modal>
    )
  }

  return (
    <Modal
      animationType="slide"
      transparent
      visible={isVisible}
      onRequestClose={onRequestClose}
    >
      <BlurView
        intensity={T.effects.blur.intensity.strong}
        tint={T.effects.blur.tint.dark}
        style={styles.centeredView}
      >
        <TiedSCard style={[styles.cardColumn, style]}>{children}</TiedSCard>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: T.spacing.medium,
    backgroundColor: T.color.modalBackgroundColor,
  },
  cardColumn: {
    flexDirection: 'column',
    width: T.layout.width.nineTenths,
    maxHeight: '80%',
  },
  blurWrapper: {
    borderRadius: T.border.radius.roundedMedium,
    overflow: 'hidden',
  },
  cardFull: {
    flexDirection: 'column',
    width: '100%',
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 0,
  },
})
