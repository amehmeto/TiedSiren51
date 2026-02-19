export const uniqueBy = <T, K>(
  array: T[],
  keyExtractor: (item: T) => K,
): T[] => {
  // eslint-disable-next-line local-rules/no-lame-naming
  const keyedEntries = array.map((item) => [keyExtractor(item), item] as const)
  return [...new Map(keyedEntries).values()]
}
