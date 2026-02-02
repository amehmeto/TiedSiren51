/**
 * @fileoverview Require extracting complex expressions with long strings to variables
 * @author TiedSiren
 *
 * Catches function arguments that are complex expressions (binary, logical, conditional)
 * containing string literals longer than the configured threshold.
 *
 * BAD:
 *   showToast(foo ?? 'This action is currently disabled')
 *
 * GOOD:
 *   const message = foo ?? 'This action is currently disabled'
 *   showToast(message)
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require extracting complex expressions with long strings to variables',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      extractArgument:
        'Extract this complex expression to a variable. Arguments with operators and long strings should be extracted for readability.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxStringLength: {
            type: 'integer',
            description:
              'Maximum string length before requiring extraction (default: 20)',
            default: 20,
          },
          allowedFunctions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Function names where complex arguments are allowed',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const maxStringLength = options.maxStringLength ?? 20
    const allowedFunctions = new Set(options.allowedFunctions || [])

    /**
     * Check if node is a complex expression (binary, logical, or conditional)
     */
    function isComplexExpression(node) {
      return (
        node.type === 'LogicalExpression' ||
        node.type === 'BinaryExpression' ||
        node.type === 'ConditionalExpression'
      )
    }

    /**
     * Find all string literals in an AST node (recursive)
     */
    function findStringLiterals(node, results = []) {
      if (!node || typeof node !== 'object') return results

      if (node.type === 'Literal' && typeof node.value === 'string') {
        results.push(node)
        return results
      }

      if (node.type === 'TemplateLiteral') {
        // For template literals, check the total length of quasis
        const totalLength = node.quasis.reduce(
          (sum, quasi) => sum + quasi.value.raw.length,
          0,
        )
        if (totalLength > 0) {
          results.push({ type: 'TemplateLiteral', length: totalLength })
        }
        return results
      }

      // Recurse into child nodes
      for (const key of Object.keys(node)) {
        if (key === 'parent') continue
        const child = node[key]
        if (Array.isArray(child)) {
          for (const item of child) {
            findStringLiterals(item, results)
          }
        } else if (child && typeof child === 'object' && child.type) {
          findStringLiterals(child, results)
        }
      }

      return results
    }

    /**
     * Check if any string literal exceeds the max length
     */
    function hasLongString(node) {
      const strings = findStringLiterals(node)
      return strings.some((s) => {
        if (s.type === 'TemplateLiteral') {
          return s.length > maxStringLength
        }
        return s.value.length > maxStringLength
      })
    }

    /**
     * Get the function name from a call expression
     */
    function getFunctionName(node) {
      if (node.callee.type === 'Identifier') {
        return node.callee.name
      }
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.property.type === 'Identifier'
      ) {
        return node.callee.property.name
      }
      return null
    }

    return {
      CallExpression(node) {
        const functionName = getFunctionName(node)
        if (functionName && allowedFunctions.has(functionName)) {
          return
        }

        for (const arg of node.arguments) {
          if (isComplexExpression(arg) && hasLongString(arg)) {
            context.report({
              node: arg,
              messageId: 'extractArgument',
            })
          }
        }
      },
    }
  },
}
