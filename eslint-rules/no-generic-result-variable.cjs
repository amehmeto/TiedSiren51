/**
 * @fileoverview Disallow generic variable and parameter names in tests
 *
 * The Act phase result should carry the intent of the action.
 * Use the verb from the function call (e.g., blockCats() → blockedCats)
 * or the "retrievedXxx" pattern (e.g., retrievedUser).
 *
 * Parameters should also be descriptive (e.g., "errorMessage" not "expected").
 *
 * @author TiedSiren
 */

const DEFAULT_FORBIDDEN_NAMES = ['result', 'res', 'ret', 'output']
const DEFAULT_FORBIDDEN_PARAMS = ['expected', 'value', 'val', 'data', 'input']

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow generic variable and parameter names — use descriptive names derived from the action or domain',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noGenericResult:
        "Avoid generic variable name '{{name}}'. Use a name derived from the action (e.g., blockedCats for blockCats()) or the 'retrievedXxx' pattern.",
      noGenericParam:
        "Avoid generic parameter name '{{name}}'. Use a descriptive name derived from the domain (e.g., 'errorMessage' instead of 'expected').",
    },
    schema: [
      {
        type: 'object',
        properties: {
          forbidden: {
            type: 'array',
            items: { type: 'string' },
          },
          forbiddenParams: {
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
    const forbidden = new Set(options.forbidden ?? DEFAULT_FORBIDDEN_NAMES)
    const forbiddenParams = new Set(
      options.forbiddenParams ?? DEFAULT_FORBIDDEN_PARAMS,
    )

    function checkParams(params) {
      for (const param of params) {
        if (param.type !== 'Identifier') continue
        if (forbiddenParams.has(param.name)) {
          context.report({
            node: param,
            messageId: 'noGenericParam',
            data: { name: param.name },
          })
        }
      }
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type !== 'Identifier') return
        if (forbidden.has(node.id.name)) {
          context.report({
            node: node.id,
            messageId: 'noGenericResult',
            data: { name: node.id.name },
          })
        }
      },
      FunctionDeclaration(node) {
        checkParams(node.params)
      },
      FunctionExpression(node) {
        checkParams(node.params)
      },
      ArrowFunctionExpression(node) {
        checkParams(node.params)
      },
    }
  },
}
