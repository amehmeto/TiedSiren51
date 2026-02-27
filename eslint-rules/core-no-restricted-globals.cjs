/**
 * @fileoverview Ban non-deterministic globals in core production code.
 * Scoped to core/**\/*.ts, excluding tests, fixtures, ports, and builders.
 * Replaces ESLint's no-restricted-globals with file-path scoping for OxLint.
 * @author TiedSiren
 */

const RESTRICTED_GLOBALS = [
  {
    name: 'Date',
    message:
      'Non-deterministic: Use DateProvider dependency instead of Date in core.',
  },
  {
    name: 'performance',
    message:
      'Non-deterministic: Use DateProvider dependency instead of performance in core.',
  },
  {
    name: 'setTimeout',
    message:
      'Non-deterministic: Use TimerProvider dependency instead of setTimeout in core.',
  },
  {
    name: 'setInterval',
    message:
      'Non-deterministic: Use TimerProvider dependency instead of setInterval in core.',
  },
  {
    name: 'crypto',
    message:
      'Non-deterministic: Use UuidProvider dependency instead of crypto in core.',
  },
  {
    name: 'fetch',
    message:
      'Non-deterministic: Use a Repository/Gateway dependency instead of fetch in core.',
  },
  {
    name: 'XMLHttpRequest',
    message:
      'Non-deterministic: Use a Repository/Gateway dependency instead of XMLHttpRequest in core.',
  },
  {
    name: 'localStorage',
    message:
      'Non-deterministic: Use a Repository dependency instead of localStorage in core.',
  },
  {
    name: 'sessionStorage',
    message:
      'Non-deterministic: Use a Repository dependency instead of sessionStorage in core.',
  },
  {
    name: 'navigator',
    message:
      'Non-deterministic: Use a DeviceProvider dependency instead of navigator in core.',
  },
  {
    name: 'location',
    message:
      'Non-deterministic: Use a RouterProvider dependency instead of location in core.',
  },
]

const restrictedNames = new Set(RESTRICTED_GLOBALS.map((g) => g.name))
const messageMap = Object.fromEntries(RESTRICTED_GLOBALS.map((g) => [g.name, g.message]))

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
      description: 'Ban non-deterministic globals in core production code',
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
      Identifier(node) {
        if (!restrictedNames.has(node.name)) return

        // Skip if it's a property access (e.g., obj.Date is fine)
        if (node.parent.type === 'MemberExpression' && node.parent.property === node) return

        // Skip if it's a declaration (e.g., const Date = ...)
        if (node.parent.type === 'VariableDeclarator' && node.parent.id === node) return

        // Skip if it's a function parameter
        if (node.parent.type === 'FunctionDeclaration' && node.parent.params.includes(node)) return
        if (node.parent.type === 'ArrowFunctionExpression' && node.parent.params.includes(node))
          return

        // Skip type annotations (TypeScript)
        if (
          node.parent.type === 'TSTypeReference' ||
          node.parent.type === 'TSTypeAnnotation'
        )
          return

        // Skip import specifiers
        if (
          node.parent.type === 'ImportSpecifier' ||
          node.parent.type === 'ImportDefaultSpecifier'
        )
          return

        context.report({
          node,
          messageId: 'restricted',
          data: { message: messageMap[node.name] },
        })
      },
    }
  },
}
