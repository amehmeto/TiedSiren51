import { Platform } from 'react-native'
import { Sirens } from '../siren/sirens'

export interface SirenLookout {
  watchSirens(sirens: Sirens): void
}

export interface AndroidSirenLookout extends SirenLookout {
  isEnabled(): Promise<boolean>
  askPermission(): Promise<void>
}

export function isAndroidSirenLookout(
  sirenLookout: SirenLookout,
): sirenLookout is AndroidSirenLookout {
  return (
    Platform.OS === 'android' &&
    'isEnabled' in sirenLookout &&
    'askPermission' in sirenLookout
  )
}
