/**
 * @fileoverview Disallow using string literals that match enum values defined in the same file
 *
 * When an enum like `enum FormMode { Edit = 'edit' }` exists in the file,
 * comparisons like `mode === 'edit'` should use `mode === FormMode.Edit`.
 *
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow string literals in comparisons when an enum with that value exists in the same file',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      useEnumValue:
        "Use '{{enumName}}.{{memberName}}' instead of string literal '{{value}}'.",
    },
    schema: [],
  },

  create(context) {
    // Map<stringValue, { enumName, memberName }>
    const enumValues = new Map()
    // Collect string literal comparisons to check at Program:exit
    const stringLiteralComparisons = []

    return {
      TSEnumDeclaration(node) {
        const enumName = node.id.name

        if (!Array.isArray(node.members)) return
        for (const member of node.members) {
          if (!member.initializer) continue
          if (
            member.initializer.type !== 'Literal' ||
            typeof member.initializer.value !== 'string'
          )
            continue

          const memberName =
            member.id.type === 'Identifier'
              ? member.id.name
              : String(member.id.value)

          enumValues.set(member.initializer.value, { enumName, memberName })
        }
      },

      BinaryExpression(node) {
        if (node.operator !== '===' && node.operator !== '!==') return

        const candidates = []
        if (
          node.left.type === 'Literal' &&
          typeof node.left.value === 'string'
        )
          candidates.push(node.left)

        if (
          node.right.type === 'Literal' &&
          typeof node.right.value === 'string'
        )
          candidates.push(node.right)

        for (const literal of candidates) {
          stringLiteralComparisons.push(literal)
        }
      },

      'Program:exit'() {
        for (const literal of stringLiteralComparisons) {
          const enumEntry = enumValues.get(literal.value)
          if (!enumEntry) continue

          context.report({
            node: literal,
            messageId: 'useEnumValue',
            data: {
              enumName: enumEntry.enumName,
              memberName: enumEntry.memberName,
              value: literal.value,
            },
          })
        }
      },
    }
  },
}
