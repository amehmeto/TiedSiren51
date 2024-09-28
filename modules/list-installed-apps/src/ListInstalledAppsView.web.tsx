import * as React from 'react'

import { ListInstalledAppsViewProps } from './ListInstalledApps.types'

export default function ListInstalledAppsView(
  props: ListInstalledAppsViewProps,
) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  )
}
