import { Sirens } from '@/core/siren/sirens'

export type LockedSirens = {
  android: Set<string>
  websites: Set<string>
  keywords: Set<string>
}

export const EMPTY_LOCKED_SIRENS: LockedSirens = {
  android: new Set(),
  websites: new Set(),
  keywords: new Set(),
}

export function isSirenLocked(
  lockedSirens: LockedSirens,
  sirenType: keyof Sirens,
  sirenId: string,
): boolean {
  const sirenLookup: Partial<
    Record<keyof Sirens, (locked: LockedSirens) => Set<string>>
  > = {
    android: (locked) => locked.android,
    websites: (locked) => locked.websites,
    keywords: (locked) => locked.keywords,
  }
  const lookup = sirenLookup[sirenType]
  return lookup ? lookup(lockedSirens).has(sirenId) : false
}
