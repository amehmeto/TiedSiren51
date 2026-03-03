import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons'
import { Image, Pressable, StyleSheet, Text } from 'react-native'
import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'
import { CheckboxIndicator } from '@/ui/screens/Blocklists/CheckboxIndicator'
import { LockIcon } from '@/ui/screens/Blocklists/LockIcon'

function isAndroidSiren(
  sirenType: SirenType,
  siren: AndroidSiren | string,
): siren is AndroidSiren {
  return sirenType === SirenType.ANDROID && typeof siren === 'object'
}

type SelectableSirenCardProps = {
  readonly sirenType: SirenType
  readonly siren: AndroidSiren | string
  readonly onPress: () => void
  readonly isSelected: boolean
  readonly isLocked?: boolean
}

export function SelectableSirenCard({
  sirenType,
  siren,
  onPress,
  isSelected,
  isLocked = false,
}: SelectableSirenCardProps) {
  const iconElement =
    // eslint-disable-next-line no-nested-ternary
    isAndroidSiren(sirenType, siren) ? (
      <Image
        source={{ uri: siren.icon }}
        style={styles.appIcon}
        resizeMode="contain"
      />
    ) : sirenType === SirenType.WEBSITES ? (
      <MaterialCommunityIcons
        name={'web'}
        color={T.color.text}
        size={T.icon.size.small}
        style={{ marginRight: T.spacing.small }}
      />
    ) : (
      <FontAwesome6
        name={'hashtag'}
        color={T.color.text}
        size={T.icon.size.small}
        style={{ marginRight: T.spacing.small }}
      />
    )

  const sirenName = isAndroidSiren(sirenType, siren) ? siren.appName : siren

  const baseTestId = isAndroidSiren(sirenType, siren)
    ? `siren-${sirenType}-${siren.packageName}`
    : `siren-${sirenType}-${siren}`

  return (
    <Pressable onPress={onPress} testID={baseTestId} accessibilityRole="button">
      <TiedSCard
        style={[
          styles.container,
          { marginVertical: T.spacing.extraExtraSmall },
          isSelected ? styles.selected : null,
          isLocked ? styles.locked : null,
        ]}
      >
        {iconElement}
        <Text
          style={styles.appName}
          testID={`${baseTestId}-name`}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {sirenName}
        </Text>

        {isLocked ? (
          <LockIcon testID={`${baseTestId}-lock`} />
        ) : (
          <CheckboxIndicator
            isSelected={isSelected}
            onPress={onPress}
            testID={`${baseTestId}-checkbox`}
          />
        )}
      </TiedSCard>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: T.spacing.smallMedium,
    minHeight: T.height.settingsRow,
  },
  appName: {
    color: T.color.text,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.base,
    flexGrow: 1,
    flexShrink: 1,
    marginRight: T.spacing.small,
  },
  appIcon: {
    marginRight: T.spacing.small,
    height: T.icon.size.small,
    width: T.icon.size.small,
    borderRadius: T.border.radius.roundedMedium,
  },
  selected: {
    borderColor: T.color.lightBlue,
    borderWidth: T.border.width.medium,
  },
  locked: {
    opacity: T.opacity.disabled,
  },
})
