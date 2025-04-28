import * as React from 'react'
import {
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  View,
} from 'react-native'
import { T } from '@/ui/design-system/theme'
import { AndroidSiren, SirenType } from '@/core/siren/sirens'
import { SelectableSirenCard } from '@/ui/screens/Blocklists/SelectableSirenCard'

export function AppsSelectionScene(props: {
  data: AndroidSiren[]
  toggleAppSiren: (sirenType: SirenType.ANDROID, app: AndroidSiren) => void
  isSirenSelected: (sirenType: SirenType, sirenId: string) => boolean
  isLoading?: boolean
}) {
  // Show loading indicator
  if (props.isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={T.color.lightBlue} />
        <Text style={styles.loadingText}>Loading apps...</Text>
      </View>
    )
  }

  // Show empty state if no apps
  if (props.data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No apps found</Text>
        <Text style={styles.subText}>
          System apps have been filtered out to show only user-installed apps.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      data={props.data}
      keyExtractor={(item) => item.packageName}
      renderItem={({ item }) => (
        <SelectableSirenCard
          sirenType={SirenType.ANDROID}
          siren={item}
          onPress={() => props.toggleAppSiren(SirenType.ANDROID, item)}
          isSelected={props.isSirenSelected(
            SirenType.ANDROID,
            item.packageName,
          )}
        />
      )}
      ListEmptyComponent={
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No apps found</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: T.spacing.large,
  },
  loadingText: {
    color: T.color.text,
    marginTop: T.spacing.medium,
    fontSize: T.font.size.medium,
  },
  emptyText: {
    color: T.color.text,
    fontSize: T.font.size.medium,
    fontWeight: T.font.weight.bold,
  },
  subText: {
    color: T.color.text,
    fontSize: T.font.size.small,
    textAlign: 'center',
    marginTop: T.spacing.small,
  },
})
