/**
 * @fileoverview Require object shorthand syntax where possible.
 * Replaces ESLint's object-shorthand rule for OxLint.
 * @author TiedSiren
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require shorthand syntax for object properties and methods',
      category: 'ECMAScript 6',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      useShorthand: 'Expected shorthand for property "{{ name }}".',
      useMethodShorthand: 'Expected method shorthand for "{{ name }}".',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    return {
      Property(node) {
        // Skip computed properties
        if (node.computed) return
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
          node.kind === 'init'
        )
          context.report({
            node,
            messageId: 'useMethodShorthand',
            data: { name: key.name },
            fix(fixer) {
              try {
                const keyText = sourceCode.getText(key)
                const func = value
                const paramsText =
                  func.params.length > 0
                    ? sourceCode
                        .getText()
                        .slice(
                          func.params[0].range[0],
                          func.params[func.params.length - 1].range[1],
                        )
                    : ''
                const bodyText = sourceCode.getText(func.body)
                const asyncPrefix = func.async ? 'async ' : ''
                return fixer.replaceText(
                  node,
                  `${asyncPrefix}${keyText}(${paramsText}) ${bodyText}`,
                )
              } catch {
                // OxLint AST may lack range — skip fix, keep diagnostic
                return null
              }
            },
          })
      },
    }
  },
}
