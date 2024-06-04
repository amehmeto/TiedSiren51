import { IconProps } from '@expo/vector-icons/build/createIconSet'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { T } from '@/app-view/design-system/theme'
import React from 'react'
import { TiedSBlurView } from '@/app-view/design-system/components/components/TiedSBlurView'

export function BlocksPreviewCard(
  props: Readonly<{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    IconTag: React.ComponentType<IconProps<any>> // eslint-disable-line @typescript-eslint/no-explicit-any
    iconName: string
    platform: 'Android' | 'iOS' | 'web' | 'macOS' | 'Windows' | 'Linux'
    blocksNumber: number
    onPress: () => void
  }>,
) {
  return (
    <Pressable onPress={props.onPress}>
      <TiedSBlurView>
        <props.IconTag
          name={props.iconName}
          color={T.color.text}
          size={25}
          style={styles.icon}
        />
        <View style={styles.container}>
          <Text style={styles.blocksNumber}>{props.blocksNumber} blocks</Text>
          <Text style={styles.platform}>{props.platform}</Text>
        </View>
      </TiedSBlurView>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  icon: {
    marginRight: T.spacing.small,
  },
  container: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  blocksNumber: {
    color: T.color.text,
  },
  platform: {
    color: T.color.text,
    fontSize: T.size.xSmall,
  },
})
