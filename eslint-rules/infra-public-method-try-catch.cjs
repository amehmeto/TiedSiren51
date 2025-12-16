/**
 * @fileoverview Enforce that public async methods in infra adapters have try-catch wrappers.
 * Public methods are the boundary - they should handle errors.
 * Private methods should throw naturally, letting the public method handle it.
 * @author TiedSiren
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce that public async methods in infra adapters have try-catch wrappers',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    messages: {
      publicMethodNeedsTryCatch:
        'Public async method "{{methodName}}" must have a try-catch wrapper. Public methods are the error boundary - catch errors here, log them, then either rethrow (critical operations) or swallow (fire-and-forget).',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()

    // Only apply to infra/**/*.ts files, excluding tests and fakes
    if (!filename.includes('/infra/')) return {}
    if (filename.includes('.test.ts')) return {}
    if (filename.includes('.spec.ts')) return {}
    // Exclude in-memory/fake implementations (test doubles don't call external services)
    if (filename.includes('in-memory.')) return {}
    if (filename.includes('fake.')) return {}
    if (filename.includes('fake-')) return {}
    if (filename.includes('fake-data.')) return {}
    if (filename.includes('stub.')) return {}

    // Track if we're inside a class
    let currentClass = null

    return {
      ClassDeclaration(node) {
        currentClass = node
      },

      'ClassDeclaration:exit'() {
        currentClass = null
      },

      ClassExpression(node) {
        currentClass = node
      },

      'ClassExpression:exit'() {
        currentClass = null
      },

      MethodDefinition(node) {
        // Only check if we're in a class
        if (!currentClass) return

        // Skip constructors
        if (node.kind === 'constructor') return

        // Skip private methods (they should NOT have try-catch)
        if (isPrivateMethod(node)) return

        // Skip non-async methods (sync methods rarely need try-catch)
        if (!isAsyncMethod(node)) return

        // Skip getters and setters (they're typically simple)
        if (node.kind === 'get' || node.kind === 'set') return

        // Check if the method body contains a try-catch
        const methodBody = node.value?.body
        if (!methodBody || methodBody.type !== 'BlockStatement') return

        const hasTryCatch = containsTryStatement(methodBody.body)

        if (!hasTryCatch) {
          const methodName = getMethodName(node)
          const className = currentClass?.id?.name || 'UnknownClass'
          context.report({
            node,
            messageId: 'publicMethodNeedsTryCatch',
            data: { methodName },
            fix(fixer) {
              return createTryCatchFix(fixer, node, methodBody, methodName, className)
            },
          })
        }
      },
    }

    function isPrivateMethod(node) {
      // TypeScript private keyword
      if (node.accessibility === 'private') return true

      // ESNext private fields (starting with #)
      if (node.key?.type === 'PrivateIdentifier') return true

      // Convention: methods starting with underscore
      const name = getMethodName(node)
      if (name.startsWith('_')) return true

      return false
    }

    function isAsyncMethod(node) {
      return node.value?.async === true
    }

    function getMethodName(node) {
      if (node.key?.type === 'Identifier') {
        return node.key.name
      }
      if (node.key?.type === 'PrivateIdentifier') {
        return `#${node.key.name}`
      }
      return '<anonymous>'
    }

    function containsTryStatement(statements) {
      if (!statements || !Array.isArray(statements)) return false

      for (const stmt of statements) {
        if (stmt.type === 'TryStatement') return true

        // Check inside if/else blocks
        if (stmt.type === 'IfStatement') {
          if (stmt.consequent?.type === 'BlockStatement') {
            if (containsTryStatement(stmt.consequent.body)) return true
          } else if (stmt.consequent?.type === 'TryStatement') {
            return true
          }

          if (stmt.alternate?.type === 'BlockStatement') {
            if (containsTryStatement(stmt.alternate.body)) return true
          } else if (stmt.alternate?.type === 'TryStatement') {
            return true
          } else if (stmt.alternate?.type === 'IfStatement') {
            // Recurse for else-if
            if (containsTryStatement([stmt.alternate])) return true
          }
        }
      }

      return false
    }

    function createTryCatchFix(fixer, node, methodBody, methodName, className) {
      const sourceCode = context.getSourceCode()

      // Get the content inside the method body (between { and })
      const bodyContent = sourceCode.getText(methodBody)

      // Extract the statements inside the braces
      const openBraceIndex = bodyContent.indexOf('{')
      const closeBraceIndex = bodyContent.lastIndexOf('}')
      const innerContent = bodyContent.slice(openBraceIndex + 1, closeBraceIndex)

      // Detect indentation from the method
      const methodText = sourceCode.getText(node)
      const methodStartLine = sourceCode.getLocFromIndex(node.range[0]).line
      const lines = sourceCode.getText().split('\n')
      const methodLine = lines[methodStartLine - 1] || ''
      const baseIndent = methodLine.match(/^(\s*)/)?.[1] || '  '
      const innerIndent = baseIndent + '  '
      const tryIndent = innerIndent + '  '

      // Re-indent the inner content for inside the try block
      const reindentedContent = innerContent
        .split('\n')
        .map((line, index) => {
          // Skip empty lines
          if (line.trim() === '') return line
          // Add extra indentation for try block
          return '  ' + line
        })
        .join('\n')

      // Build the new method body
      const newBody = `{
${innerIndent}try {${reindentedContent}
${innerIndent}} catch (error) {
${tryIndent}this.logger.error(\`[${className}] Failed to ${methodName}: \${error}\`)
${tryIndent}throw error
${innerIndent}}
${baseIndent}}`

      return fixer.replaceText(methodBody, newBody)
    }
  },
}
