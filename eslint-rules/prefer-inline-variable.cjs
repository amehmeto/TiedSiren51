/**
 * @fileoverview Prefer inlining variables that are only used once immediately after declaration
 * Similar to JetBrains "Inline variable" inspection
 *
 * Does NOT suggest inlining when it would create:
 * - A nested method call (e.g., foo(bar()))
 * - A chained access pattern (e.g., foo().bar() or foo().length)
 * - A complex operator expression (more than 3 terms)
 * - A multi-line initialization (hurts readability)
 *
 * @author TiedSiren
 * @see https://intellij-support.jetbrains.com/hc/en-us/community/posts/206942015
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer inlining variables that are only used once immediately after declaration',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code',
    messages: {
      preferInline:
        'Variable `{{name}}` is only used once. Inline it directly.',
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode()

    function isImmediatelyFollowingStatement(declNode, usageNode) {
      const parent = declNode.parent
      if (parent.type !== 'BlockStatement' && parent.type !== 'Program')
        return false

      const statements = parent.body
      const declIndex = statements.indexOf(declNode)
      if (declIndex === -1) return false

      for (let i = declIndex + 1; i < statements.length; i++) {
        const stmt = statements[i]
        if (isNodeContainedIn(usageNode, stmt)) return i === declIndex + 1
      }
      return false
    }

    function isNodeContainedIn(node, container) {
      let current = node
      while (current) {
        if (current === container) return true
        current = current.parent
      }
      return false
    }

    function getReferences(decl) {
      // Use sourceCode.getDeclaredVariables to get references across the entire scope
      const variables = sourceCode.getDeclaredVariables
        ? sourceCode.getDeclaredVariables(decl)
        : context.getDeclaredVariables(decl)
      if (variables.length === 0) return []
      const variable = variables[0]
      return variable.references.filter((ref) => !ref.init)
    }

    function hasTypeAnnotation(node) {
      return node.id && node.id.typeAnnotation
    }

    /**
     * Check if a variable name is descriptive (provides semantic meaning)
     * Returns true for names like: field, minWidth, errorMessage, userId
     * Returns false for: val, tmp, res, x, y
     */
    function isDescriptiveName(varName) {
      // Short names (1-2 chars) like x, y, i, n are not descriptive
      if (varName.length <= 2) return false

      // Common non-descriptive names that can be inlined
      const nonDescriptiveNames = new Set([
        'val',
        'value',
        'tmp',
        'temp',
        'num',
        'str',
        'res',
        'ret',
        'result',
        'arr',
        'obj',
        'idx',
        'len',
        'item',
        'data',
        'el',
        'elem',
        'element',
      ])
      if (nonDescriptiveNames.has(varName.toLowerCase())) return false

      return true
    }

    /**
     * Check if the variable name provides semantic meaning for a literal value
     * e.g., `const minWidth = 160` - "minWidth" explains what 160 means
     * JetBrains doesn't inline these because the name adds value
     */
    function isDescriptiveNameForLiteral(varName, initNode) {
      // Only applies to primitive literals
      if (initNode.type !== 'Literal') return false
      if (initNode.value === null) return false

      return isDescriptiveName(varName)
    }

    /**
     * Check if a descriptive variable name labels a method call result with DIFFERENT semantics
     * e.g., `const field = error.path.join('.')` - "field" explains what the join produces
     * But `const schedule = getSchedule()` - "schedule" is redundant with function name
     *
     * Only skip inlining when variable name differs from the function/method name
     */
    function isDescriptiveNameForCallResult(varName, initNode) {
      if (initNode.type !== 'CallExpression') return false
      if (!isDescriptiveName(varName)) return false

      // Extract the function/method name from the call
      let funcName = null
      if (initNode.callee.type === 'Identifier') {
        funcName = initNode.callee.name
      } else if (initNode.callee.type === 'MemberExpression') {
        if (initNode.callee.property.type === 'Identifier') {
          funcName = initNode.callee.property.name
        }
      }

      if (!funcName) return true // Can't determine, be conservative

      // Normalize: remove common prefixes (get, set, create, build, fetch, load)
      const prefixes = ['get', 'set', 'create', 'build', 'fetch', 'load', 'find', 'select']
      let normalizedFunc = funcName
      for (const prefix of prefixes) {
        if (funcName.toLowerCase().startsWith(prefix)) {
          normalizedFunc = funcName.slice(prefix.length)
          break
        }
      }

      // If variable name matches the (normalized) function name, it's redundant - allow inlining
      if (varName.toLowerCase() === normalizedFunc.toLowerCase()) return false
      if (varName.toLowerCase() === funcName.toLowerCase()) return false

      // Variable name differs from function name - it adds semantic value, don't inline
      return true
    }

    /**
     * Check if the initialization spans multiple lines
     * Multi-line inits should not be inlined as it hurts readability
     */
    function isMultiLineInit(node) {
      if (!node.init) return false
      const startLine = node.init.loc.start.line
      const endLine = node.init.loc.end.line
      return endLine > startLine
    }

    function isSimpleInit(node) {
      if (!node.init) return false
      const type = node.init.type
      return [
        'CallExpression',
        'Identifier',
        'MemberExpression',
        'ArrayExpression',
        'ObjectExpression',
        'Literal',
        'TemplateLiteral',
      ].includes(type)
    }

    /**
     * Check if inlining would create a nested method call
     * e.g., foo(bar()) or arr.push(getValue())
     * Also catches: foo({ prop: [bar()] })
     */
    function wouldCreateNestedCall(usageNode, initNode) {
      if (initNode.type !== 'CallExpression') return false

      // Walk up the tree to see if we're ultimately inside a CallExpression argument
      let current = usageNode.parent
      while (current) {
        // Direct argument to a call
        if (current.type === 'CallExpression' && current.callee !== usageNode) {
          return true
        }

        // Stop at statement level
        if (
          current.type === 'ExpressionStatement' ||
          current.type === 'VariableDeclaration' ||
          current.type === 'ReturnStatement'
        ) {
          // Check if this statement is a call expression or contains one at root
          if (current.type === 'ExpressionStatement') {
            if (current.expression.type === 'CallExpression') {
              return true
            }
          }
          if (current.type === 'VariableDeclaration') {
            const decl = current.declarations[0]
            if (decl && decl.init && decl.init.type === 'CallExpression') {
              return true
            }
          }
          break
        }

        current = current.parent
      }

      return false
    }

    /**
     * Check if inlining would create a chained access pattern
     * e.g., getValue().toString() or getValue().length
     * Property access after a call (foo().prop) is as hard to read as chained calls
     */
    function wouldCreateChainedAccess(usageNode, initNode) {
      if (initNode.type !== 'CallExpression') return false

      const parent = usageNode.parent
      if (!parent) return false

      // Usage is the object of a member expression (property or method access)
      if (parent.type === 'MemberExpression' && parent.object === usageNode) {
        return true
      }

      return false
    }

    /**
     * Check if the usage is deeply nested in JSX (more than 1 level from return)
     * with sibling elements before it at any level. In such cases, the variable
     * serves as documentation for what the expression represents.
     *
     * e.g., Don't inline:
     *   const selectedItems = selectItemsFrom(...)
     *   return (
     *     <>
     *       <Text>{label}</Text>
     *       <Text>{selectedItems}</Text>  // nested with siblings before
     *     </>
     *   )
     *
     * But DO inline:
     *   const items = getItems()
     *   return <List data={items} />  // direct prop, no nesting
     */
    function isDeeplyNestedInJsxWithSiblings(usageNode) {
      let current = usageNode.parent
      let jsxDepth = 0
      let hasSiblingsBefore = false

      while (current) {
        // Check for sibling JSXElements at each level
        if (current.type === 'JSXElement' || current.type === 'JSXFragment') {
          jsxDepth++

          // Check if this element has sibling elements before it
          const parent = current.parent
          if (parent && (parent.type === 'JSXElement' || parent.type === 'JSXFragment')) {
            const children = parent.children || []
            const currentIndex = children.indexOf(current)
            // Check for meaningful siblings before this element
            const meaningfulSiblingsBefore = children
              .slice(0, currentIndex)
              .some(
                (child) =>
                  child.type === 'JSXElement' ||
                  (child.type === 'JSXExpressionContainer' &&
                    child.expression.type !== 'JSXEmptyExpression'),
              )
            if (meaningfulSiblingsBefore) hasSiblingsBefore = true
          }
        }

        if (current.type === 'ReturnStatement') {
          // If we're nested 2+ levels deep in JSX AND have siblings before, don't inline
          return jsxDepth >= 2 && hasSiblingsBefore
        }

        current = current.parent
      }

      return false
    }

    /**
     * Check if inlining would create a complex expression (>3 terms)
     */
    function wouldCreateComplexExpression(usageNode, initNode) {
      if (
        initNode.type !== 'BinaryExpression' &&
        initNode.type !== 'LogicalExpression'
      ) {
        return false
      }

      const parent = usageNode.parent
      if (
        parent &&
        (parent.type === 'BinaryExpression' ||
          parent.type === 'LogicalExpression')
      ) {
        // Already in an expression, adding more terms would be complex
        return true
      }

      return false
    }

    return {
      VariableDeclaration(node) {
        if (node.declarations.length !== 1) return

        const decl = node.declarations[0]

        if (decl.id.type !== 'Identifier') return
        if (!decl.init) return
        if (hasTypeAnnotation(decl)) return
        if (isMultiLineInit(decl)) return
        if (!isSimpleInit(decl)) return

        const varName = decl.id.name
        const references = getReferences(node)

        if (references.length !== 1) return

        // Don't inline descriptive names for literals (magic numbers/strings)
        if (isDescriptiveNameForLiteral(varName, decl.init)) return

        // Don't inline descriptive names for call results (semantic labeling)
        if (isDescriptiveNameForCallResult(varName, decl.init)) return

        const usage = references[0]

        if (!isImmediatelyFollowingStatement(node, usage.identifier)) return

        if (isInLoop(usage.identifier, node)) return

        // JetBrains-style heuristics: don't inline if it would create complexity
        if (wouldCreateNestedCall(usage.identifier, decl.init)) return
        if (wouldCreateChainedAccess(usage.identifier, decl.init)) return
        if (wouldCreateComplexExpression(usage.identifier, decl.init)) return

        // Don't inline into expect() calls - conflicts with expect-separate-act-assert
        if (isInsideExpectCall(usage.identifier)) return

        // Don't inline when deeply nested in JSX with siblings - variable documents the value
        if (isDeeplyNestedInJsxWithSiblings(usage.identifier)) return

        context.report({
          node: decl,
          messageId: 'preferInline',
          data: { name: varName },
          fix(fixer) {
            const initText = sourceCode.getText(decl.init)
            const fixes = []

            const needsParens = mightNeedParentheses(usage.identifier, decl.init)
            const replacement = needsParens ? `(${initText})` : initText

            fixes.push(fixer.replaceText(usage.identifier, replacement))
            fixes.push(fixer.remove(node))

            return fixes
          },
        })
      },
    }

    function isInsideExpectCall(node) {
      let current = node.parent
      while (current) {
        if (
          current.type === 'CallExpression' &&
          current.callee.type === 'Identifier' &&
          current.callee.name === 'expect'
        ) {
          return true
        }
        if (
          current.type === 'ExpressionStatement' ||
          current.type === 'VariableDeclaration'
        ) {
          break
        }
        current = current.parent
      }
      return false
    }

    function isInLoop(node, declNode) {
      let current = node.parent
      while (current) {
        if (current === declNode.parent) return false

        if (
          [
            'ForStatement',
            'ForInStatement',
            'ForOfStatement',
            'WhileStatement',
            'DoWhileStatement',
          ].includes(current.type)
        ) {
          return true
        }
        current = current.parent
      }
      return false
    }

    function mightNeedParentheses(usageNode, initNode) {
      const parent = usageNode.parent
      if (!parent) return false

      if (
        ['Identifier', 'Literal', 'CallExpression', 'MemberExpression'].includes(
          initNode.type,
        )
      ) {
        return false
      }

      if (
        ['BinaryExpression', 'LogicalExpression', 'ConditionalExpression'].includes(
          initNode.type,
        )
      ) {
        return true
      }

      return false
    }
  },
}
