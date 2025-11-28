/**
 * @fileoverview Enforce test files in core directories to be named after what they test
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce test files in selectors/usecases/listeners directories to follow naming conventions',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      badSelectorTestName:
        'Selector test files must be named "select*.test.ts" or "*.view-model.test.ts". Rename or split this file.',
      badUsecaseTestName:
        'Usecase test files must be named "*.usecase.test.ts" (one test file per usecase). Rename or split this file.',
      badListenerTestName:
        'Listener test files must be named "*.listener.test.ts" (one test file per listener). Rename or split this file.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()
    const isTestFile =
      filename.endsWith('.test.ts') || filename.endsWith('.spec.ts')

    if (!isTestFile) return {}

    const basename = filename.split('/').pop()

    return {
      Program(node) {
        // Selector test files must start with "select" or end with ".view-model.test.ts"
        if (
          filename.includes('/selectors/') &&
          !basename.startsWith('select') &&
          !basename.includes('.view-model.')
        ) {
          context.report({ node, messageId: 'badSelectorTestName' })
        }

        // Usecase test files must end with ".usecase.test.ts"
        if (
          filename.includes('/usecases/') &&
          !basename.includes('.usecase.')
        ) {
          context.report({ node, messageId: 'badUsecaseTestName' })
        }

        // Listener test files must end with ".listener.test.ts"
        if (
          filename.includes('/listeners/') &&
          !basename.includes('.listener.')
        ) {
          context.report({ node, messageId: 'badListenerTestName' })
        }
      },
    }
  },
}
