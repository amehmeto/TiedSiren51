import { T } from '@/ui/design-system/theme'
import * as React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { SceneRendererProps, TabBar } from 'react-native-tab-view'

export function ChooseBlockTabBar(
  props: SceneRendererProps /* & {
    navigationState: NavigationState<Route>
  }*/,
) {
  return (
    <TabBar
      navigationState={{
        index: 0,
        // @ts-ignore
        routes: [{ title: 'Websites' }, { title: 'Keywords' }],
      }}
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
