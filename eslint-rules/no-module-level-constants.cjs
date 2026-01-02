/**
 * @fileoverview Forbid module-level constants between imports and exports.
 * Constants should either be:
 * - Inside the class/function that uses them (as static/private properties)
 * - In a dedicated constants file
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid module-level constants between imports and exports. Move them inside the class or to a dedicated constants file.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noModuleLevelConstant:
        'Module-level constant "{{ name }}" should be moved inside the class (as static/private property) or to a dedicated constants file.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Allow in test files - they often need setup constants
    if (
      filename.includes('.test.ts') ||
      filename.includes('.test.tsx') ||
      filename.includes('.spec.ts') ||
      filename.includes('.spec.tsx')
    ) {
      return {}
    }

    // Allow in fixture files
    if (
      filename.includes('.fixture.ts') ||
      filename.includes('.fixture.tsx')
    ) {
      return {}
    }

    // Allow in dedicated constants files
    if (
      filename.includes('.constants.ts') ||
      filename.includes('/constants.ts') ||
      filename.includes('/constants/')
    ) {
      return {}
    }

    // Allow in __constants__ directory
    if (filename.includes('__constants__')) {
      return {}
    }

    // Allow in config files
    if (
      filename.toLowerCase().includes('config.ts') ||
      filename.toLowerCase().includes('config.tsx')
    ) {
      return {}
    }

    // Allow in data builder files - they need default values
    if (filename.includes('.builder.ts') || filename.includes('.builder.tsx')) {
      return {}
    }

    // Allow in _tests_ directory - test utilities
    if (filename.includes('/_tests_/') || filename.includes('\\_tests_\\')) {
      return {}
    }

    // Allow in slice files - Redux pattern
    if (filename.includes('.slice.ts') || filename.includes('.slice.tsx')) {
      return {}
    }

    // Allow in dependencies files - DI containers
    if (filename.includes('dependencies.ts')) {
      return {}
    }

    // Allow in schema files - Zod schemas
    if (filename.includes('.schema.ts') || filename.includes('.schema.tsx')) {
      return {}
    }

    // Allow in view-model files - they often have helper functions
    if (
      filename.includes('.view-model.ts') ||
      filename.includes('.view-model.tsx')
    ) {
      return {}
    }

    // Allow in utils files - utility functions
    if (filename.includes('.utils.ts') || filename.includes('/utils/')) {
      return {}
    }

    // Allow in selector files - pure functions with helpers
    if (filename.includes('/selectors/')) {
      return {}
    }

    // Allow in React component files - common pattern for constants
    if (filename.endsWith('.tsx')) {
      return {}
    }

    // Allow in scripts directory - standalone scripts
    if (filename.includes('/scripts/')) {
      return {}
    }

    // Allow in JS files - typically standalone scripts or config
    if (filename.endsWith('.js') || filename.endsWith('.cjs') || filename.endsWith('.mjs')) {
      return {}
    }

    return {
      VariableDeclaration(node) {
        // Only check module-level declarations (parent is Program)
        if (node.parent.type !== 'Program') {
          return
        }

        // Only check const/let declarations (not var, though var is rare)
        if (node.kind !== 'const' && node.kind !== 'let') {
          return
        }

        // Report each declared variable
        node.declarations.forEach((declaration) => {
          if (declaration.id.type === 'Identifier') {
            const name = declaration.id.name

            // Allow 'styles' - React Native StyleSheet pattern
            if (name === 'styles') {
              return
            }

            context.report({
              node: declaration,
              messageId: 'noModuleLevelConstant',
              data: {
                name,
              },
            })
          } else if (declaration.id.type === 'ObjectPattern') {
            // Handle destructuring: const { a, b } = ...
            declaration.id.properties.forEach((prop) => {
              if (prop.type === 'Property' && prop.value.type === 'Identifier') {
                context.report({
                  node: prop,
                  messageId: 'noModuleLevelConstant',
                  data: {
                    name: prop.value.name,
                  },
                })
              }
            })
          } else if (declaration.id.type === 'ArrayPattern') {
            // Handle array destructuring: const [a, b] = ...
            declaration.id.elements.forEach((element) => {
              if (element && element.type === 'Identifier') {
                context.report({
                  node: element,
                  messageId: 'noModuleLevelConstant',
                  data: {
                    name: element.name,
                  },
                })
              }
            })
          }
        })
      },
    }
  },
}
