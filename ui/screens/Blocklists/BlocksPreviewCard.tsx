import { IconProps } from '@expo/vector-icons/build/createIconSet'
import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'

type BlocksPreviewCardProps = Readonly<{
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  IconTag: React.ComponentType<IconProps<any>> // eslint-disable-line @typescript-eslint/no-explicit-any
  iconName: string
  platform: 'Android' | 'iOS' | 'web' | 'macOS' | 'Windows' | 'Linux'
  blocksNumber: number
  onPress: () => void
}>

export function BlocksPreviewCard({
  IconTag,
  iconName,
  platform,
  blocksNumber,
  onPress,
}: BlocksPreviewCardProps) {
  return (
    <Pressable onPress={onPress}>
      <TiedSCard>
        <IconTag
          name={iconName}
          color={T.color.text}
          size={T.component.menuIcon}
          style={styles.icon}
        />
        <View style={styles.container}>
          <Text style={styles.blocksNumber}>{blocksNumber} blocks</Text>
          <Text style={styles.platform}>{platform}</Text>
        </View>
      </TiedSCard>
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
    fontSize: T.font.size.xSmall,
  },
})
