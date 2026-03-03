/**
 * @fileoverview Disallow direct usage of Date.now()
 * @author TiedSiren
 *
 * Flags calls to `Date.now()`. Production code should use
 * `dateProvider.getNowMs()` instead to keep time testable.
 *
 * BAD:
 *   const now = Date.now()
 *
 * GOOD:
 *   const now = dateProvider.getNowMs()
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct usage of `Date.now()`',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noDateNow:
        'Use `dateProvider.getNowMs()` instead of `Date.now()` to keep time testable.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()
    const normalized = filename.replace(/\\/g, '/')

    // Only enforce in core/ and ui/ production code
    const isTarget = /\/core\//.test(normalized) || /\/ui\//.test(normalized)
    const isExcluded =
      /\.(test|spec|fixture|builder)\.[jt]sx?$/.test(normalized) ||
      /\/_tests_\//.test(normalized)

    if (!isTarget || isExcluded) return {}

    return {
      CallExpression(node) {
        const { callee } = node
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'Date' &&
          callee.property.type === 'Identifier' &&
          callee.property.name === 'now'
        ) {
          context.report({
            node,
            messageId: 'noDateNow',
          })
        }
      },
    }
  },
}
