/**
 * @fileoverview Disallow ternary expressions with `false` as the fallback value
 * @author TiedSiren
 *
 * Flags ternary expressions where the alternate is the literal `false`.
 * This pattern is redundant and should be replaced by `&&` or moved
 * upstream (e.g., to a selector or view model).
 *
 * BAD:
 *   const isDisabled = viewModel.type === 'SUCCESS' ? viewModel.isDisabled : false
 *
 * GOOD:
 *   const isDisabled = viewModel.type === 'SUCCESS' && viewModel.isDisabled
 *   // or move the logic to a selector that returns a flat object
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow ternary expressions with `false` as the fallback value',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noTernaryFalseFallback:
        'Redundant ternary with `false` fallback. Use `&&` operator or move the logic upstream (e.g., to the selector/view model).',
    },
    schema: [],
  },

  create(context) {
    return {
      ConditionalExpression(node) {
        if (
          node.alternate.type === 'Literal' &&
          node.alternate.value === false
        ) {
          context.report({
            node,
            messageId: 'noTernaryFalseFallback',
          })
        }
      },
    }
  },
}
