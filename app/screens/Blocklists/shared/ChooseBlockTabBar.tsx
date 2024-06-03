import type {
  NavigationState,
  SceneRendererProps,
} from 'react-native-tab-view/lib/typescript/src/types'
import { Route, TabBar } from 'react-native-tab-view'
import { Pressable, StyleSheet, Text } from 'react-native'
import { T } from '@/app/design-system/theme'
import * as React from 'react'

export function ChooseBlockTabBar(
  props: SceneRendererProps & {
    navigationState: NavigationState<Route>
  },
) {
  return (
    <TabBar
      {...props}
      indicatorStyle={styles.indicator}
      renderLabel={({ route, focused, color }) => (
        <Pressable
          style={[
            styles.label,
            {
              backgroundColor: focused ? T.color.lightBlue : T.color.darkBlue,
            },
          ]}
        >
          <Text style={[styles.labelText, { color }]}>{route.title}</Text>
        </Pressable>
      )}
      style={styles.tabBar}
      tabStyle={styles.tabBarStyle}
    />
  )
}

const styles = StyleSheet.create({
  label: {
    backgroundColor: T.color.darkBlue,
    borderRadius: T.border.radius.extraRounded,
    padding: T.spacing.medium,
    minWidth: T.width.chipMinWidth,
    margin: T.spacing.none,
  },
  labelText: { color: 'white', textAlign: 'center' },
  tabBar: { backgroundColor: 'transparent' },
  tabBarStyle: { marginLeft: 0, paddingLeft: 0 },
  indicator: { height: 0, display: 'none', width: 0 },
})
