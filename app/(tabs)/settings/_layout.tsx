import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => null,
        contentStyle: styles.contentStyle,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="delete-account" />
    </Stack>
  )
}

const styles = StyleSheet.create({
  contentStyle: {
    backgroundColor: T.color.transparent,
  },
})
