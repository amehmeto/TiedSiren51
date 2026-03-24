export enum DetectedSirenType {
  App = 'app',
  Website = 'website',
  Keyword = 'keyword',
}

export interface DetectedSiren {
  type: DetectedSirenType
  identifier: string
  timestamp: number
}

export interface SirenLookout {
  initialize(): Promise<void>
  onSirenDetected(listener: (siren: DetectedSiren) => void): void
  startWatching(): void
  stopWatching(): void
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
