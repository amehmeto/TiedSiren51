/**
 * @fileoverview Disallow "And" or "Or" as word boundaries in identifier names
 *
 * Names containing "And" or "Or" at word boundaries (camelCase/PascalCase) often
 * indicate multiple responsibilities. The identifier should either be split into
 * separate abstractions or renamed to capture the single concept.
 *
 * @author TiedSiren
 */

const andPattern = /[a-z0-9]And[A-Z]/
const orPattern = /[a-z0-9]Or[A-Z]/

function checkName(context, node, name) {
  if (!name) return

  if (andPattern.test(name))
    context.report({
      node,
      messageId: 'noAndOrInNames',
      data: { name, conjunction: 'And' },
    })

  if (orPattern.test(name))
    context.report({
      node,
      messageId: 'noAndOrInNames',
      data: { name, conjunction: 'Or' },
    })
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow "And" or "Or" as word boundaries in declaration names',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      noAndOrInNames:
        "Identifier '{{name}}' contains '{{conjunction}}' which may indicate multiple responsibilities. Consider extracting into separate abstractions or finding a name that captures the single concept.",
    },
    schema: [],
  },

  create(context) {
    return {
      VariableDeclarator(node) {
        checkName(context, node.id, node.id.name)
      },

      FunctionDeclaration(node) {
        if (node.id) checkName(context, node.id, node.id.name)
      },

      ClassDeclaration(node) {
        if (node.id) checkName(context, node.id, node.id.name)
      },

      TSTypeAliasDeclaration(node) {
        checkName(context, node.id, node.id.name)
      },

      TSInterfaceDeclaration(node) {
        checkName(context, node.id, node.id.name)
      },

      TSEnumDeclaration(node) {
        checkName(context, node.id, node.id.name)
      },
    }
  },
}
