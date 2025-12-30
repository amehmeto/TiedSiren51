/**
 * 🧪 Tests for remark-lint-ticket plugin
 */

import { describe, it, expect } from 'vitest'
import { remark } from 'remark'
import remarkLintTicket, { parseYaml, detectTicketType, isTicketFile } from './index.mjs'
import { VALID_REPOS, VALID_LABELS, FIBONACCI_POINTS } from './config.mjs'
import { fromMarkdown } from 'mdast-util-from-markdown'

// Helper to run the linter and get messages
async function lint(markdown) {
  const file = await remark().use(remarkLintTicket).process(markdown)
  return file.messages.map((m) => m.message)
}

// Helper to run the linter with a specific file path
async function lintWithPath(markdown, filePath) {
  const file = await remark()
    .use(remarkLintTicket)
    .process({ value: markdown, path: filePath })
  return file.messages.map((m) => m.message)
}

describe('remark-lint-ticket', () => {
  describe('Configuration', () => {
    it('should have valid repos list', () => {
      expect(Object.keys(VALID_REPOS)).toContain('TiedSiren51')
      expect(Object.keys(VALID_REPOS)).toContain('expo-accessibility-service')
    })

    it('should have ios and android labels', () => {
      expect(VALID_LABELS).toContain('android')
      expect(VALID_LABELS).toContain('ios')
    })

    it('should have Fibonacci points including 21', () => {
      expect(FIBONACCI_POINTS).toEqual([0, 1, 2, 3, 5, 8, 13, 21])
    })
  })

  describe('parseYaml', () => {
    it('should parse valid YAML', () => {
      const { data, error } = parseYaml('repo: TiedSiren51\nstory_points: 3')
      expect(error).toBeNull()
      expect(data.repo).toBe('TiedSiren51')
      expect(data.story_points).toBe(3)
    })

    it('should return error for invalid YAML', () => {
      const { data, error } = parseYaml('invalid: yaml: content:')
      expect(error).not.toBeNull()
      expect(data).toBeNull()
    })
  })

  describe('detectTicketType', () => {
    it('should detect epic from labels', () => {
      const type = detectTicketType([], { labels: ['epic'] })
      expect(type).toBe('epic')
    })

    it('should detect bug from labels', () => {
      const type = detectTicketType([], { labels: ['bug'] })
      expect(type).toBe('bug')
    })

    it('should default to feature', () => {
      const type = detectTicketType([], { labels: ['enhancement'] })
      expect(type).toBe('feature')
    })

    it('should detect bug from heading', () => {
      const headings = [{ text: '🐛 Bug Summary', depth: 2 }]
      const type = detectTicketType(headings, null)
      expect(type).toBe('bug')
    })
  })

  describe('validateMetadata', () => {
    it('should fail when metadata block is missing', async () => {
      const messages = await lintWithPath('# Just a heading\n\nSome content', '.github/ISSUE_TEMPLATE/test.md')
      expect(messages).toContain('❌ Missing YAML metadata block with `# 📦 METADATA` comment')
    })

    it('should fail when repo is missing', async () => {
      const markdown = `
\`\`\`yaml
# 📦 METADATA
story_points: 3
labels:
  - enhancement
\`\`\`
`
      const messages = await lint(markdown)
      expect(messages).toContain('❌ Missing `repo` field in metadata')
    })

    it('should fail for invalid repo', async () => {
      const markdown = `
\`\`\`yaml
# 📦 METADATA
repo: InvalidRepo
story_points: 3
labels:
  - enhancement
\`\`\`
`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Invalid repo'))).toBe(true)
    })

    it('should fail for non-Fibonacci story points', async () => {
      const markdown = `
\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 4
labels:
  - enhancement
\`\`\`
`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Fibonacci'))).toBe(true)
    })

    it('should warn for unknown labels', async () => {
      const markdown = `
\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 3
labels:
  - unknown-label
\`\`\`
`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Unknown labels'))).toBe(true)
    })

    it('should pass with valid metadata', async () => {
      const markdown = `
\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 5
labels:
  - enhancement
depends_on: []
blocks: []
\`\`\`

## 📝 Summary
Test

## 🎯 Context
Test

## ✅ Acceptance Criteria
- [ ] Test

## 🎭 Scenarios
\`\`\`gherkin
Given something
When something
Then something
\`\`\`
`
      const messages = await lint(markdown)
      const errors = messages.filter((m) => m.startsWith('❌'))
      expect(errors).toHaveLength(0)
    })
  })

  describe('validateRequiredSections', () => {
    const validMetadata = `
\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 3
labels:
  - enhancement
\`\`\`
`

    it('should fail when Summary section is missing', async () => {
      const markdown = `${validMetadata}\n## 🎯 Context\nTest`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('📝 Summary'))).toBe(true)
    })

    it('should fail when Context section is missing', async () => {
      const markdown = `${validMetadata}\n## 📝 Summary\nTest`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('🎯 Context'))).toBe(true)
    })

    it('should fail when Acceptance Criteria is missing', async () => {
      const markdown = `${validMetadata}\n## 📝 Summary\nTest\n## 🎯 Context\nTest`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Acceptance Criteria'))).toBe(true)
    })
  })

  describe('validateGherkin', () => {
    const validMetadataAndSections = `
\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 3
labels:
  - enhancement
\`\`\`

## 📝 Summary
Test

## 🎯 Context
Test

## ✅ Acceptance Criteria
- [ ] Test

## 🎭 Scenarios
`

    it('should warn when gherkin is missing', async () => {
      const markdown = `${validMetadataAndSections}\nNo gherkin here`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Given/When/Then'))).toBe(true)
    })

    it('should pass when gherkin code block is present', async () => {
      const markdown = `${validMetadataAndSections}
\`\`\`gherkin
Given something
When something
Then something
\`\`\`
`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Given/When/Then'))).toBe(false)
    })

    it('should not require gherkin for epics', async () => {
      const markdown = `
\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 13
labels:
  - epic
\`\`\`

## 🎯 Goal
Test goal

## 📋 Stories / Tasks
| # | Story |
|---|-------|

## ✅ Success Criteria
- [ ] Done
`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Given/When/Then'))).toBe(false)
    })
  })

  describe('validateStoryPointsNotInTitle', () => {
    it('should warn when story points are in heading', async () => {
      const markdown = `
\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 3
labels:
  - enhancement
\`\`\`

## Feature - 3 sp
`
      const messages = await lint(markdown)
      expect(messages.some((m) => m.includes('Story points should be in metadata'))).toBe(true)
    })
  })

  describe('isTicketFile', () => {
    it('should identify files in .github/ISSUE_TEMPLATE/', () => {
      const tree = fromMarkdown('# Just a heading')
      const file = { path: '.github/ISSUE_TEMPLATE/feature.md' }
      expect(isTicketFile(file, tree)).toBe(true)
    })

    it('should identify temp ticket files', () => {
      const tree = fromMarkdown('# Just a heading')
      const file = { path: '/tmp/ticket-abc123.md' }
      expect(isTicketFile(file, tree)).toBe(true)
    })

    it('should identify files with METADATA block', () => {
      const tree = fromMarkdown('```yaml\n# 📦 METADATA\nrepo: TiedSiren51\n```')
      const file = { path: 'random/path.md' }
      expect(isTicketFile(file, tree)).toBe(true)
    })

    it('should skip regular markdown files without ticket structure', () => {
      const tree = fromMarkdown('# Regular ADR\n\nSome content')
      const file = { path: 'docs/adr/some-decision.md' }
      expect(isTicketFile(file, tree)).toBe(false)
    })
  })

  describe('Non-ticket file handling', () => {
    it('should not report errors for non-ticket files', async () => {
      const markdown = `# Architecture Decision Record

## Status
Accepted

## Context
Some context here.
`
      const messages = await lintWithPath(markdown, 'docs/adr/some-decision.md')
      expect(messages).toHaveLength(0)
    })

    it('should still validate files in ISSUE_TEMPLATE even without metadata', async () => {
      const markdown = '# Incomplete template'
      const messages = await lintWithPath(markdown, '.github/ISSUE_TEMPLATE/test.md')
      expect(messages.some((m) => m.includes('Missing YAML metadata block'))).toBe(true)
    })
  })

  describe('Fix mode', () => {
    // Helper to run linter in fix mode
    async function lintWithFix(markdown, filePath) {
      const file = await remark()
        .use(remarkLintTicket, { fix: true })
        .process({ value: markdown, path: filePath })
      return {
        messages: file.messages.map((m) => m.message),
        output: String(file),
      }
    }

    it('should insert missing sections in fix mode', async () => {
      const markdown = `\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 3
labels:
  - enhancement
\`\`\`

## 📝 Summary

This is the summary.
`
      const { messages, output } = await lintWithFix(markdown, '.github/ISSUE_TEMPLATE/test.md')

      // Should have added missing sections
      expect(messages.some((m) => m.includes('🔧 Added missing section: 🎯 Context'))).toBe(true)
      expect(messages.some((m) => m.includes('🔧 Added missing section: ✅ Acceptance Criteria'))).toBe(
        true
      )

      // Output should contain the new sections
      expect(output).toContain('## 🎯 Context')
      expect(output).toContain('## ✅ Acceptance Criteria')
    })

    it('should not duplicate existing sections', async () => {
      const markdown = `\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 3
labels:
  - enhancement
\`\`\`

## 📝 Summary

Summary here.

## 🎯 Context

Context here.

## ✅ Acceptance Criteria

- [ ] Criterion

## 🎭 Scenarios (Given/When/Then)

\`\`\`gherkin
Given something
When action
Then result
\`\`\`
`
      const { messages, output } = await lintWithFix(markdown, '.github/ISSUE_TEMPLATE/test.md')

      // Should not have added any sections
      const addedSections = messages.filter((m) => m.includes('🔧 Added'))
      expect(addedSections).toHaveLength(0)

      // Should only have one of each heading
      const contextMatches = output.match(/## 🎯 Context/g) || []
      expect(contextMatches).toHaveLength(1)
    })

    it('should insert sections before Related section', async () => {
      const markdown = `\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 3
labels:
  - enhancement
\`\`\`

## 📝 Summary

Summary here.

## 🔗 Related

- Link to something
`
      const { output } = await lintWithFix(markdown, '.github/ISSUE_TEMPLATE/test.md')

      // Context should appear before Related
      const contextIndex = output.indexOf('## 🎯 Context')
      const relatedIndex = output.indexOf('## 🔗 Related')

      expect(contextIndex).toBeGreaterThan(-1)
      expect(contextIndex).toBeLessThan(relatedIndex)
    })

    it('should work for bug tickets', async () => {
      const markdown = `\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 2
labels:
  - bug
\`\`\`

## 🐛 Bug Summary

Bug description.
`
      const { messages, output } = await lintWithFix(markdown, '.github/ISSUE_TEMPLATE/test.md')

      // Should add bug-specific sections
      expect(messages.some((m) => m.includes('🔧 Added missing section: 🔄 Reproduction'))).toBe(true)
      expect(output).toContain('## 🔄 Reproduction')
      expect(output).toContain('Steps to Reproduce')
    })

    it('should work for epic tickets', async () => {
      const markdown = `\`\`\`yaml
# 📦 METADATA
repo: TiedSiren51
story_points: 21
labels:
  - epic
\`\`\`

## 🎯 Goal

Epic goal here.
`
      const { messages, output } = await lintWithFix(markdown, '.github/ISSUE_TEMPLATE/test.md')

      // Should add epic-specific sections
      expect(messages.some((m) => m.includes('🔧 Added missing section: 📋 Stories / Tasks'))).toBe(
        true
      )
      expect(output).toContain('## 📋 Stories / Tasks')
    })
  })
})
