import * as React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { SceneRendererProps, TabBar } from 'react-native-tab-view'
import { T } from '@/ui/design-system/theme'

export function ChooseBlockTabBar(props: SceneRendererProps) {
  return (
    <TabBar
      navigationState={{
        index: 0,
        // @ts-ignore
        routes: [{ title: 'Websites' }, { title: 'Keywords' }],
      }}
      {...props}
      indicatorStyle={styles.indicator}
      renderLabel={({ route, focused: isFocused, color }) => (
        <Pressable
          style={[
            styles.label,
            {
              backgroundColor: isFocused ? T.color.lightBlue : T.color.darkBlue,
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
  labelText: { color: T.color.white, textAlign: 'center' },
  tabBar: { backgroundColor: T.color.transparent },
  tabBarStyle: { marginLeft: T.spacing.none, paddingLeft: T.spacing.none },
  indicator: { height: T.spacing.none, display: 'none', width: T.spacing.none },
})
