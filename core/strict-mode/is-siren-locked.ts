import { Sirens } from '@/core/siren/sirens'

export type LockedSirens = {
  android: Set<string>
  websites: Set<string>
  keywords: Set<string>
}

function isLockedSirenKey(key: keyof Sirens): key is keyof LockedSirens {
  return key === 'android' || key === 'websites' || key === 'keywords'
}

export function isSirenLocked(
  lockedSirens: LockedSirens | undefined,
  sirenType: keyof Sirens,
  sirenId: string,
): boolean {
  return (
    !!lockedSirens &&
    isLockedSirenKey(sirenType) &&
    lockedSirens[sirenType].has(sirenId)
  )
}
