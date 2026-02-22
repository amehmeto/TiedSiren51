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

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: styles.contentStyle,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create-block-session"
        options={{ ...subScreenOptions, title: 'New Session' }}
      />
      <Stack.Screen
        name="accessibility-disclosure"
        options={{ ...subScreenOptions, title: 'App Blocking Disclosure' }}
      />
      <Stack.Screen
        name="edit-block-session/[sessionId]"
        options={{ ...subScreenOptions, title: 'Edit Session' }}
      />
    </Stack>
  )
}

const styles = StyleSheet.create({
  contentStyle: {
    backgroundColor: T.color.transparent,
    paddingHorizontal: T.spacing.large,
  },
})
