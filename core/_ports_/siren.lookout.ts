export interface SirenLookout {
  startWatching(): void
  stopWatching(): void
  onSirenDetected(listener: (packageName: string) => void): void
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
