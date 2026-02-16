/**
 * @fileoverview Require a logger call inside every catch block in infra layer.
 *
 * Catch blocks should always log the error before rethrowing or returning.
 * This ensures that the original error context (stack trace, Firebase error code, etc.)
 * is preserved in logs, even when the rethrown error has a translated user-friendly message.
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require a logger call (this.logger.error/warn/info) inside catch blocks in infra layer',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      requireLogger:
        'Catch blocks in infra must log the error via this.logger before rethrowing. Use: this.logger.error(`[ClassName] Failed to methodName: ${error}`)',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to infra/**/*.ts files, excluding tests and fakes
    if (!filename.includes('/infra/')) return {}
    if (filename.includes('.test.ts')) return {}
    if (filename.includes('.spec.ts')) return {}
    if (filename.includes('in-memory.')) return {}
    if (filename.includes('fake.')) return {}
    if (filename.includes('fake-')) return {}
    if (filename.includes('stub.')) return {}

    return {
      CatchClause(node) {
        const body = node.body.body
        if (!body || body.length === 0) {
          context.report({ node, messageId: 'requireLogger' })
          return
        }

        const hasLoggerCall = body.some(
          (stmt) => containsLoggerCall(stmt),
        )

        if (!hasLoggerCall) {
          context.report({ node, messageId: 'requireLogger' })
        }
      },
    }

    function containsLoggerCall(node) {
      if (!node) return false

      // ExpressionStatement wrapping a call expression
      if (node.type === 'ExpressionStatement')
        return containsLoggerCall(node.expression)

      // Direct call: this.logger.error(...), this.logger.warn(...), etc.
      if (node.type === 'CallExpression') {
        const callee = node.callee
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'MemberExpression' &&
          callee.object.object.type === 'ThisExpression' &&
          callee.object.property.name === 'logger'
        )
          return true
      }

      return false
    }
  },
}
