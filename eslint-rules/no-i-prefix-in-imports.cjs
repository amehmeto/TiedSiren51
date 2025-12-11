/**
 * ESLint rule to forbid I-prefix in import aliases
 *
 * Enforces TypeScript naming convention that forbids Hungarian notation
 * for interfaces, including when importing with an alias.
 *
 * Bad:  import { Foo as IFoo } from './foo'
 * Good: import { Foo } from './foo'
 * Good: import { Foo as FooPort } from './foo'
 */

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Forbid I-prefix in import aliases (TypeScript convention)',
      category: 'Stylistic Issues',
    },
    messages: {
      noIPrefixInImport:
        "Import alias '{{ alias }}' should not use I-prefix. Consider a more descriptive name or import without an alias.",
    },
    schema: [],
  },
  create(context) {
    return {
      ImportSpecifier(node) {
        // Only check when there's an alias (imported !== local)
        if (node.imported.name === node.local.name) return

        const alias = node.local.name
        // Check for I-prefix pattern (I followed by uppercase letter)
        if (/^I[A-Z]/.test(alias)) {
          context.report({
            node: node.local,
            messageId: 'noIPrefixInImport',
            data: { alias },
          })
        }
      },
    }
  },
}
