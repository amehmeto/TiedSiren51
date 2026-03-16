import { describe, expect, it } from 'vitest'

import { borderRadius, colors } from './colors.js'
import { T } from './theme'

describe('colors.js sync with T', () => {
  it('should have the same color keys and values as T.color', () => {
    expect(colors).toStrictEqual(T.color)
  })

  it('should have the same border radius keys and values as T.border.radius', () => {
    expect(borderRadius).toStrictEqual(T.border.radius)
  })
})
