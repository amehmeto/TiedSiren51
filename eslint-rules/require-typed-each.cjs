/**
 * @fileoverview Require type parameter on it.each / test.each / describe.each calls
 * @author TiedSiren
 *
 * Ensures that parameterized test calls always include a type annotation
 * for better type safety and readability.
 *
 * BAD:
 *   it.each([['a', 1]])('test %s', (str, num) => {})
 *
 * GOOD:
 *   it.each<[string, number]>([['a', 1]])('test %s', (str, num) => {})
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require type parameter on it.each / test.each / describe.each calls',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      requireTypeParam:
        '`{{ callee }}.each` must have a type parameter (e.g., `{{ callee }}.each<[string, number]>(...)`).',
    },
    schema: [],
  },

  create(context) {
    const eachCallees = new Set(['it', 'test', 'describe'])

    return {
      CallExpression(node) {
        const { callee, typeArguments, typeParameters } = node

        // Match: it.each(...), test.each(...), describe.each(...)
        const { type, property, object } = callee
        if (
          type !== 'MemberExpression' ||
          property.type !== 'Identifier' ||
          property.name !== 'each'
        )
          return

        const objectName = getObjectName(object)
        if (!objectName || !eachCallees.has(objectName)) return

        // Check for type parameters (TypeScript generic)
        // Support both typeArguments (new) and typeParameters (deprecated)
        if (!typeArguments && !typeParameters) {
          context.report({
            node: property,
            messageId: 'requireTypeParam',
            data: { callee: objectName },
          })
        }
      },
    }

    function getObjectName(node) {
      return node.type === 'Identifier' ? node.name : null
    }
  },
}
