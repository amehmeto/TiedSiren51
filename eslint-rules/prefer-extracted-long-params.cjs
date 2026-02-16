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
    fixable: 'code',
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

    function findEnclosingStatement(node) {
      const statementTypes = new Set([
        'ExpressionStatement',
        'ReturnStatement',
        'VariableDeclaration',
        'IfStatement',
        'ThrowStatement',
      ])
      let current = node.parent
      while (current) {
        if (
          statementTypes.has(current.type) &&
          current.parent &&
          (current.parent.type === 'BlockStatement' || current.parent.type === 'Program')
        ) {
          return current
        }
        current = current.parent
      }
      return null
    }

    function getIndentation(node) {
      const lines = sourceCode.getLines()
      const line = lines[node.loc.start.line - 1]
      const match = line.match(/^(\s*)/)
      return match ? match[1] : ''
    }

    function lowerFirst(str) {
      if (!str) return str
      return str[0].toLowerCase() + str.slice(1)
    }

    function toCamelCase(str) {
      return lowerFirst(
        str
          .split('_')
          .filter(Boolean)
          .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
          .join(''),
      )
    }

    function deriveVariableName(node) {
      if (node.type === 'MemberExpression') {
        if (
          node.computed &&
          node.object.type === 'MemberExpression' &&
          node.object.property.type === 'Identifier'
        ) {
          const name = node.object.property.name
          if (name !== name.toLowerCase() && name === name.toUpperCase()) {
            return toCamelCase(name)
          }
          return lowerFirst(name)
        }
        if (!node.computed && node.property.type === 'Identifier') {
          const name = node.property.name
          if (name !== name.toLowerCase() && name === name.toUpperCase()) {
            return toCamelCase(name)
          }
          return lowerFirst(name)
        }
      }
      if (node.type === 'CallExpression') {
        const callee = node.callee
        let name = null
        if (callee.type === 'Identifier') name = callee.name
        if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier')
          name = callee.property.name
        if (name) {
          const stripped = name.replace(/^(get|create|build|fetch|make|compute|find|resolve)/, '')
          if (stripped && stripped !== name) return lowerFirst(stripped)
          return lowerFirst(name)
        }
      }
      if (node.type === 'ObjectExpression') return 'options'
      return 'extracted'
    }

    function deriveVariableNameForInnerArg(node) {
      if (node.type === 'ObjectExpression') return 'payload'
      return deriveVariableName(node)
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
            fix(fixer) {
              const enclosingStatement = findEnclosingStatement(arg)
              if (!enclosingStatement) return null
              const name = deriveVariableName(arg)
              const indent = getIndentation(enclosingStatement)
              return [
                fixer.insertTextBefore(enclosingStatement, `const ${name} = ${argText}\n${indent}`),
                fixer.replaceText(arg, name),
              ]
            },
          })
        }
      }
    }

    function checkInnerArgs(args) {
      for (const arg of args) {
        if (simpleNodeTypes.has(arg.type)) continue
        const argText = sourceCode.getText(arg)
        context.report({
          node: arg,
          messageId: 'extractParam',
          fix(fixer) {
            const enclosingStatement = findEnclosingStatement(arg)
            if (!enclosingStatement) return null
            const name = deriveVariableNameForInnerArg(arg)
            const indent = getIndentation(enclosingStatement)
            return [
              fixer.insertTextBefore(enclosingStatement, `const ${name} = ${argText}\n${indent}`),
              fixer.replaceText(arg, name),
            ]
          },
        })
      }
    }
  },
}
