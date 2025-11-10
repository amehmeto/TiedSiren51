import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons'
import { Image, Pressable, StyleSheet, Text } from 'react-native'
import { CheckBox } from 'react-native-elements'
import { InstalledApp } from '@/core/installed-app/InstalledApp'

import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { TiedSBlurView } from '@/ui/design-system/components/shared/TiedSBlurView'
import { T } from '@/ui/design-system/theme'

export function SelectableSirenCard({
  sirenType,
  siren,
  onPress,
  isSelected,
}: Readonly<{
  sirenType: SirenType
  siren: AndroidSiren | string
  onPress: () => void
  isSelected: boolean
}>) {
  const iconElement =
    // eslint-disable-next-line no-nested-ternary
    sirenType === SirenType.ANDROID ? (
      <Image
        source={{ uri: (siren as InstalledApp).icon }}
        style={styles.appIcon}
        resizeMode="contain"
      />
    ) : sirenType === SirenType.WEBSITES ? (
      <MaterialCommunityIcons
        name={'web'}
        color={T.color.white}
        size={20}
        style={[{ marginRight: T.spacing.small }]}
      />
    ) : (
      <FontAwesome6
        name={'hashtag'}
        color={T.color.white}
        size={T.sirenIconSize}
        style={[{ marginRight: T.spacing.small }]}
      />
    )

  const sirenName =
    sirenType === SirenType.ANDROID
      ? (siren as InstalledApp).appName
      : (siren as string)

  const baseTestId =
    sirenType === SirenType.ANDROID
      ? `siren-${sirenType}-${(siren as InstalledApp).packageName}`
      : `siren-${sirenType}-${siren}`

  return (
    <Pressable onPress={onPress} testID={baseTestId}>
      <TiedSBlurView
        style={[
          styles.container,
          { marginVertical: T.spacing.extraExtraSmall },
          isSelected ? styles.selected : null,
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

        <CheckBox
          style={styles.checkbox}
          containerStyle={styles.checkboxContainer}
          checked={isSelected}
          checkedColor={T.color.lightBlue}
          onPress={onPress}
          testID={`${baseTestId}-checkbox`}
        />
      </TiedSBlurView>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: T.spacing.small,
  },
  checkbox: {
    alignItems: 'flex-end',
  },
  checkboxContainer: {
    padding: T.spacing.none,
    margin: T.spacing.none,
    backgroundColor: T.color.transparent,
  },
  appName: {
    color: T.color.text,
    flexGrow: 1,
    flexShrink: 1,
    marginRight: T.spacing.small,
  },
  appIcon: {
    marginRight: T.spacing.small,
    height: T.sirenIconSize,
    width: T.sirenIconSize,
    borderRadius: T.border.radius.roundedMedium,
  },
  selected: {
    borderColor: T.color.lightBlue,
    borderWidth: 2,
  },
})
