import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { T } from '@/ui/design-system/theme'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

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
  onSelectBlockingCondition: (condition: string) => void
}

type BlockingConditionComponentProps = {
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
  onSelectBlockingCondition,
}: BlockingConditionModalProps) {
  const scale = useSharedValue(0.8)
  const opacity = useSharedValue(0)

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(scale.value, { damping: 10, stiffness: 80 }) },
      ],
      opacity: withTiming(opacity.value, { duration: 300 }),
    }
  })

  React.useEffect(() => {
    if (visible) {
      scale.value = 1
      opacity.value = 1
    } else {
      scale.value = 0.8
      opacity.value = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalContent, animatedStyle]}>
          <TouchableOpacity style={styles.closeIconContainer} onPress={onClose}>
            <Ionicons name="close" size={28} color={T.color.blueIconColor} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{TEXTS.MODAL_TITLE}</Text>
          <Text style={styles.modalSubtitle}>{TEXTS.MODAL_SUBTITLE}</Text>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            {CONDITIONS.map((condition, index) => (
              <BlockingConditionComponent
                key={index}
                iconName={condition.iconName}
                title={condition.title}
                subtitle={condition.subtitle}
                onSelect={() => onSelectBlockingCondition(condition.title)}
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
}: BlockingConditionComponentProps) {
  return (
    <TouchableOpacity style={styles.conditionContainer} onPress={onSelect}>
      <Ionicons
        name={iconName}
        size={T.size.large}
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
    width: '90%',
    backgroundColor: T.color.modalContentColor,
    borderRadius: T.border.radius.roundedLarge,
    padding: T.spacing.medium,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    color: T.color.blueIconColor,
    marginBottom: T.size.tiny,
    textAlign: 'left',
  },
  modalSubtitle: {
    fontSize: T.size.small,
    color: T.color.modalTitleColor,
    marginBottom: T.size.medium,
  },
  scrollViewContent: {
    paddingBottom: T.size.medium,
  },
  conditionContainer: {
    backgroundColor: T.color.white,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.size.small,
    marginBottom: T.size.small,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  conditionIcon: {
    marginRight: T.size.medium,
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
