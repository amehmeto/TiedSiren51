import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import { T } from '@/ui/design-system/theme'

const subScreenOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTintColor: T.color.lightBlue,
  headerTitleStyle: {
    fontFamily: T.font.family.semibold,
    fontSize: T.font.size.regular,
    color: T.color.text,
  },
  headerBackTitleVisible: false,
} as const

export default function BlocklistsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.contentStyle,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create-blocklist-screen"
        options={{ ...subScreenOptions, title: 'New Blocklist' }}
      />
      <Stack.Screen
        name="edit-blocklist-screen/[blocklistId]"
        options={{ ...subScreenOptions, title: 'Edit Blocklist' }}
      />
    </Stack>
  )
}

const styles = StyleSheet.create({
  contentStyle: {
    backgroundColor: T.color.transparent,
    paddingHorizontal: T.spacing.large,
    paddingBottom: T.spacing.large,
  },
})
