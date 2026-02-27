/**
 * @fileoverview Disallow hardcoded testID props not referenced in test files
 *
 * Hardcoded testID strings (e.g., testID="foo-bar") are often leftovers
 * that no test references. Prefer passing testID from props or removing it.
 *
 * Scoped to ui/**\/*.ts(x), excluding test files.
 * Replaces ESLint's file-override scoping for OxLint.
 *
 * @author TiedSiren
 */

function isUiProductionFile(filename) {
  const normalized = filename.replace(/\\/g, '/')
  // RuleTester or unknown filename: enable
  if (!normalized.includes('/') && !normalized.includes('\\'))
    return true
  if (!normalized.includes('/ui/')) return false
  if (normalized.includes('.test.ts')) return false
  if (normalized.includes('.spec.ts')) return false
  return true
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow hardcoded testID string literals — pass testID from props or remove it',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noHardcodedTestId:
        'Avoid hardcoded testID="{{value}}". Either pass testID from props or remove it if unused.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()
    if (!isUiProductionFile(filename)) return {}

    return {
      JSXAttribute(node) {
        if (node.name.name !== 'testID') return

        const isStringLiteral =
          node.value && node.value.type === 'Literal' && typeof node.value.value === 'string'
        if (!isStringLiteral) return

        context.report({
          node,
          messageId: 'noHardcodedTestId',
          data: { value: node.value.value },
        })
      },
    }
  },
}
