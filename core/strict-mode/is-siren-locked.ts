import { Sirens } from '@/core/siren/sirens'

export type LockedSirens = {
  android: Set<string>
  websites: Set<string>
  keywords: Set<string>
}

export function isSirenLocked(
  lockedSirens: LockedSirens | undefined,
  sirenType: keyof Sirens,
  sirenId: string,
): boolean {
  if (!lockedSirens) return false
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
