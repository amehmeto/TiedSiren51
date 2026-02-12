import { LockedSirens } from '../../strict-mode/is-siren-locked'

export function buildLockedSirens(
  wantedLockedSirens: Partial<LockedSirens> = {},
): LockedSirens {
  return {
    android: new Set<string>(),
    websites: new Set<string>(),
    keywords: new Set<string>(),
    ...wantedLockedSirens,
  }
}
