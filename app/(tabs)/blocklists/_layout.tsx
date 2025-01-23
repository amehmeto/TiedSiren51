import { T } from '@/ui/design-system/theme'
import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'

export default function BlocklistsStackLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => null,
        contentStyle: styles.contentStyle,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}

const styles = StyleSheet.create({
  contentStyle: {
    backgroundColor: 'transparent',
    paddingHorizontal: T.spacing.large,
    paddingBottom: T.spacing.large,
  },
})
