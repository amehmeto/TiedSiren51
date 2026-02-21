import * as React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Route, TabBar, TabBarProps } from 'react-native-tab-view'
import { FeatureFlags } from '@/feature-flags'
import { T } from '@/ui/design-system/theme'

const featureFlagByRouteKey: Record<string, boolean> = {
  websites: FeatureFlags.WEBSITE_BLOCKING,
  keywords: FeatureFlags.KEYWORD_BLOCKING,
}

export function ChooseBlockTabBar({
  navigationState: _navigationState,
  ...rest
}: TabBarProps<Route>) {
  const filteredRoutes = _navigationState.routes.filter(
    (route) => featureFlagByRouteKey[route.key] === true,
  )

  if (filteredRoutes.length === 0) return null

  return (
    <TabBar
      {...rest}
      navigationState={{
        index: 0,
        routes: filteredRoutes,
      }}
      indicatorStyle={styles.indicator}
      renderLabel={({ route, focused: isFocused, color }) => (
        <Pressable
          style={[
            styles.label,
            {
              backgroundColor: isFocused ? T.color.lightBlue : T.color.darkBlue,
            },
          ]}
          accessibilityRole="tab"
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
    borderWidth: T.border.width.thin,
    borderColor: T.color.borderSubtle,
  },
  labelText: {
    color: T.color.text,
    textAlign: 'center',
    fontFamily: T.font.family.medium,
  },
  tabBar: { backgroundColor: T.color.transparent },
  tabBarStyle: { marginLeft: T.spacing.none, paddingLeft: T.spacing.none },
  indicator: { height: T.spacing.none, display: 'none', width: T.spacing.none },
})
