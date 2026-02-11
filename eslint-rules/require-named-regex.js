/**
 * @fileoverview Require regex patterns to be extracted into descriptively named constants.
 * Inline regex literals reduce readability - a named constant explains the pattern's purpose.
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require regex patterns to be extracted into descriptively named constants for readability.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      requireNamedRegex:
        'Inline regex should be extracted into a descriptively named constant (e.g., const {{ suggestedName }} = {{ pattern }}).',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Allow in test files - inline regex in tests is often acceptable
    if (
      filename.includes('.test.ts') ||
      filename.includes('.test.tsx') ||
      filename.includes('.spec.ts') ||
      filename.includes('.spec.tsx')
    ) {
      return {}
    }

    // Allow in ESLint rule files - they define regex patterns
    if (filename.includes('eslint-rules/')) {
      return {}
    }

    /**
     * Check if the regex is already assigned to a named constant.
     * Valid patterns:
     * - const FOO_REGEX = /pattern/
     * - const fooPattern = /pattern/
     * - const FOO = /pattern/ (if parent is VariableDeclarator with Identifier)
     */
    function isAssignedToNamedConstant(node) {
      const parent = node.parent

      // Direct assignment: const FOO = /pattern/
      if (
        parent.type === 'VariableDeclarator' &&
        parent.id.type === 'Identifier'
      ) {
        return true
      }

      // Property in object: { foo: /pattern/ }
      if (parent.type === 'Property' && parent.key.type === 'Identifier') {
        return true
      }

      // Class property: static FOO = /pattern/
      if (
        parent.type === 'PropertyDefinition' &&
        parent.key.type === 'Identifier'
      ) {
        return true
      }

      return false
    }

    /**
     * Suggest a name based on the regex pattern.
     */
    function suggestName(pattern) {
      // Common patterns
      if (pattern.includes('\\d{2}:\\d{2}')) return 'TIME_PATTERN'
      if (pattern.includes('\\d{4}-\\d{2}-\\d{2}')) return 'DATE_PATTERN'
      if (pattern.includes('@')) return 'EMAIL_PATTERN'
      if (pattern.includes('https?://')) return 'URL_PATTERN'
      if (pattern.includes('^\\d+$')) return 'DIGITS_ONLY_PATTERN'
      return 'PATTERN_REGEX'
    }

    return {
      Literal(node) {
        // Check if it's a regex literal
        if (node.regex) {
          if (!isAssignedToNamedConstant(node)) {
            const pattern = `/${node.regex.pattern}/${node.regex.flags}`
            context.report({
              node,
              messageId: 'requireNamedRegex',
              data: {
                suggestedName: suggestName(node.regex.pattern),
                pattern,
              },
            })
          }
        }
      },

      // Also check for new RegExp(...) calls
      NewExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'RegExp'
        ) {
          if (!isAssignedToNamedConstant(node)) {
            const patternArg = node.arguments[0]
            const pattern =
              patternArg && patternArg.type === 'Literal'
                ? `new RegExp("${patternArg.value}")`
                : 'new RegExp(...)'

            context.report({
              node,
              messageId: 'requireNamedRegex',
              data: {
                suggestedName: 'PATTERN_REGEX',
                pattern,
              },
            })
          }
        }
      },
    }
  },
}
