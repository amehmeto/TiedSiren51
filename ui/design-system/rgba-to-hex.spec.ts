import { describe, expect, it } from 'vitest'

import { rgbaToHex } from './rgba-to-hex.js'

type RgbaToHexCase = { input: string; expected: string; label: string }

describe('rgbaToHex', () => {
  it.each<RgbaToHexCase>([
    {
      input: 'rgba(8, 12, 50, 1)',
      expected: '#080C32',
      label: 'rgba with full opacity',
    },
    {
      input: 'rgb(255, 255, 255)',
      expected: '#FFFFFF',
      label: 'rgb without alpha',
    },
    { input: 'rgba(0, 0, 0, 1)', expected: '#000000', label: 'zero values' },
    {
      input: 'rgba(15, 23, 42, 0.3)',
      expected: '#0F172A',
      label: 'alpha channel ignored',
    },
    { input: '#FF0000', expected: '#FF0000', label: 'hex passthrough' },
    {
      input: 'transparent',
      expected: 'transparent',
      label: 'non-rgba passthrough',
    },
  ])('should return $expected for $label ($input)', ({ input, expected }) => {
    const convertedHex = rgbaToHex(input)

    expect(convertedHex).toBe(expected)
  })
})
