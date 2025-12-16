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
  BlockFormData: 'buildValidBlocklistFormData',
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

    // Only apply to test and fixture files
    if (
      !filename.includes('.test.ts') &&
      !filename.includes('.spec.ts') &&
      !filename.includes('.fixture.ts')
    )
      return {}

    // Merge default entities with any user-provided ones
    const options = context.options[0] || {}
    const entities = { ...DEFAULT_ENTITIES, ...options.entities }

    // Track typed variables: { variableName: { typeName, builderName } }
    const typedVariables = new Map()

    /**
     * Extract type name from a type annotation
     */
    function getTypeName(typeAnnotation) {
      if (!typeAnnotation) return null

      // Handle direct type reference: `: BlockSession`
      if (
        typeAnnotation.type === 'TSTypeReference' &&
        typeAnnotation.typeName.type === 'Identifier'
      ) {
        return typeAnnotation.typeName.name
      }

      // Handle array type: `: BlockSession[]`
      if (
        typeAnnotation.type === 'TSArrayType' &&
        typeAnnotation.elementType.type === 'TSTypeReference' &&
        typeAnnotation.elementType.typeName.type === 'Identifier'
      ) {
        return typeAnnotation.elementType.typeName.name
      }

      return null
    }

    /**
     * Report object literal usage for a typed entity
     */
    function reportObjectLiteral(node, typeName, builderName) {
      context.report({
        node,
        messageId: 'useDataBuilder',
        data: {
          typeName,
          builderName,
        },
      })
    }

    /**
     * Check if a node is an object literal or array of object literals
     */
    function checkForObjectLiterals(node, typeName, builderName, isArray) {
      if (!node) return

      if (node.type === 'ObjectExpression') {
        reportObjectLiteral(node, typeName, builderName)
      }

      if (isArray && node.type === 'ArrayExpression') {
        node.elements.forEach((element) => {
          if (element && element.type === 'ObjectExpression') {
            reportObjectLiteral(element, typeName, builderName)
          }
        })
      }
    }

    return {
      // Track variable declarations with type annotations
      VariableDeclarator(node) {
        if (!node.id.typeAnnotation) return

        const typeAnnotation = node.id.typeAnnotation.typeAnnotation
        const typeName = getTypeName(typeAnnotation)

        if (!typeName || !entities[typeName]) return

        const builderName = entities[typeName]
        const varName = node.id.name
        const isArray = typeAnnotation.type === 'TSArrayType'

        // Track this variable for future assignments
        typedVariables.set(varName, { typeName, builderName, isArray })

        // Check the initializer if present
        checkForObjectLiterals(node.init, typeName, builderName, isArray)
      },

      // Check assignments to tracked variables
      AssignmentExpression(node) {
        if (node.left.type !== 'Identifier') return

        const varName = node.left.name
        const trackedVar = typedVariables.get(varName)

        if (!trackedVar) return

        checkForObjectLiterals(
          node.right,
          trackedVar.typeName,
          trackedVar.builderName,
          trackedVar.isArray,
        )
      },
    }
  },
}
