/**
 * @fileoverview Ban non-deterministic property access in core production code.
 * Scoped to core/**\/*.ts, excluding tests, fixtures, ports, and builders.
 * Replaces ESLint's no-restricted-properties with file-path scoping for OxLint.
 * @author TiedSiren
 */

const RESTRICTED_PROPERTIES = [
  {
    object: 'Math',
    property: 'random',
    message:
      'Non-deterministic: Use RandomProvider dependency instead of Math.random() in core.',
  },
  {
    object: 'process',
    property: 'env',
    message:
      'Non-deterministic: Use ConfigProvider dependency instead of process.env in core.',
  },
  {
    object: 'window',
    property: 'location',
    message:
      'Non-deterministic: Use RouterProvider dependency instead of window.location in core.',
  },
  {
    object: 'window',
    property: 'localStorage',
    message:
      'Non-deterministic: Use a Repository dependency instead of window.localStorage in core.',
  },
  {
    object: 'window',
    property: 'sessionStorage',
    message:
      'Non-deterministic: Use a Repository dependency instead of window.sessionStorage in core.',
  },
]

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
      description:
        'Ban non-deterministic property access in core production code',
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
      MemberExpression(node) {
        if (node.object.type !== 'Identifier') return
        if (node.property.type !== 'Identifier') return

        const objName = node.object.name
        const propName = node.property.name

        for (const restriction of RESTRICTED_PROPERTIES)
          if (restriction.object === objName && restriction.property === propName)
            context.report({
              node,
              messageId: 'restricted',
              data: { message: restriction.message },
            })
      },
    }
  },
}
