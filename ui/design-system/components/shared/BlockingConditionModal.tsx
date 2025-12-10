import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { TiedSCloseButton } from './TiedSCloseButton'
import { TiedSModal } from './TiedSModal'

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
  return (
    <TiedSModal isVisible={visible} onRequestClose={onClose}>
      <View style={styles.container}>
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
      </View>
    </TiedSModal>
  )
}

function BlockingConditionComponent({
  iconName,
  title,
  subtitle,
  onSelect,
}: BlockingConditionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.conditionContainer,
        { opacity: pressed ? T.opacity.pressed : T.opacity.full },
      ]}
      onPress={onSelect}
    >
      <Ionicons
        name={iconName}
        size={T.icon.size.large}
        color={T.color.lightBlue}
        style={styles.conditionIcon}
      />
      <View>
        <Text style={styles.conditionTitle}>{title}</Text>
        <Text style={styles.conditionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: T.font.size.large,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    color: T.color.white,
    marginBottom: T.spacing.small,
  },
  modalSubtitle: {
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    color: T.color.grey,
    marginBottom: T.spacing.medium,
  },
  scrollViewContent: {
    paddingBottom: T.spacing.medium,
  },
  conditionContainer: {
    backgroundColor: T.color.darkBlueGray,
    borderRadius: T.border.radius.roundedMedium,
    padding: T.spacing.medium,
    marginBottom: T.spacing.small,
    flexDirection: 'row',
    alignItems: 'center',
  },
  conditionIcon: {
    marginRight: T.spacing.medium,
  },
  conditionTitle: {
    fontSize: T.font.size.regular,
    fontWeight: T.font.weight.bold,
    fontFamily: T.font.family.primary,
    color: T.color.white,
  },
  conditionSubtitle: {
    fontSize: T.font.size.small,
    fontFamily: T.font.family.primary,
    color: T.color.grey,
  },
})
