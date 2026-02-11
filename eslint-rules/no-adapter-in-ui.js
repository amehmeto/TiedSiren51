/**
 * @fileoverview Prevent direct usage of Redux entity adapters in UI layer
 * @author TiedSiren
 *
 * UI layer (app/, ui/) cannot use adapters - use selectors instead.
 * Core layer can use adapters freely, including cross-domain.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prevent direct usage of Redux entity adapters in UI layer files',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noAdapterInUi:
        'Do not use "{{adapterName}}" directly in UI layer. Use a selector from core/ instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to UI layer files (app/ and ui/ directories)
    const isUiLayer = filename.includes('/app/') || filename.includes('/ui/')
    if (!isUiLayer) return {}

    // Skip test files
    if (filename.includes('.test.') || filename.includes('.spec.')) return {}

    return {
      // Check for imports of adapters
      ImportDeclaration(node) {
        node.specifiers.forEach((specifier) => {
          if (specifier.type !== 'ImportSpecifier') return

          const importedName = specifier.imported.name
          if (importedName.endsWith('Adapter')) {
            context.report({
              node: specifier,
              messageId: 'noAdapterInUi',
              data: { adapterName: importedName },
            })
          }
        })
      },

      // Check for member expressions like someAdapter.getSelectors()
      MemberExpression(node) {
        if (node.object.type !== 'Identifier') return

        const objectName = node.object.name
        if (objectName.endsWith('Adapter')) {
          context.report({
            node,
            messageId: 'noAdapterInUi',
            data: { adapterName: objectName },
          })
        }
      },
    }
  },
}
