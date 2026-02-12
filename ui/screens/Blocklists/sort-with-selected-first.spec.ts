import { describe, expect, it } from 'vitest'
import { sortWithSelectedFirst } from './sort-with-selected-first'

describe('sortWithSelectedFirst', () => {
  const getKey = (item: { id: string }) => item.id
  const getName = (item: { id: string; name: string }) => item.name

  it('should place selected items before unselected items', () => {
    const items = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' },
      { id: '3', name: 'Cherry' },
    ]
    const savedSelectedKeys = ['2']
    const expectedFirstItem = {
      type: 'item',
      item: { id: '2', name: 'Banana' },
    }

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    const itemsOnly = result.filter((r) => r.type === 'item')
    expect(itemsOnly[0]).toStrictEqual(expectedFirstItem)
  })

  it('should sort selected items alphabetically', () => {
    const items = [
      { id: '1', name: 'Zebra' },
      { id: '2', name: 'Apple' },
      { id: '3', name: 'Mango' },
    ]
    const savedSelectedKeys = ['1', '2', '3']
    const expectedNames = ['Apple', 'Mango', 'Zebra']

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    const itemsOnly = result
      .filter(
        (r): r is { type: 'item'; item: { id: string; name: string } } =>
          r.type === 'item',
      )
      .map((r) => r.item.name)

    expect(itemsOnly).toStrictEqual(expectedNames)
  })

  it('should sort unselected items alphabetically', () => {
    const items = [
      { id: '1', name: 'Zebra' },
      { id: '2', name: 'Apple' },
      { id: '3', name: 'Mango' },
    ]
    const savedSelectedKeys: string[] = []
    const expectedNames = ['Apple', 'Mango', 'Zebra']

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    const itemsOnly = result
      .filter(
        (r): r is { type: 'item'; item: { id: string; name: string } } =>
          r.type === 'item',
      )
      .map((r) => r.item.name)

    expect(itemsOnly).toStrictEqual(expectedNames)
  })

  it('should show Selected divider only when selected items exist', () => {
    const items = [{ id: '1', name: 'Apple' }]
    const savedSelectedKeys = ['1']
    const expectedDivider = {
      type: 'divider',
      id: 'divider-selected',
      label: 'Selected',
    }

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    const dividers = result.filter((r) => r.type === 'divider')
    expect(dividers).toHaveLength(1)
    expect(dividers[0]).toStrictEqual(expectedDivider)
  })

  it('should show Available divider only when unselected items exist', () => {
    const items = [{ id: '1', name: 'Apple' }]
    const savedSelectedKeys: string[] = []
    const expectedDivider = {
      type: 'divider',
      id: 'divider-available',
      label: 'Available',
    }

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    const dividers = result.filter((r) => r.type === 'divider')
    expect(dividers).toHaveLength(1)
    expect(dividers[0]).toStrictEqual(expectedDivider)
  })

  it('should show both dividers when both selected and unselected items exist', () => {
    const items = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' },
    ]
    const savedSelectedKeys = ['1']
    const expectedSelectedDivider = {
      type: 'divider',
      id: 'divider-selected',
      label: 'Selected',
    }
    const expectedAvailableDivider = {
      type: 'divider',
      id: 'divider-available',
      label: 'Available',
    }

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    const dividers = result.filter((r) => r.type === 'divider')
    expect(dividers).toHaveLength(2)
    expect(dividers[0]).toStrictEqual(expectedSelectedDivider)
    expect(dividers[1]).toStrictEqual(expectedAvailableDivider)
  })

  it('should return empty array for empty items', () => {
    const items: { id: string; name: string }[] = []
    const savedSelectedKeys: string[] = []
    const expectedResult: unknown[] = []

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    expect(result).toStrictEqual(expectedResult)
  })

  it('should handle empty savedSelectedKeys with items', () => {
    const items = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' },
    ]
    const savedSelectedKeys: string[] = []
    const expectedResult = [
      { type: 'divider', id: 'divider-available', label: 'Available' },
      { type: 'item', item: { id: '1', name: 'Apple' } },
      { type: 'item', item: { id: '2', name: 'Banana' } },
    ]

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    expect(result).toStrictEqual(expectedResult)
  })

  it('should work with string items using identity functions', () => {
    const items = ['zebra.com', 'apple.com', 'mango.com']
    const savedSelectedKeys = ['apple.com']
    const identity = (s: string) => s
    const expectedNames = ['apple.com', 'mango.com', 'zebra.com']

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      identity,
      identity,
    )

    const itemsOnly = result
      .filter((r): r is { type: 'item'; item: string } => r.type === 'item')
      .map((r) => r.item)

    expect(itemsOnly).toStrictEqual(expectedNames)
  })

  it('should ignore savedSelectedKeys that do not match any item', () => {
    const items = [
      { id: '1', name: 'Apple' },
      { id: '2', name: 'Banana' },
    ]
    const savedSelectedKeys = ['999', '1']
    const expectedFirstSelectedId = '1'

    const result = sortWithSelectedFirst(
      items,
      savedSelectedKeys,
      getKey,
      getName,
    )

    const selectedItems = result.filter(
      (r): r is { type: 'item'; item: { id: string; name: string } } =>
        r.type === 'item',
    )
    const firstSelectedId = selectedItems[0].item.id
    expect(selectedItems).toHaveLength(2)
    expect(firstSelectedId).toBe(expectedFirstSelectedId)
  })
})
