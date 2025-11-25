// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/

import { type IconProps } from '@expo/vector-icons/build/createIconSet'
import Ionicons from '@expo/vector-icons/Ionicons'
import { type ComponentProps } from 'react'
import { StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

export function TabBarIcon({
  style,
  ...rest
}: IconProps<ComponentProps<typeof Ionicons>['name']>) {
  return (
    <Ionicons
      size={T.icon.size.xLarge}
      style={[styles.tabIcon, style]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  tabIcon: { marginBottom: T.spacing.negativeExtraSmall },
})
