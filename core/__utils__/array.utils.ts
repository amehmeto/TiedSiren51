export const uniqueBy = <T, K>(
  array: T[],
  keyExtractor: (item: T) => K,
): T[] => {
  return [...new Map(array.map((item) => [keyExtractor(item), item])).values()]
}
