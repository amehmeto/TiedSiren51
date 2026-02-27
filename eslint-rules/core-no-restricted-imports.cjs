/**
 * @fileoverview Ban non-deterministic imports in core production code.
 * Scoped to core/**\/*.ts, excluding tests, fixtures, ports, and builders.
 * Replaces ESLint's no-restricted-imports with file-path scoping for OxLint.
 * @author TiedSiren
 */

const RESTRICTED_IMPORTS = [
  {
    name: 'uuid',
    message:
      'Non-deterministic: Use UuidProvider dependency instead of uuid in core.',
  },
  {
    name: 'react-native-uuid',
    message:
      'Non-deterministic: Use UuidProvider dependency instead of react-native-uuid in core.',
  },
  {
    name: 'crypto',
    message:
      'Non-deterministic: Use UuidProvider dependency instead of crypto in core.',
  },
  {
    name: '@faker-js/faker',
    message:
      'Non-deterministic: Use data builders with injected dependencies instead of faker in core.',
  },
]

const restrictedNames = new Set(RESTRICTED_IMPORTS.map((i) => i.name))
const messageMap = Object.fromEntries(RESTRICTED_IMPORTS.map((i) => [i.name, i.message]))

function isCoreProductionFile(filename) {
  const normalized = filename.replace(/\\/g, '/')
  if (!normalized.includes('/core/')) return false
  if (normalized.includes('.test.ts')) return false
  if (normalized.includes('.spec.ts')) return false
  if (normalized.includes('.fixture.ts')) return false
  if (normalized.includes('.builder.ts')) return false
  if (normalized.includes('/_ports_/')) return false
  return true
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ban non-deterministic imports in core production code',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      restricted: '{{ message }}',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()
    if (!isCoreProductionFile(filename)) return {}

    return {
      ImportDeclaration(node) {
        const source = node.source.value
        if (restrictedNames.has(source))
          context.report({
            node,
            messageId: 'restricted',
            data: { message: messageMap[source] },
          })
      },
    }
  },
}
