/**
 * @fileoverview Enforce that functions with try-catch follow Clean Code principles:
 * - If 'try' exists in a function, it should be the first statement
 * - Nothing should come after the catch/finally blocks
 * - Multiple try-catch blocks should be extracted into separate functions
 * @author TiedSiren
 * @see https://stackoverflow.com/questions/17337860/is-it-bad-practice-to-have-multiple-try-catch-blocks-in-succession
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce try-catch isolation: try should be first, nothing after catch, no multiple try-catch blocks',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      multipleTryCatch:
        'Multiple try-catch blocks in one function. Extract each try-catch into its own function for better readability and single responsibility.',
      tryNotFirst:
        "If 'try' exists in a function, it should be the very first statement. Extract preceding logic into a separate function or move it after the try-catch.",
      codeAfterCatch:
        'Nothing should come after catch/finally blocks. Extract following logic into a separate function or return from catch.',
    },
    schema: [],
  },

  create(context) {
    // Collect all try statements at any nesting level within a function
    function collectTryStatements(statements, collected = []) {
      for (const stmt of statements) {
        if (stmt.type === 'TryStatement') {
          collected.push(stmt)
        }

        // Recurse into if/else blocks
        if (stmt.type === 'IfStatement') {
          if (stmt.consequent?.type === 'BlockStatement') {
            collectTryStatements(stmt.consequent.body, collected)
          } else if (stmt.consequent?.type === 'TryStatement') {
            collected.push(stmt.consequent)
          }

          if (stmt.alternate?.type === 'BlockStatement') {
            collectTryStatements(stmt.alternate.body, collected)
          } else if (stmt.alternate?.type === 'TryStatement') {
            collected.push(stmt.alternate)
          } else if (stmt.alternate?.type === 'IfStatement') {
            // Handle else-if chains
            collectTryStatements([stmt.alternate], collected)
          }
        }
      }
      return collected
    }

    // Check a block of statements for try-catch violations
    function checkBlockStatements(statements, reportNode) {
      if (!statements || statements.length === 0) return

      // Find all try statements at this level only (not nested)
      const tryStatementsAtThisLevel = statements.filter(
        (stmt) => stmt.type === 'TryStatement',
      )

      // Rule 1: No multiple try-catch blocks at the same level
      if (tryStatementsAtThisLevel.length > 1) {
        context.report({
          node: reportNode,
          messageId: 'multipleTryCatch',
        })
        return // If there are multiple, don't check other rules for this block
      }

      if (tryStatementsAtThisLevel.length === 0) return

      const tryIndex = statements.findIndex(
        (stmt) => stmt.type === 'TryStatement',
      )
      const tryStatement = statements[tryIndex]

      // Rule 2: Try should be the first statement (strict enforcement)
      if (tryIndex > 0) {
        context.report({
          node: tryStatement,
          messageId: 'tryNotFirst',
        })
      }

      // Rule 3: Nothing should come after catch/finally
      const statementsAfterTry = statements.slice(tryIndex + 1)
      if (statementsAfterTry.length > 0) {
        // Allow only return statements after try-catch
        const hasNonReturnAfterTry = statementsAfterTry.some(
          (stmt) => stmt.type !== 'ReturnStatement',
        )

        if (hasNonReturnAfterTry) {
          context.report({
            node: statementsAfterTry[0],
            messageId: 'codeAfterCatch',
          })
        }
      }
    }

    function checkFunctionBody(node, body) {
      if (!body || body.type !== 'BlockStatement') return

      const statements = body.body
      if (statements.length === 0) return

      // Collect ALL try statements in this function (including nested)
      const allTryStatements = collectTryStatements(statements)

      // Rule 1 (global): No multiple try-catch blocks anywhere in function
      if (allTryStatements.length > 1) {
        context.report({
          node,
          messageId: 'multipleTryCatch',
        })
        return // Don't check other rules if multiple try-catch
      }

      // Check top-level statements for rules 2 and 3
      checkBlockStatements(statements, node)

      // Also check inside if/else blocks for rules 2 and 3
      for (const stmt of statements) {
        if (stmt.type === 'IfStatement') {
          if (stmt.consequent?.type === 'BlockStatement') {
            checkBlockStatements(stmt.consequent.body, stmt.consequent)
          }

          if (stmt.alternate?.type === 'BlockStatement') {
            checkBlockStatements(stmt.alternate.body, stmt.alternate)
          } else if (stmt.alternate?.type === 'IfStatement') {
            // Handle else-if: check the consequent of the else-if
            if (stmt.alternate.consequent?.type === 'BlockStatement') {
              checkBlockStatements(
                stmt.alternate.consequent.body,
                stmt.alternate.consequent,
              )
            }
          }
        }
      }
    }

    return {
      FunctionDeclaration(node) {
        checkFunctionBody(node, node.body)
      },

      FunctionExpression(node) {
        checkFunctionBody(node, node.body)
      },

      ArrowFunctionExpression(node) {
        checkFunctionBody(node, node.body)
      },

      MethodDefinition(node) {
        if (node.value && node.value.body) {
          checkFunctionBody(node, node.value.body)
        }
      },
    }
  },
}
