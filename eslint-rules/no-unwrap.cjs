/**
 * @fileoverview Disallow calling .unwrap() on dispatched Redux thunks
 * @author TiedSiren
 *
 * Redux thunks dispatched via `dispatch(thunk())` return a promise that always
 * resolves. Calling `.unwrap()` converts it to a standard promise that rejects
 * on thunk rejection. This breaks our pattern of relying exclusively on Redux
 * state for success/error handling.
 *
 * BAD:
 *   dispatch(changePassword({ newPassword })).unwrap()
 *
 * GOOD:
 *   dispatch(changePassword({ newPassword }))
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow .unwrap() — rely on Redux state for thunk success/error handling',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noUnwrap:
        'Do not use .unwrap() — handle thunk results via Redux state instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'unwrap'
        )
          return

        context.report({
          node: node.callee.property,
          messageId: 'noUnwrap',
        })
      },
    }
  },
}
