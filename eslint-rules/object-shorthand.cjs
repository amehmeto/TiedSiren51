/**
 * @fileoverview Require object shorthand syntax where possible.
 * Replaces ESLint's object-shorthand rule for OxLint.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require shorthand syntax for object properties and methods',
      category: 'ECMAScript 6',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      useShorthand:
        'Expected shorthand for property "{{ name }}".',
      useMethodShorthand:
        'Expected method shorthand for "{{ name }}".',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      Property(node) {
        // Skip computed properties
        if (node.computed) return
        // Skip spread elements
        if (node.type === 'SpreadElement') return
        // Already shorthand
        if (node.shorthand) return
        if (node.method) return

        const key = node.key
        const value = node.value

        // Property shorthand: { foo: foo } -> { foo }
        if (
          key.type === 'Identifier' &&
          value.type === 'Identifier' &&
          key.name === value.name
        )
          context.report({
            node,
            messageId: 'useShorthand',
            data: { name: key.name },
            fix(fixer) {
              return fixer.replaceText(node, sourceCode.getText(key))
            },
          })

        // Method shorthand: { foo: function() {} } -> { foo() {} }
        if (
          key.type === 'Identifier' &&
          value.type === 'FunctionExpression' &&
          !value.generator &&
          !node.kind
        )
          context.report({
            node,
            messageId: 'useMethodShorthand',
            data: { name: key.name },
          })
      },
    }
  },
}
