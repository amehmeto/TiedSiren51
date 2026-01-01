export interface DetectedSiren {
  type: 'app' | 'website' | 'keyword'
  identifier: string
  timestamp: number
}

export interface SirenLookout {
  initialize(): Promise<void>
  onSirenDetected(callback: (siren: DetectedSiren) => void): void
  /** @deprecated Use initialize for setup. Will be removed in native-to-native blocking migration. */
  startWatching(): void
  /** @deprecated Will be removed in native-to-native blocking migration. */
  stopWatching(): void
  /** @deprecated Will be removed in native-to-native blocking migration. */
  updateBlockedApps(packageNames: string[]): Promise<void>
}

export interface AndroidSirenLookout extends SirenLookout {
  isEnabled(): Promise<boolean>
  askPermission(): Promise<void>
}

export function isAndroidSirenLookout(
  sirenLookout: SirenLookout,
): sirenLookout is AndroidSirenLookout {
  return 'isEnabled' in sirenLookout && 'askPermission' in sirenLookout
}
