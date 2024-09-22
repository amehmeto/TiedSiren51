import { Stack } from 'expo-router'
import React from 'react'

const HomeStackLayout = () => {
  return (
    <>
      <Stack
        screenOptions={{
          header: () => null,
          contentStyle: { backgroundColor: '#FFF' },
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </>
  )
}

export default HomeStackLayout
