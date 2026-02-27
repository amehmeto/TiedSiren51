/**
 * @fileoverview Disallow nested function calls as arguments
 * Nested calls like `a(b(x))` should be extracted to variables for readability.
 *
 * Path-based option selection (replaces ESLint excludedFiles overrides):
 * - core selectors (non-test): allowedPatterns for entity adapter methods
 * - fixture files: allowNoArguments
 * - ui files (non-test): allowNoArguments
 * - Test files: rule disabled
 *
 * @author TiedSiren
 */

const SELECTOR_ALLOWED_PATTERNS = [
  '^map$',
  '^filter$',
  '^flatMap$',
  '^find$',
  '^some$',
  '^every$',
  '^selectAll$',
  '^selectById$',
  '^selectIds$',
  '^selectEntities$',
  '^getSelectors$',
]

function getOptionsForFile(filename, explicitOptions) {
  // If explicit options are provided (ESLint/RuleTester usage), use them directly
  if (explicitOptions) return explicitOptions

  const normalized = filename.replace(/\\/g, '/')

  // RuleTester or unknown filename: enable with default (strict) options
  if (!normalized.includes('/') && !normalized.includes('\\'))
    return {}

  // Test files: disabled
  if (normalized.includes('.test.ts') || normalized.includes('.spec.ts'))
    return null

  // Selectors in core (non-test): allowedPatterns
  if (normalized.includes('/core/') && normalized.includes('/selectors/'))
    return { allowedPatterns: SELECTOR_ALLOWED_PATTERNS }

  // Fixture files: allowNoArguments
  if (normalized.includes('.fixture.ts'))
    return { allowNoArguments: true }

  // UI files (non-test): allowNoArguments
  if (normalized.includes('/ui/'))
    return { allowNoArguments: true }

  // All other files: disabled (not yet progressively enabled)
  return null
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow nested function calls as arguments',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noNestedCalls:
        'Avoid nested function calls. Extract `{{innerCall}}` to a variable first.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedPatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'Patterns of function names to allow nesting',
          },
          allowNoArguments: {
            type: 'boolean',
            description:
              'Allow nested calls when inner call has no arguments (e.g., getState())',
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()
    const explicitOptions = context.options[0]
    const resolvedOptions = getOptionsForFile(filename, explicitOptions)

    // Disabled for this file path
    if (!resolvedOptions) return {}

    const allowedPatterns = (resolvedOptions.allowedPatterns || []).map(
      (p) => new RegExp(p),
    )
    const allowNoArguments = resolvedOptions.allowNoArguments || false

    function getCallName(node) {
      if (node.callee.type === 'Identifier') return node.callee.name

      if (node.callee.type === 'MemberExpression') {
        if (node.callee.property.type === 'Identifier')
          return node.callee.property.name

        return '...'
      }

      return '...'
    }

    const alwaysAllowedOuter = ['dispatch']

    function isAllowed(name) {
      return allowedPatterns.some((pattern) => pattern.test(name))
    }

    function isAlwaysAllowedOuter(name) {
      return alwaysAllowedOuter.includes(name)
    }

    return {
      CallExpression(node) {
        const outerName = getCallName(node)
        if (isAllowed(outerName) || isAlwaysAllowedOuter(outerName)) return

        for (const arg of node.arguments) {
          if (arg.type === 'CallExpression') {
            const innerName = getCallName(arg)
            if (isAllowed(innerName)) continue

            if (allowNoArguments && arg.arguments.length === 0) continue

            context.report({
              node: arg,
              messageId: 'noNestedCalls',
              data: { innerCall: `${innerName}(...)` },
            })
          }

          if (arg.type === 'NewExpression') {
            const innerName =
              arg.callee.type === 'Identifier' ? arg.callee.name : '...'
            if (isAllowed(innerName)) continue

            if (allowNoArguments && arg.arguments.length === 0) continue

            context.report({
              node: arg,
              messageId: 'noNestedCalls',
              data: { innerCall: `new ${innerName}(...)` },
            })
          }
        }
      },
    }
  },
}
