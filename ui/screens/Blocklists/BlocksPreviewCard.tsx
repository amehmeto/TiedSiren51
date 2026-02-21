import React from 'react'
import {
  Pressable,
  StyleSheet,
  StyleProp,
  Text,
  TextStyle,
  View,
} from 'react-native'
import { TiedSCard } from '@/ui/design-system/components/shared/TiedSCard'
import { T } from '@/ui/design-system/theme'

type IconComponentProps = {
  name: string
  color?: string
  size?: number
  style?: StyleProp<TextStyle>
}

export enum Platform {
  Android = 'Android',
  IOS = 'iOS',
  Web = 'web',
  MacOS = 'macOS',
  Windows = 'Windows',
  Linux = 'Linux',
}

type BlocksPreviewCardProps = {
  readonly IconTag: React.ComponentType<IconComponentProps>
  readonly iconName: string
  readonly platform: Platform
  readonly blocksNumber: number
  readonly onPress: () => void
}

export function BlocksPreviewCard({
  IconTag,
  iconName,
  platform,
  blocksNumber,
  onPress,
}: BlocksPreviewCardProps) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
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
    fontFamily: T.font.family.medium,
    fontSize: T.font.size.base,
  },
  platform: {
    color: T.color.textMuted,
    fontFamily: T.font.family.primary,
    fontSize: T.font.size.xSmall,
  },
})
