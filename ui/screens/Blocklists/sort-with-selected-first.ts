type SectionDivider = { type: 'divider'; id: string; label: string }

export type SortedListItem<T> = { type: 'item'; item: T } | SectionDivider

export function sortWithSelectedFirst<T>(
  items: T[],
  savedSelectedKeys: string[],
  getKey: (item: T) => string,
  getName: (item: T) => string,
): SortedListItem<T>[] {
  const savedSet = new Set(savedSelectedKeys)

  const selectedItems = items
    .filter((item) => savedSet.has(getKey(item)))
    .sort((a, b) => getName(a).localeCompare(getName(b)))

  const unselectedItems = items
    .filter((item) => !savedSet.has(getKey(item)))
    .sort((a, b) => getName(a).localeCompare(getName(b)))

  const result: SortedListItem<T>[] = []

  if (selectedItems.length > 0) {
    result.push({ type: 'divider', id: 'divider-selected', label: 'Selected' })
    selectedItems.forEach((item) => result.push({ type: 'item', item }))
  }

  if (unselectedItems.length > 0) {
    result.push({
      type: 'divider',
      id: 'divider-available',
      label: 'Available',
    })
    unselectedItems.forEach((item) => result.push({ type: 'item', item }))
  }

  return result
}
