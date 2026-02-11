/**
 * @fileoverview Enforce inlining single-statement event handlers
 * Handlers with only one statement should be inlined at the call site
 * rather than defined as separate functions.
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce inlining single-statement event handlers (handle*, on*)',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      shouldInline:
        'Single-statement handler "{{name}}" should be inlined. Consider using an arrow function directly at the call site instead of defining a separate function.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to React component files (tsx)
    if (!filename.endsWith('.tsx')) return {}

    // Skip test files
    if (filename.includes('.test.') || filename.includes('.spec.')) return {}

    return {
      VariableDeclarator(node) {
        // Check if it's a handler function (handle* or on*)
        if (node.id.type !== 'Identifier') return

        const name = node.id.name
        if (!name.startsWith('handle') && !name.startsWith('on')) return

        // Check if it's an arrow function
        if (!node.init || node.init.type !== 'ArrowFunctionExpression') return

        const body = node.init.body

        // If body is not a block statement (implicit return), it's already concise
        if (body.type !== 'BlockStatement') return

        // Check if the block has exactly one statement
        if (body.body.length !== 1) return

        // Report single-statement handlers
        context.report({
          node,
          messageId: 'shouldInline',
          data: { name },
        })
      },
    }
  },
}
