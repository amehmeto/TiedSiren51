import { uniqueBy } from '@/core/__utils__/array.utils'
import { Sirens } from './sirens'

export const mergeSirens = (sirensArray: Sirens[]): Sirens => {
  const merge = <T, K>(extract: (s: Sirens) => T[], key: (item: T) => K) =>
    uniqueBy(sirensArray.flatMap(extract), key)

  return {
    android: merge(
      (s) => s.android,
      (app) => app.packageName,
    ),
    windows: merge(
      (s) => s.windows,
      (s) => s,
    ),
    macos: merge(
      (s) => s.macos,
      (s) => s,
    ),
    ios: merge(
      (s) => s.ios,
      (s) => s,
    ),
    linux: merge(
      (s) => s.linux,
      (s) => s,
    ),
    websites: merge(
      (s) => s.websites,
      (s) => s,
    ),
    keywords: merge(
      (s) => s.keywords,
      (s) => s,
    ),
  }
}
