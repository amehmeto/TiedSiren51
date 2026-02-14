/**
 * @fileoverview Disallow hardcoded testID props not referenced in test files
 *
 * Hardcoded testID strings (e.g., testID="foo-bar") are often leftovers
 * that no test references. Prefer passing testID from props or removing it.
 *
 * @author TiedSiren
 */

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
