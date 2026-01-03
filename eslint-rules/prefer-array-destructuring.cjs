/**
 * @fileoverview Prefer array destructuring over index access for first element
 * Use `const [first] = array` instead of `const first = array[0]`
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer array destructuring over index access with literal index',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferDestructuring:
        'Use array destructuring `const [{{name}}] = {{array}}` instead of index access.',
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'MemberExpression' &&
          node.init.property.type === 'Literal' &&
          typeof node.init.property.value === 'number' &&
          node.init.property.value === 0 &&
          node.init.computed === true &&
          node.id.type === 'Identifier'
        ) {
          const sourceCode = context.getSourceCode()
          const arrayName = sourceCode.getText(node.init.object)
          const varName = node.id.name

          context.report({
            node,
            messageId: 'preferDestructuring',
            data: {
              name: varName,
              array: arrayName,
            },
            fix(fixer) {
              return fixer.replaceText(node, `[${varName}] = ${arrayName}`)
            },
          })
        }
      },
    }
  },
}
