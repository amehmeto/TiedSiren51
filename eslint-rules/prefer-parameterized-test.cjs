/**
 * @fileoverview Suggest using test.each when multiple tests share identical structure.
 * @author TiedSiren
 *
 * Detects sibling test() / it() calls inside a describe() block that have the
 * same AST shape (identical structure) differing only in literal values, and
 * suggests converting them to a single parameterized test.each call.
 *
 * BAD (3+ structurally identical tests):
 *   test('should return Gmail for gmail.com', () => {
 *     const provider = getEmailProvider('user@gmail.com')
 *     expect(provider?.name).toBe('Gmail')
 *   })
 *   test('should return Outlook for outlook.com', () => {
 *     const provider = getEmailProvider('user@outlook.com')
 *     expect(provider?.name).toBe('Outlook')
 *   })
 *   test('should return Yahoo Mail for yahoo.com', () => {
 *     const provider = getEmailProvider('user@yahoo.com')
 *     expect(provider?.name).toBe('Yahoo Mail')
 *   })
 *
 * GOOD:
 *   test.each<[string, string]>([
 *     ['user@gmail.com', 'Gmail'],
 *     ['user@outlook.com', 'Outlook'],
 *     ['user@yahoo.com', 'Yahoo Mail'],
 *   ])('should return %s for %s', (email, expectedName) => {
 *     const provider = getEmailProvider(email)
 *     expect(provider?.name).toBe(expectedName)
 *   })
 */

const MIN_DUPLICATE_THRESHOLD = 3

const AST_METADATA_KEYS = new Set([
  'start',
  'end',
  'loc',
  'range',
  'parent',
  'raw',
])

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Suggest using test.each when multiple tests share identical structure',
      category: 'Best Practices',
      recommended: false,
    },
    messages: {
      preferParameterized:
        '{{ count }} tests in this describe block share identical structure. Consider using test.each to parameterize them.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()
    if (!filename.includes('.spec.') && !filename.includes('.test.')) return {}

    return {
      CallExpression(node) {
        if (!isDescribeCall(node)) return

        const callbackBody = getCallbackBody(node)
        if (!callbackBody) return

        const testCalls = callbackBody.filter(isTestCall)
        if (testCalls.length < MIN_DUPLICATE_THRESHOLD) return

        const groups = groupByStructure(testCalls)

        for (const group of groups) {
          if (group.length >= MIN_DUPLICATE_THRESHOLD) {
            context.report({
              node: group[0],
              messageId: 'preferParameterized',
              data: { count: String(group.length) },
            })
          }
        }
      },
    }
  },
}

function isDescribeCall(node) {
  if (node.type !== 'CallExpression') return false
  const { callee } = node
  return callee.type === 'Identifier' && callee.name === 'describe'
}

function isTestCall(node) {
  if (node.type !== 'ExpressionStatement') return false
  const { expression } = node
  if (expression.type !== 'CallExpression') return false
  const { callee } = expression
  return (
    callee.type === 'Identifier' &&
    (callee.name === 'test' || callee.name === 'it')
  )
}

function isCallbackExpression(node) {
  return (
    node &&
    (node.type === 'ArrowFunctionExpression' ||
      node.type === 'FunctionExpression')
  )
}

function getCallbackBody(describeNode) {
  const callback = describeNode.arguments[1]
  return isCallbackExpression(callback) &&
    callback.body &&
    callback.body.type === 'BlockStatement'
    ? callback.body.body
    : null
}

/**
 * Build a structural fingerprint of a test call's callback body.
 * Replaces all literal values with a placeholder so that tests
 * differing only in literals produce the same fingerprint.
 */
function structuralFingerprint(testCallStatement) {
  const callback = testCallStatement.expression.arguments[1]
  return isCallbackExpression(callback) ? fingerprintNode(callback.body) : null
}

function fingerprintNode(node) {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'Literal' || node.type === 'TemplateLiteral') return '«LIT»'
  if (node.type === 'Identifier') return `ID(${node.name})`

  return buildCompositeFingerprint(node)
}

function buildCompositeFingerprint(node) {
  const keys = Object.keys(node).filter((k) => !AST_METADATA_KEYS.has(k))
  let fingerprint = node.type + '('

  for (const key of keys) {
    const value = node[key]
    if (Array.isArray(value))
      fingerprint += key + ':[' + value.map(fingerprintNode).join(',') + ']'
    if (value && typeof value === 'object' && value.type)
      fingerprint += key + ':' + fingerprintNode(value)
  }

  return fingerprint + ')'
}

function groupByStructure(testCalls) {
  const fingerprints = new Map()

  for (const testCall of testCalls) {
    const fp = structuralFingerprint(testCall)
    if (!fp) continue

    const existing = fingerprints.get(fp)
    if (existing) existing.push(testCall.expression)
    else fingerprints.set(fp, [testCall.expression])
  }

  return Array.from(fingerprints.values())
}
