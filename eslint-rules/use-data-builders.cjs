/**
 * @fileoverview Enforce using data builders instead of object literals for domain entities in tests.
 * When a variable is explicitly typed with a domain entity (e.g., `: BlockSession`),
 * it must use the corresponding data builder (e.g., `buildBlockSession()`) instead of an object literal.
 * @author TiedSiren
 */

// Default entities that have data builders
// Format: { TypeName: 'builderFunctionName' }
const DEFAULT_ENTITIES = {
  BlockSession: 'buildBlockSession',
  Blocklist: 'buildBlocklist',
  Device: 'buildDevice',
  Sirens: 'buildSirens',
  AndroidSiren: 'buildAndroidSiren',
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce using data builders instead of object literals for domain entities in tests',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      useDataBuilder:
        'Use {{ builderName }}() instead of an object literal for {{ typeName }}. Data builders ensure complete and valid test data.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          entities: {
            type: 'object',
            additionalProperties: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to test files
    if (!filename.includes('.test.ts') && !filename.includes('.spec.ts'))
      return {}

    // Merge default entities with any user-provided ones
    const options = context.options[0] || {}
    const entities = { ...DEFAULT_ENTITIES, ...options.entities }

    return {
      VariableDeclarator(node) {
        // Check if variable has a type annotation
        if (!node.id.typeAnnotation) return

        // Get the type name from the annotation
        const typeAnnotation = node.id.typeAnnotation.typeAnnotation
        if (!typeAnnotation) return

        let typeName = null

        // Handle direct type reference: `: BlockSession`
        if (
          typeAnnotation.type === 'TSTypeReference' &&
          typeAnnotation.typeName.type === 'Identifier'
        ) {
          typeName = typeAnnotation.typeName.name
        }

        // Handle array type: `: BlockSession[]`
        if (
          typeAnnotation.type === 'TSArrayType' &&
          typeAnnotation.elementType.type === 'TSTypeReference' &&
          typeAnnotation.elementType.typeName.type === 'Identifier'
        ) {
          typeName = typeAnnotation.elementType.typeName.name
        }

        // Check if this type has a data builder
        if (!typeName || !entities[typeName]) return

        const builderName = entities[typeName]

        // Check if the initializer is an object literal
        if (node.init && node.init.type === 'ObjectExpression') {
          context.report({
            node: node.init,
            messageId: 'useDataBuilder',
            data: {
              typeName,
              builderName,
            },
          })
        }

        // Check if the initializer is an array of object literals
        if (node.init && node.init.type === 'ArrayExpression') {
          node.init.elements.forEach((element) => {
            if (element && element.type === 'ObjectExpression') {
              context.report({
                node: element,
                messageId: 'useDataBuilder',
                data: {
                  typeName,
                  builderName,
                },
              })
            }
          })
        }
      },
    }
  },
}
