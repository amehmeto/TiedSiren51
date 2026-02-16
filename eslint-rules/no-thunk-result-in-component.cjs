/**
 * @fileoverview Disallow checking thunk results in React components
 * Components should not use `.fulfilled.match()` or `.rejected.match()`
 * to imperatively react to thunk outcomes. Instead, let the reducer update
 * state and drive the UI reactively via selectors.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow .fulfilled.match() / .rejected.match() in React components — use state-driven UI instead',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noThunkResult:
        'Do not check thunk results with .{{status}}.match() in components. Let the reducer handle state transitions and drive the UI reactively via selectors.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    if (
      !filename.endsWith('.tsx') ||
      filename.includes('.test.') ||
      filename.includes('.spec.')
    )
      return {}

    return {
      MemberExpression(node) {
        if (
          node.property.type !== 'Identifier' ||
          node.property.name !== 'match'
        )
          return

        const parent = node.object
        if (
          parent.type !== 'MemberExpression' ||
          parent.property.type !== 'Identifier'
        )
          return

        const status = parent.property.name
        if (status !== 'fulfilled' && status !== 'rejected') return

        context.report({
          node,
          messageId: 'noThunkResult',
          data: { status },
        })
      },
    }
  },
}
