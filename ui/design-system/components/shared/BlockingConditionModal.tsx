import { Ionicons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { T } from '@/ui/design-system/theme'
import { TiedSCloseButton } from './TiedSCloseButton'

type IconName =
  | 'time-outline'
  | 'location-outline'
  | 'wifi-outline'
  | 'hourglass-outline'
  | 'power-outline'

type BlockingCondition = {
  iconName: IconName
  title: string
  subtitle: string
}

type BlockingConditionModalProps = {
  visible: boolean
  onClose: () => void
  onSelectCondition: (condition: string) => void
}

type BlockingConditionProps = {
  iconName: IconName
  title: string
  subtitle: string
  onSelect: () => void
}

const TEXTS = {
  MODAL_TITLE: 'Blocking conditions',
  MODAL_SUBTITLE: "Select when or where you don't want to be disturbed",
}

const CONDITIONS: BlockingCondition[] = [
  {
    iconName: 'time-outline',
    title: 'Time',
    subtitle: 'e.g. working hours, weekend',
  },
  {
    iconName: 'location-outline',
    title: 'Location',
    subtitle: 'e.g. workplace or campus',
  },
  {
    iconName: 'wifi-outline',
    title: 'Wi-Fi',
    subtitle: 'e.g. home network',
  },
  {
    iconName: 'hourglass-outline',
    title: 'Usage limit',
    subtitle: 'e.g. max 30 minutes a day / an hour',
  },
  {
    iconName: 'power-outline',
    title: 'Launch count',
    subtitle: 'e.g. max 20 times a day / an hour',
  },
]

export default function BlockingConditionModal({
  visible,
  onClose,
  onSelectCondition,
}: BlockingConditionModalProps) {
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0)

  const animationStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value, { damping: 10, stiffness: 80 }) },
    ],
    opacity: withTiming(opacity.value, { duration: 300 }),
  }))

  useEffect(() => {
    scale.value = visible ? 1 : 0.8
    opacity.value = visible ? 1 : 0
  }, [visible, scale, opacity])

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, animationStyle]}>
          <TiedSCloseButton onClose={onClose} />
          <Text style={styles.modalTitle}>{TEXTS.MODAL_TITLE}</Text>
          <Text style={styles.modalSubtitle}>{TEXTS.MODAL_SUBTITLE}</Text>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {CONDITIONS.map((condition) => (
              <BlockingConditionComponent
                key={condition.title}
                iconName={condition.iconName}
                title={condition.title}
                subtitle={condition.subtitle}
                onSelect={() => onSelectCondition(condition.title)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

function BlockingConditionComponent({
  iconName,
  title,
  subtitle,
  onSelect,
}: BlockingConditionProps) {
  return (
    <TouchableOpacity style={styles.conditionContainer} onPress={onSelect}>
      <Ionicons
        name={iconName}
        size={T.icon.size.large}
        color={T.color.blueIconColor}
        style={styles.conditionIcon}
      />
      <View>
        <Text style={styles.conditionTitle}>{title}</Text>
        <Text style={styles.conditionSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: T.color.modalBackgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: T.layout.width.nineTenths,
    backgroundColor: T.color.modalContentColor,
    borderRadius: T.border.radius.roundedLarge,
    padding: T.spacing.medium,
  },
  modalTitle: {
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    color: T.color.blueIconColor,
    marginBottom: T.component.size.tiny,
    textAlign: 'left',
  },
  modalSubtitle: {
    fontSize: T.font.size.small,
    color: T.color.modalTitleColor,
    marginBottom: T.component.size.medium,
  },
  scrollViewContent: {
    paddingBottom: T.component.size.medium,
  },
  conditionContainer: {
    backgroundColor: T.color.white,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.component.size.small,
    marginBottom: T.component.size.small,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: T.elevation.low,
  },
  conditionIcon: {
    marginRight: T.component.size.medium,
  },
  conditionTitle: {
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
  },
  conditionSubtitle: {
    fontSize: T.font.size.small,
    color: T.color.modalTitleColor,
  },
})
