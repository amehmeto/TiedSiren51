/**
 * @fileoverview Require extracting inline object type literals into named type aliases
 * @author TiedSiren
 *
 * Flags inline object type literals used in type parameter positions, function
 * parameter types, return types, and variable type annotations. These should be
 * extracted into named type aliases for readability.
 *
 * BAD:
 *   it.each<{ email: string; password: string }>([...])
 *   function foo(param: { name: string; age: number }) {}
 *
 * GOOD:
 *   type Credentials = { email: string; password: string }
 *   it.each<Credentials>([...])
 *   type Person = { name: string; age: number }
 *   function foo(param: Person) {}
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require extracting inline object type literals into named type aliases',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      extractObjectType:
        'Extract this inline object type into a named type alias for readability.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          minProperties: {
            type: 'integer',
            description:
              'Minimum number of properties before requiring extraction (default: 2)',
            default: 2,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {}
    const minProperties = options.minProperties ?? 2

    return {
      TSTypeLiteral(node) {
        if (node.members.length < minProperties) return

        // Skip if already inside a type alias declaration (the definition itself)
        if (isInsideTypeAliasDeclaration(node)) return

        context.report({
          node,
          messageId: 'extractObjectType',
        })
      },
    }

    function isInsideTypeAliasDeclaration(node) {
      let current = node.parent

      while (current) {
        // Inside a type alias or interface definition
        if (
          current.type === 'TSTypeAliasDeclaration' ||
          current.type === 'TSInterfaceDeclaration'
        )
          return true

        // Stop climbing if we hit a type parameter or function param
        // (these are the locations we want to flag)
        if (
          current.type === 'TSTypeParameterInstantiation' ||
          current.type === 'TSTypeAnnotation'
        )
          return false

        current = current.parent
      }

      return false
    }
  },
}
