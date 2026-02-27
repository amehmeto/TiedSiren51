/**
 * @fileoverview Ban vi/jest mocking in core tests — use dependency injection.
 * Scoped to core/**\/*.test.ts and core/**\/*.spec.ts.
 * Replaces ESLint's no-restricted-properties with file-path scoping for OxLint.
 * @author TiedSiren
 */

const RESTRICTED_PROPERTIES = [
  {
    object: 'vi',
    property: 'useFakeTimers',
    message:
      'Use DateProvider dependency injection instead of vi.useFakeTimers() in core tests.',
  },
  {
    object: 'vi',
    property: 'useRealTimers',
    message:
      'Use DateProvider dependency injection instead of vi.useRealTimers() in core tests.',
  },
  {
    object: 'vi',
    property: 'spyOn',
    message:
      'Use dependency injection (fakes/stubs) instead of vi.spyOn() in core tests.',
  },
  {
    object: 'jest',
    property: 'useFakeTimers',
    message:
      'Use DateProvider dependency injection instead of jest.useFakeTimers() in core tests.',
  },
  {
    object: 'jest',
    property: 'useRealTimers',
    message:
      'Use DateProvider dependency injection instead of jest.useRealTimers() in core tests.',
  },
  {
    object: 'jest',
    property: 'spyOn',
    message:
      'Use dependency injection (fakes/stubs) instead of jest.spyOn() in core tests.',
  },
]

function isCoreTestFile(filename) {
  const normalized = filename.replace(/\\/g, '/')
  if (!normalized.includes('/core/')) return false
  return normalized.includes('.test.ts') || normalized.includes('.spec.ts')
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ban vi/jest mocking in core tests — use dependency injection',
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
    if (!isCoreTestFile(filename)) return {}

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
