import { Image, Pressable, StyleSheet, Text } from 'react-native'
import { T } from '@/ui/design-system/theme'
import { InstalledApp } from '@/core/installed-app/InstalledApp'
import { FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons'
import { CheckBox } from 'react-native-elements'

import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { TiedSBlurView } from '@/ui/design-system/components/shared/TiedSBlurView'

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
  const dataImagePngBase64 = 'data:image/png;base64,'
  const iconElement =
    sirenType === SirenType.ANDROID ? (
      <Image
        source={{ uri: dataImagePngBase64 + (siren as InstalledApp).icon }}
        style={styles.appIcon}
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
        <Text style={styles.appName} testID={`${baseTestId}-name`}>
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
  },
  checkbox: {
    alignItems: 'flex-end',
  },
  checkboxContainer: {
    padding: T.spacing.none,
    margin: T.spacing.none,
  },
  appName: {
    color: T.color.text,
    flexGrow: 1,
    alignItems: 'flex-end',
  },
  appIcon: {
    marginRight: T.spacing.small,
    height: T.sirenIconSize,
    width: T.sirenIconSize,
  },
  selected: {
    borderColor: T.color.lightBlue,
    borderWidth: 2,
  },
})
