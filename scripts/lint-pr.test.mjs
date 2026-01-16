/**
 * 🧪 Tests for PR Linter
 */

import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const linterPath = path.join(__dirname, 'lint-pr.mjs')

// Helper to run the linter with given title and body
function lintPR(title, body) {
  const input = JSON.stringify({ title, body })
  try {
    const output = execSync(`node "${linterPath}" --stdin --json`, {
      input,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return { success: true, result: JSON.parse(output) }
  } catch (error) {
    try {
      return { success: false, result: JSON.parse(error.stdout) }
    } catch {
      return { success: false, error: error.message }
    }
  }
}

describe('PR Linter', () => {
  describe('🎫 Title Validation', () => {
    it('should fail when title has no ticket reference', () => {
      const { success, result } = lintPR(
        'feat: add login feature',
        '## Summary\nAdds login',
      )

      expect(success).toBe(false)
      expect(result.valid).toBe(false)
      expect(result.title.errors).toContain(
        'Title must reference at least one ticket (e.g., "feat: add login #123")',
      )
    })

    it('should pass when title has ticket reference', () => {
      const { success, result } = lintPR(
        'feat: add login #123',
        `## Summary
Adds login

## 🔗 Hierarchy

| Level | Link |
|-------|------|
| 🚀 Initiative | [#62 - Launch Android App](https://github.com/amehmeto/TiedSiren51/issues/62) |
| 🏔️ Epic | [#54 - User Auth](https://github.com/amehmeto/TiedSiren51/issues/54) |
| 📋 Issue | Closes #123 |`,
      )

      expect(success).toBe(true)
      expect(result.valid).toBe(true)
      expect(result.title.errors).toHaveLength(0)
      expect(result.linkedTickets).toContainEqual(
        expect.objectContaining({ repo: 'TiedSiren51', number: 123 }),
      )
    })

    it('should extract multiple ticket references from title', () => {
      const { result } = lintPR('feat: add auth #123 #456', '## Summary\nTest')

      expect(result.linkedTickets).toHaveLength(2)
      expect(result.linkedTickets).toContainEqual(
        expect.objectContaining({ number: 123 }),
      )
      expect(result.linkedTickets).toContainEqual(
        expect.objectContaining({ number: 456 }),
      )
    })

    it('should warn when title does not use conventional commit format', () => {
      const { result } = lintPR('Add login #123', '## Summary\nTest')

      expect(
        result.title.warnings.some((w) => w.includes('conventional commit')),
      ).toBe(true)
    })

    it('should not warn for conventional commit format', () => {
      const { result } = lintPR('feat: add login #123', '## Summary\nTest')

      expect(
        result.title.warnings.some((w) => w.includes('conventional commit')),
      ).toBe(false)
    })

    it('should warn when title is too long', () => {
      const longTitle = 'feat: ' + 'a'.repeat(80) + ' #123'
      const { result } = lintPR(longTitle, '## Summary\nTest')

      expect(result.title.warnings.some((w) => w.includes('chars'))).toBe(true)
    })

    it('should fail when title is empty', () => {
      const { success, result } = lintPR('', '## Summary\nTest')

      expect(success).toBe(false)
      expect(result.valid).toBe(false)
      expect(result.title.errors).toContain('Title is empty')
    })

    it('should detect WIP in title', () => {
      const { result } = lintPR('WIP: feat: add login #123', '## Summary\nTest')

      expect(
        result.title.info.some((i) => i.includes('Work In Progress')),
      ).toBe(true)
    })

    it('should detect [WIP] in title', () => {
      const { result } = lintPR(
        '[WIP] feat: add login #123',
        '## Summary\nTest',
      )

      expect(
        result.title.info.some((i) => i.includes('Work In Progress')),
      ).toBe(true)
    })
  })

  describe('📄 Body Validation', () => {
    it('should fail when body is empty', () => {
      const { success, result } = lintPR('feat: test #123', '')

      expect(success).toBe(false)
      expect(result.body.errors).toContain('PR description is empty')
    })

    it('should fail when Summary section is missing', () => {
      const { success, result } = lintPR(
        'feat: test #123',
        'Just some text without sections',
      )

      expect(success).toBe(false)
      expect(result.body.errors.some((e) => e.includes('Summary'))).toBe(true)
    })

    it('should pass when Summary section is present', () => {
      const { result } = lintPR(
        'feat: test #123',
        '## Summary\n\nThis is the summary',
      )

      expect(
        result.body.errors.filter((e) => e.includes('Summary')),
      ).toHaveLength(0)
    })

    it('should warn when Test Plan section is missing', () => {
      const { result } = lintPR('feat: test #123', '## Summary\n\nTest')

      expect(result.body.warnings.some((w) => w.includes('Test Plan'))).toBe(
        true,
      )
    })

    it('should not warn when Test Plan section is present', () => {
      const body = '## Summary\n\nTest\n\n## Test Plan\n\n- Test manually'
      const { result } = lintPR('feat: test #123', body)

      expect(result.body.warnings.some((w) => w.includes('Test Plan'))).toBe(
        false,
      )
    })

    it('should warn when missing Closes/Fixes keyword', () => {
      const { result } = lintPR('feat: test #123', '## Summary\n\nTest')

      expect(result.body.warnings.some((w) => w.includes('Closes'))).toBe(true)
    })

    it('should not warn when Closes #X is present', () => {
      const { result } = lintPR(
        'feat: test #123',
        '## Summary\n\nTest\n\nCloses #123',
      )

      expect(result.body.warnings.some((w) => w.includes('Closes'))).toBe(false)
    })

    it('should extract ticket references from body', () => {
      const body = '## Summary\n\nRelated to #456 and #789'
      const { result } = lintPR('feat: test #123', body)

      expect(result.body.issues).toContainEqual(
        expect.objectContaining({ number: 456 }),
      )
      expect(result.body.issues).toContainEqual(
        expect.objectContaining({ number: 789 }),
      )
    })
  })

  describe('🔗 Cross-repo References', () => {
    it('should extract cross-repo issue reference with repo#number format', () => {
      const { result } = lintPR(
        'feat: add blocking overlay tied-siren-blocking-overlay#5',
        '## Summary\nTest',
      )

      expect(result.linkedTickets).toContainEqual(
        expect.objectContaining({
          repo: 'tied-siren-blocking-overlay',
          number: 5,
        }),
      )
    })

    it('should extract full GitHub URL references', () => {
      const body =
        '## Summary\n\nSee https://github.com/amehmeto/expo-accessibility-service/issues/10'
      const { result } = lintPR('feat: test #123', body)

      expect(result.linkedTickets).toContainEqual(
        expect.objectContaining({
          repo: 'expo-accessibility-service',
          number: 10,
        }),
      )
    })

    it('should extract PR URL references (pull/ URLs also close issues)', () => {
      const body =
        '## Summary\n\nRelated to https://github.com/amehmeto/tied-siren-blocking-overlay/pull/42'
      const { result } = lintPR('feat: test #123', body)

      expect(result.linkedTickets).toContainEqual(
        expect.objectContaining({
          repo: 'tied-siren-blocking-overlay',
          number: 42,
        }),
      )
    })

    it('should warn for unknown repo names', () => {
      const { result } = lintPR(
        'feat: test unknown-repo#42',
        '## Summary\nTest',
      )

      expect(
        result.crossRepoWarnings.some((w) => w.includes('Unknown repository')),
      ).toBe(true)
    })

    it('should not warn for known repo names', () => {
      const { result } = lintPR(
        'feat: test tied-siren-blocking-overlay#5',
        '## Summary\nTest',
      )

      expect(result.crossRepoWarnings).toHaveLength(0)
    })
  })

  describe('📊 Combined Validation', () => {
    it('should deduplicate ticket references', () => {
      const body = '## Summary\n\nRelated to #123\n\nCloses #123'
      const { result } = lintPR('feat: test #123', body)

      const ticket123Count = result.linkedTickets.filter(
        (t) => t.number === 123,
      ).length
      expect(ticket123Count).toBe(1)
    })

    it('should pass a well-formatted PR', () => {
      const title = 'feat(auth): add Google Sign-In #87'
      const body = `## Summary

Implements Google Sign-In using Firebase Authentication.

## 🔗 Hierarchy

| Level | Link |
|-------|------|
| 🚀 Initiative | [#62 - Launch Android App](https://github.com/amehmeto/TiedSiren51/issues/62) |
| 🏔️ Epic | [#54 - User Auth](https://github.com/amehmeto/TiedSiren51/issues/54) |
| 📋 Issue | Closes #87 |

## Test Plan

- [ ] Test on Android device
- [ ] Test on iOS simulator
- [ ] Verify token refresh works`

      const { success, result } = lintPR(title, body)

      expect(success).toBe(true)
      expect(result.valid).toBe(true)
      expect(result.title.errors).toHaveLength(0)
      expect(result.body.errors).toHaveLength(0)
      // 3 tickets: #62 (initiative), #54 (epic), #87 (issue)
      expect(result.linkedTickets).toHaveLength(3)
    })

    it('should report all errors for a poorly formatted PR', () => {
      const { success, result } = lintPR('add stuff', '')

      expect(success).toBe(false)
      expect(result.valid).toBe(false)
      expect(result.title.errors.length).toBeGreaterThan(0)
      expect(result.body.errors.length).toBeGreaterThan(0)
    })
  })
})
