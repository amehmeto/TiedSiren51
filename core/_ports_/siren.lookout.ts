export interface DetectedSiren {
  type: 'app' | 'website' | 'keyword'
  identifier: string
  timestamp: number
}

export interface SirenLookout {
  initialize(): Promise<void>
  onSirenDetected(listener: (siren: DetectedSiren) => void): void
  startWatching(): void
  stopWatching(): void
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
