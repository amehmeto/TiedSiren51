/**
 * @fileoverview Prefer enum over union of string literals
 *
 * Flags patterns like:
 *   type Direction = 'earlier' | 'later'
 *   direction: 'earlier' | 'later'
 *
 * Does NOT flag unions containing null or undefined:
 *   name: string | null
 *   value?: string | undefined
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer enum over union of string literals',
      category: 'Stylistic Issues',
      recommended: false,
    },
    messages: {
      preferEnum:
        'Prefer enum over string literal union. Consider creating an enum for: {{ values }}',
    },
    schema: [
      {
        type: 'object',
        properties: {
          minLiterals: {
            type: 'integer',
            minimum: 2,
            description:
              'Minimum number of string literals to trigger the rule.',
          },
          ignoredPatterns: {
            type: 'array',
            items: { type: 'string' },
            description:
              'Regex patterns for string literals to ignore (e.g., icon names from external libraries).',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const minLiterals = options.minLiterals || 2
    const ignoredPatterns = (options.ignoredPatterns || []).map(
      (p) => new RegExp(p),
    )

    function isStringLiteral(node) {
      return node.type === 'TSLiteralType' && typeof node.literal.value === 'string'
    }

    function isNullOrUndefined(node) {
      return (
        node.type === 'TSNullKeyword' ||
        node.type === 'TSUndefinedKeyword' ||
        (node.type === 'TSTypeReference' &&
          node.typeName.type === 'Identifier' &&
          (node.typeName.name === 'null' || node.typeName.name === 'undefined'))
      )
    }

    function matchesIgnoredPattern(value) {
      return ignoredPatterns.some((pattern) => pattern.test(value))
    }

    // Utility types where string unions represent object keys, not values
    const utilityTypesWithKeyUnions = new Set([
      'Pick',
      'Omit',
      'Extract',
      'Exclude',
      'Record',
    ])

    function isInsideUtilityTypeKeyArgument(node) {
      // Check if the union is a type argument to a utility type like Pick or Omit
      let current = node.parent
      while (current) {
        if (
          current.type === 'TSTypeReference' &&
          current.typeName &&
          current.typeName.type === 'Identifier' &&
          utilityTypesWithKeyUnions.has(current.typeName.name) &&
          current.typeArguments &&
          current.typeArguments.params
        ) {
          // The key union is typically the second parameter for Pick/Omit
          const params = current.typeArguments.params
          if (params.length >= 2 && params[1] === node) {
            return true
          }
          // For Record, the first parameter is the key type
          if (current.typeName.name === 'Record' && params[0] === node) {
            return true
          }
        }
        current = current.parent
      }
      return false
    }

    function checkUnionType(node) {
      const types = node.types

      // Skip if union contains null or undefined
      if (types.some(isNullOrUndefined)) return

      // Skip if union is inside a utility type like Pick or Omit (object keys, not values)
      if (isInsideUtilityTypeKeyArgument(node)) return

      // Count string literals
      const stringLiterals = types.filter(isStringLiteral)

      // Only flag if we have enough string literals and ALL types are string literals
      if (stringLiterals.length >= minLiterals && stringLiterals.length === types.length) {
        // Skip if all string literals match an ignored pattern (e.g., icon names)
        const allMatchIgnored = stringLiterals.every((t) =>
          matchesIgnoredPattern(t.literal.value),
        )
        if (allMatchIgnored) return

        const values = stringLiterals
          .map((t) => `'${t.literal.value}'`)
          .join(' | ')

        context.report({
          node,
          messageId: 'preferEnum',
          data: { values },
        })
      }
    }

    return {
      TSUnionType: checkUnionType,
    }
  },
}
