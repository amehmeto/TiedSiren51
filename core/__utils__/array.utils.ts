export const uniqueBy = <T, K>(
  array: T[],
  keyExtractor: (item: T) => K,
): T[] => {
  const keyedEntries = array.map((item) => [keyExtractor(item), item] as const)
  return [...new Map(keyedEntries).values()]
}
