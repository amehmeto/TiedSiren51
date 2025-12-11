/**
 * @fileoverview Forbid class instantiation inside it/test blocks.
 * Dependencies should be instantiated in beforeEach for consistent test structure:
 * - beforeEach: setup (all instantiations)
 * - it/test: act + assert only
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbid class instantiation (new ClassName()) inside it/test blocks. Use beforeEach for setup.',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      noNewInTestBody:
        'Move "new {{ className }}()" to beforeEach. Test bodies should only contain act and assert, not setup.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to test files
    if (!filename.includes('.test.ts') && !filename.includes('.spec.ts'))
      return {}

    let insideItBlock = false

    return {
      CallExpression(node) {
        // Detect entering it() or test() blocks
        if (
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'it' || node.callee.name === 'test')
        ) {
          insideItBlock = true
        }
      },

      'CallExpression:exit'(node) {
        // Detect exiting it() or test() blocks
        if (
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'it' || node.callee.name === 'test')
        ) {
          insideItBlock = false
        }
      },

      NewExpression(node) {
        if (!insideItBlock) return

        // Get the class name being instantiated
        let className = 'Unknown'
        if (node.callee.type === 'Identifier') {
          className = node.callee.name
        } else if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier'
        ) {
          className = node.callee.property.name
        }

        // Allow primitive value objects, common built-ins, and error classes
        const allowedClasses = [
          'Date',
          'Error',
          'Map',
          'Set',
          'WeakMap',
          'WeakSet',
          'RegExp',
          'URL',
          'URLSearchParams',
        ]
        // Also allow any class ending with 'Error' (custom error classes)
        if (className.endsWith('Error')) return
        if (allowedClasses.includes(className)) return

        context.report({
          node,
          messageId: 'noNewInTestBody',
          data: { className },
        })
      },
    }
  },
}
