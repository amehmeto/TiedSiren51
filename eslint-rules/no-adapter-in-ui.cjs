/**
 * @fileoverview Prevent direct usage of Redux entity adapters in UI layer (app/, ui/)
 * @author TiedSiren
 *
 * Adapters should only be used in core/selectors. UI components should use
 * pre-built selectors to access entity state.
 */

module.exports = {
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
        'Do not use "{{adapterName}}" directly in UI layer. Create a selector in core/{{domain}}/selectors/ instead.',
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
        const source = node.source.value

        // Check if importing from a file that likely exports an adapter
        if (!source.includes('blocklist') && !source.includes('block-session'))
          return

        node.specifiers.forEach((specifier) => {
          if (specifier.type !== 'ImportSpecifier') return

          const importedName = specifier.imported.name
          if (importedName.endsWith('Adapter')) {
            // Extract domain from adapter name (e.g., blocklistAdapter -> blocklist)
            const domain = importedName.replace('Adapter', '')

            context.report({
              node: specifier,
              messageId: 'noAdapterInUi',
              data: {
                adapterName: importedName,
                domain,
              },
            })
          }
        })
      },

      // Check for member expressions like someAdapter.getSelectors()
      MemberExpression(node) {
        if (node.object.type !== 'Identifier') return

        const objectName = node.object.name
        if (objectName.endsWith('Adapter')) {
          const domain = objectName.replace('Adapter', '')

          context.report({
            node,
            messageId: 'noAdapterInUi',
            data: {
              adapterName: objectName,
              domain,
            },
          })
        }
      },
    }
  },
}
