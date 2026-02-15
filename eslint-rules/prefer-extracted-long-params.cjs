/**
 * @fileoverview Require extracting long function arguments into named variables
 * @author TiedSiren
 *
 * When a function/constructor call has arguments whose source text is long enough
 * that Prettier would break them onto separate lines, those arguments should be
 * extracted into named variables for readability.
 *
 * BAD:
 *   return new AuthError(
 *     FirebaseAuthGateway.FIREBASE_ERRORS[error.code],
 *     FirebaseAuthGateway.FIREBASE_ERROR_TYPES[error.code],
 *   )
 *
 * GOOD:
 *   const errorMessage = FirebaseAuthGateway.FIREBASE_ERRORS[error.code]
 *   const errorType = FirebaseAuthGateway.FIREBASE_ERROR_TYPES[error.code]
 *   return new AuthError(errorMessage, errorType)
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require extracting long function arguments into named variables when they would cause line breaks',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      extractParam:
        'Extract this long argument into a named variable. When arguments are long enough to break across lines, they should be extracted for readability.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxArgumentLength: {
            type: 'integer',
            description:
              'Maximum argument source length before requiring extraction (default: 40)',
            default: 40,
          },
          allowedNodeTypes: {
            type: 'array',
            items: { type: 'string' },
            description:
              'AST node types that are always allowed as arguments (default: Identifier, Literal, TemplateLiteral, SpreadElement)',
          },
          exemptFunctions: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Function names whose arguments are exempt from this rule (matches the final identifier in the callee)',
          },
          transparentWrappers: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Function names that are treated as transparent wrappers (e.g. dispatch). The rule skips the wrapper itself but checks inner call arguments, ignoring allowedNodeTypes for those inner args.',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const maxArgumentLength = options.maxArgumentLength ?? 40
    const allowedNodeTypes = new Set(
      options.allowedNodeTypes || [
        'Identifier',
        'Literal',
        'TemplateLiteral',
        'SpreadElement',
        'UnaryExpression',
        'ArrowFunctionExpression',
        'FunctionExpression',
        'ObjectExpression',
        'ArrayExpression',
      ],
    )

    const exemptFunctions = new Set(options.exemptFunctions || [])
    const transparentWrappers = new Set(options.transparentWrappers || [])
    const sourceCode = context.getSourceCode()
    const wrappedCalls = new Set()
    const simpleNodeTypes = new Set([
      'Identifier',
      'Literal',
      'TemplateLiteral',
      'SpreadElement',
      'UnaryExpression',
    ])

    return {
      CallExpression: checkCallExpression,
      NewExpression: checkCallExpression,
    }

    function getCalleeName(node) {
      const callee = node.callee
      if (callee.type === 'Identifier') return callee.name
      if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier')
        return callee.property.name
      return null
    }

    function checkCallExpression(node) {
      if (node.arguments.length === 0) return
      if (wrappedCalls.has(node)) return

      const calleeName = getCalleeName(node)
      if (calleeName && exemptFunctions.has(calleeName)) return

      if (calleeName && transparentWrappers.has(calleeName)) {
        for (const arg of node.arguments) {
          if (arg.type === 'CallExpression' && arg.arguments.length > 0) {
            const innerCallText = sourceCode.getText(arg)
            wrappedCalls.add(arg)
            if (innerCallText.length > maxArgumentLength) {
              checkInnerArgs(arg.arguments)
            }
          }
        }
        return
      }

      for (const arg of node.arguments) {
        if (allowedNodeTypes.has(arg.type)) continue

        const argText = sourceCode.getText(arg)
        if (argText.length > maxArgumentLength) {
          context.report({
            node: arg,
            messageId: 'extractParam',
          })
        }
      }
    }

    function checkInnerArgs(args) {
      for (const arg of args) {
        if (simpleNodeTypes.has(arg.type)) continue
        context.report({
          node: arg,
          messageId: 'extractParam',
        })
      }
    }
  },
}
