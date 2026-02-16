/**
 * Tests for dependency graph cross-repo parsing functions
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { parseDependencyRef, depRefKey, formatDepRef, updateYamlMetadata } from './generate-dependency-graph.mjs'

describe('parseDependencyRef', () => {
  // Capture and suppress console.warn during tests
  let consoleWarnSpy

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe('local refs', () => {
    it('parses bare number as local ref', () => {
      const result = parseDependencyRef('123', 'TiedSiren51')
      expect(result).toEqual({ repo: 'TiedSiren51', number: 123 })
    })

    it('parses #-prefixed number as local ref', () => {
      const result = parseDependencyRef('#456', 'TiedSiren51')
      expect(result).toEqual({ repo: 'TiedSiren51', number: 456 })
    })

    it('uses currentRepo context for local refs', () => {
      const result = parseDependencyRef('99', 'tied-siren-blocking-overlay')
      expect(result).toEqual({ repo: 'tied-siren-blocking-overlay', number: 99 })
    })

    it('trims whitespace from input', () => {
      const result = parseDependencyRef('  #123  ', 'TiedSiren51')
      expect(result).toEqual({ repo: 'TiedSiren51', number: 123 })
    })
  })

  describe('cross-repo refs with abbreviations', () => {
    it('parses TSBO#N as tied-siren-blocking-overlay', () => {
      const result = parseDependencyRef('TSBO#9', 'TiedSiren51')
      expect(result).toEqual({ repo: 'tied-siren-blocking-overlay', number: 9 })
    })

    it('parses EAS#N as expo-accessibility-service', () => {
      const result = parseDependencyRef('EAS#42', 'TiedSiren51')
      expect(result).toEqual({ repo: 'expo-accessibility-service', number: 42 })
    })

    it('parses EFS#N as expo-foreground-service', () => {
      const result = parseDependencyRef('EFS#7', 'TiedSiren51')
      expect(result).toEqual({ repo: 'expo-foreground-service', number: 7 })
    })

    it('parses ELIA#N as expo-list-installed-apps', () => {
      const result = parseDependencyRef('ELIA#1', 'TiedSiren51')
      expect(result).toEqual({ repo: 'expo-list-installed-apps', number: 1 })
    })

    it('parses TS#N as TiedSiren51', () => {
      const result = parseDependencyRef('TS#100', 'tied-siren-blocking-overlay')
      expect(result).toEqual({ repo: 'TiedSiren51', number: 100 })
    })
  })

  describe('cross-repo refs with full names', () => {
    it('parses full repo name format', () => {
      const result = parseDependencyRef('tied-siren-blocking-overlay#5', 'TiedSiren51')
      expect(result).toEqual({ repo: 'tied-siren-blocking-overlay', number: 5 })
    })

    it('parses TiedSiren51#N format', () => {
      const result = parseDependencyRef('TiedSiren51#200', 'tied-siren-blocking-overlay')
      expect(result).toEqual({ repo: 'TiedSiren51', number: 200 })
    })
  })

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parseDependencyRef('', 'TiedSiren51')).toBeNull()
    })

    it('returns null for whitespace-only string', () => {
      expect(parseDependencyRef('   ', 'TiedSiren51')).toBeNull()
    })

    it('returns null for unknown repo abbreviation', () => {
      const result = parseDependencyRef('UNKNOWN#123', 'TiedSiren51')
      expect(result).toBeNull()
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown repo'))
    })

    it('returns null for non-numeric issue number', () => {
      const nonNumericResult = parseDependencyRef('#abc', 'TiedSiren51')
      expect(nonNumericResult).toBeNull()
    })

    it('returns null for malformed input', () => {
      const malformedResult = parseDependencyRef('not-valid', 'TiedSiren51')
      expect(malformedResult).toBeNull()
    })
  })
})

describe('depRefKey', () => {
  it('creates composite key from repo and number', () => {
    const key = depRefKey({ repo: 'TiedSiren51', number: 123 })
    expect(key).toBe('TiedSiren51#123')
  })

  it('handles cross-repo references', () => {
    const key = depRefKey({ repo: 'tied-siren-blocking-overlay', number: 9 })
    expect(key).toBe('tied-siren-blocking-overlay#9')
  })
})

describe('formatDepRef', () => {
  it('formats local ref as #N when repo matches context', () => {
    const label = formatDepRef({ repo: 'TiedSiren51', number: 123 }, 'TiedSiren51')
    expect(label).toBe('#123')
  })

  it('formats cross-repo ref with abbreviation when different from context', () => {
    const label = formatDepRef({ repo: 'tied-siren-blocking-overlay', number: 9 }, 'TiedSiren51')
    expect(label).toBe('TSBO#9')
  })

  it('uses TS abbreviation for TiedSiren51 in cross-repo context', () => {
    const label = formatDepRef({ repo: 'TiedSiren51', number: 100 }, 'tied-siren-blocking-overlay')
    expect(label).toBe('TS#100')
  })

  it('formats EAS repo with correct abbreviation', () => {
    const label = formatDepRef({ repo: 'expo-accessibility-service', number: 5 }, 'TiedSiren51')
    expect(label).toBe('EAS#5')
  })

  it('formats EFS repo with correct abbreviation', () => {
    const label = formatDepRef({ repo: 'expo-foreground-service', number: 3 }, 'TiedSiren51')
    expect(label).toBe('EFS#3')
  })

  it('formats ELIA repo with correct abbreviation', () => {
    const label = formatDepRef({ repo: 'expo-list-installed-apps', number: 1 }, 'TiedSiren51')
    expect(label).toBe('ELIA#1')
  })

  it('falls back to full repo name if no abbreviation defined', () => {
    // This tests the fallback path - in practice all repos have abbreviations
    const label = formatDepRef({ repo: 'unknown-repo', number: 1 }, 'TiedSiren51')
    expect(label).toBe('unknown-repo#1')
  })
})

describe('updateYamlMetadata', () => {
  describe('when no YAML block exists', () => {
    it('creates YAML block with blocks when addBlocks is provided', () => {
      const body = 'Some issue description'
      const result = updateYamlMetadata(body, [42], [])

      expect(result).toBe('```yaml\nblocks: [42]\n```\n\nSome issue description')
    })

    it('creates YAML block with depends_on when addDependsOn is provided', () => {
      const body = 'Some issue description'
      const result = updateYamlMetadata(body, [], [99])

      expect(result).toBe('```yaml\ndepends_on: [99]\n```\n\nSome issue description')
    })

    it('creates YAML block with both blocks and depends_on', () => {
      const body = 'Some issue description'
      const result = updateYamlMetadata(body, [42], [99])

      expect(result).toBe('```yaml\nblocks: [42]\ndepends_on: [99]\n```\n\nSome issue description')
    })

    it('returns body unchanged when both arrays are empty', () => {
      const body = 'Some issue description'
      const result = updateYamlMetadata(body, [], [])

      expect(result).toBe(body)
    })
  })

  describe('when YAML block exists with no blocks/depends_on', () => {
    it('adds blocks to existing YAML', () => {
      const body = '```yaml\ntype: feature\n```\n\nDescription'
      const result = updateYamlMetadata(body, [42], [])

      expect(result).toContain('blocks: [42]')
      expect(result).toContain('type: feature')
    })

    it('adds depends_on to existing YAML', () => {
      const body = '```yaml\ntype: feature\n```\n\nDescription'
      const result = updateYamlMetadata(body, [], [99])

      expect(result).toContain('depends_on: [99]')
      expect(result).toContain('type: feature')
    })
  })

  describe('when YAML block exists with existing blocks/depends_on', () => {
    it('merges new blocks with existing blocks', () => {
      const body = '```yaml\nblocks: [10, 20]\n```\n\nDescription'
      const result = updateYamlMetadata(body, [30, 10], [])

      expect(result).toContain('blocks: [10, 20, 30]')
    })

    it('merges new depends_on with existing depends_on', () => {
      const body = '```yaml\ndepends_on: [5, 15]\n```\n\nDescription'
      const result = updateYamlMetadata(body, [], [25, 5])

      expect(result).toContain('depends_on: [5, 15, 25]')
    })

    it('sorts merged values numerically', () => {
      const body = '```yaml\nblocks: [100, 5]\n```\n\nDescription'
      const result = updateYamlMetadata(body, [50, 1], [])

      expect(result).toContain('blocks: [1, 5, 50, 100]')
    })

    it('deduplicates values', () => {
      const body = '```yaml\nblocks: [10, 20]\n```\n\nDescription'
      const result = updateYamlMetadata(body, [10, 20, 30], [])

      expect(result).toContain('blocks: [10, 20, 30]')
    })
  })

  describe('edge cases', () => {
    it('returns null/undefined body unchanged', () => {
      expect(updateYamlMetadata(null, [42], [])).toBeNull()
      expect(updateYamlMetadata(undefined, [42], [])).toBeUndefined()
    })

    it('returns empty body unchanged', () => {
      expect(updateYamlMetadata('', [42], [])).toBe('')
    })

    it('handles YAML block with whitespace', () => {
      const body = '```yaml  \ntype: feature\n```\n\nDescription'
      const result = updateYamlMetadata(body, [42], [])

      expect(result).toContain('blocks: [42]')
    })

    it('handles empty existing blocks array', () => {
      const body = '```yaml\nblocks: []\n```\n\nDescription'
      const result = updateYamlMetadata(body, [42], [])

      expect(result).toContain('blocks: [42]')
    })
  })
})
