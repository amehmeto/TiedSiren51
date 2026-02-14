/**
 * @fileoverview Disallow overly generic variable and function names
 *
 * Generic names like `data`, `item`, `items`, `compute` lack context
 * and force readers to look up what they refer to. Prefer descriptive
 * names that convey intent (e.g., `sortedSirens` instead of `items`).
 *
 * @author TiedSiren
 */

const DEFAULT_FORBIDDEN_VARIABLES = ['data', 'item', 'items']
const DEFAULT_FORBIDDEN_FUNCTION_PATTERNS = ['compute']

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow overly generic variable and function names — use descriptive names that convey intent',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noLameVariableName:
        "Avoid generic variable name '{{name}}'. Use a more descriptive name that conveys what it represents.",
      noLameFunctionName:
        "Avoid generic function name '{{name}}'. Use a more descriptive name that conveys what it does (e.g., 'sortSirens' instead of 'computeSortedLists').",
    },
    schema: [
      {
        type: 'object',
        properties: {
          forbiddenVariables: {
            type: 'array',
            items: { type: 'string' },
          },
          forbiddenFunctionPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const forbiddenVariables = new Set(
      options.forbiddenVariables ?? DEFAULT_FORBIDDEN_VARIABLES,
    )
    const forbiddenFunctionPatterns =
      options.forbiddenFunctionPatterns ?? DEFAULT_FORBIDDEN_FUNCTION_PATTERNS

    function isForbiddenFunctionName(name) {
      return forbiddenFunctionPatterns.some((pattern) =>
        name.toLowerCase().startsWith(pattern.toLowerCase()),
      )
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return
        if (forbiddenVariables.has(node.id.name))
          context.report({
            node: node.id,
            messageId: 'noLameVariableName',
            data: { name: node.id.name },
          })
      },

      // Check function declaration parameters
      'FunctionDeclaration > Identifier.params'(node) {
        if (forbiddenVariables.has(node.name))
          context.report({
            node,
            messageId: 'noLameVariableName',
            data: { name: node.name },
          })
      },

      // Check arrow function parameters
      ArrowFunctionExpression(node) {
        for (const param of node.params) {
          if (param.type !== 'Identifier') continue
          if (!forbiddenVariables.has(param.name)) continue
          context.report({
            node: param,
            messageId: 'noLameVariableName',
            data: { name: param.name },
          })
        }
      },

      FunctionDeclaration(node) {
        if (!node.id) return
        if (isForbiddenFunctionName(node.id.name))
          context.report({
            node: node.id,
            messageId: 'noLameFunctionName',
            data: { name: node.id.name },
          })
      },

      // Variable declarations with arrow functions: const computeX = () => {}
      'VariableDeclarator[init.type="ArrowFunctionExpression"]'(node) {
        if (node.id.type !== 'Identifier') return
        if (isForbiddenFunctionName(node.id.name))
          context.report({
            node: node.id,
            messageId: 'noLameFunctionName',
            data: { name: node.id.name },
          })
      },

      // Object property keys for method definitions: { computeStuff() {} }
      'Property[value.type="FunctionExpression"] > Identifier.key'(node) {
        if (isForbiddenFunctionName(node.name))
          context.report({
            node,
            messageId: 'noLameFunctionName',
            data: { name: node.name },
          })
      },
    }
  },
}
