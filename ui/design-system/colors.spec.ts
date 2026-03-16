import { describe, expect, it } from 'vitest'

import { colors } from './colors.js'
import { T } from './theme'

describe('colors.js sync with T.color', () => {
  it('should have the same keys and values as T.color', () => {
    expect(colors).toStrictEqual(T.color)
  })
})
