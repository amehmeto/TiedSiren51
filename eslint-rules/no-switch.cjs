/**
 * @fileoverview Disallow switch statements.
 * Replaces eslint-plugin-no-switch-statements for OxLint.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow switch statements — use object maps or if/else chains',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noSwitch:
        'Unexpected switch statement. Use an object map or if/else chain instead.',
    },
    schema: [],
  },

  create(context) {
    return {
      SwitchStatement(node) {
        context.report({ node, messageId: 'noSwitch' })
      },
    }
  },
}
