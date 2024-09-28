import { requireNativeViewManager } from 'expo-modules-core'
import * as React from 'react'

import { ListInstalledAppsViewProps } from './ListInstalledApps.types'

const NativeView: React.ComponentType<ListInstalledAppsViewProps> =
  requireNativeViewManager('ListInstalledApps')

export default function ListInstalledAppsView(
  props: ListInstalledAppsViewProps,
) {
  return <NativeView {...props} />
}
