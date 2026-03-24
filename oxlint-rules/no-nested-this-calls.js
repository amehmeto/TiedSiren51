/**
 * @fileoverview Prevent nested this.method(this.method(...)) calls.
 * When a method needs to compose two this.* calls, extract an intermediate
 * variable or create a dedicated method that encapsulates the composition.
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow nested this.method() calls as arguments',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      nestedThisCall:
        'Nested this.{{ outer }}(this.{{ inner }}(...)) detected. Extract the inner call to a variable or create a composed method.',
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.object.type !== 'ThisExpression'
        )
          return

        const outerName =
          node.callee.property.type === 'Identifier'
            ? node.callee.property.name
            : '?'

        for (const arg of node.arguments) {
          if (
            arg.type === 'CallExpression' &&
            arg.callee.type === 'MemberExpression' &&
            arg.callee.object.type === 'ThisExpression'
          ) {
            const innerName =
              arg.callee.property.type === 'Identifier'
                ? arg.callee.property.name
                : '?'

            context.report({
              node,
              messageId: 'nestedThisCall',
              data: { outer: outerName, inner: innerName },
            })
          }
        }
      },
    }
  },
}
