import { Sirens } from '../siren/sirens'

export interface SirenLookout {
  watchSirens(sirens: Sirens): void
  onSirenDetected(callback: (packageName: string) => void): void
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
