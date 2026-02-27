/**
 * @fileoverview Enforce boolean naming convention (is, has, should, can, did, will, was).
 * Also enforces no I-prefix on interfaces.
 * Scoped to **\/*.ts and **\/*.tsx files globally, with stricter enforcement in core.
 * Replaces @typescript-eslint/naming-convention for OxLint.
 * @author TiedSiren
 *
 * Note: AST-only check — only detects variables with explicit `: boolean`
 * type annotations. Without full type information from the TypeScript
 * compiler, we cannot reliably detect booleans from initializers.
 */

const BOOLEAN_PREFIXES = ['is', 'has', 'should', 'can', 'did', 'will', 'was']
const BOOLEAN_PREFIX_REGEX = new RegExp(`^(${BOOLEAN_PREFIXES.join('|')})[A-Z]`)
const INTERFACE_I_PREFIX_REGEX = /^I[A-Z]/

function isTypeScriptFile(filename) {
  return filename.endsWith('.ts') || filename.endsWith('.tsx')
}

function isCoreProductionFile(filename) {
  const normalized = filename.replace(/\\/g, '/')
  if (!normalized.includes('/core/')) return false
  if (normalized.includes('.test.ts')) return false
  if (normalized.includes('.spec.ts')) return false
  return true
}

function hasBooleanAnnotation(node) {
  if (!node.typeAnnotation) return false
  const annotation = node.typeAnnotation.typeAnnotation || node.typeAnnotation
  return annotation.type === 'TSBooleanKeyword'
}

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce boolean naming convention and no I-prefix on interfaces',
      category: 'Stylistic Issues',
      recommended: true,
    },
    messages: {
      booleanPrefix:
        'Boolean {{ kind }} "{{ name }}" must start with one of: {{ prefixes }}.',
      noIPrefix:
        'Interface name "{{ name }}" must not start with "I" prefix. Use "{{ suggestion }}" instead.',
    },
    schema: [],
  },

  create(context) {
    const filename = context.getFilename()
    if (!isTypeScriptFile(filename)) return {}

    const checkBooleans = true
    const checkTypeProperties = isCoreProductionFile(filename)

    function checkBooleanName(node, name, kind) {
      if (name.startsWith('_')) return
      if (BOOLEAN_PREFIX_REGEX.test(name)) return
      context.report({
        node,
        messageId: 'booleanPrefix',
        data: { name, kind, prefixes: BOOLEAN_PREFIXES.join(', ') },
      })
    }

    return {
      // Interface I-prefix check (global)
      TSInterfaceDeclaration(node) {
        const name = node.id.name
        if (INTERFACE_I_PREFIX_REGEX.test(name))
          context.report({
            node: node.id,
            messageId: 'noIPrefix',
            data: { name, suggestion: name.slice(1) },
          })
      },

      // Boolean variable declarations (annotation-based only)
      VariableDeclarator(node) {
        if (!checkBooleans) return
        if (node.id.type !== 'Identifier') return
        if (hasBooleanAnnotation(node.id))
          checkBooleanName(node.id, node.id.name, 'variable')
      },

      // Boolean parameters
      'FunctionDeclaration > Identifier, ArrowFunctionExpression > Identifier'(node) {
        if (!checkBooleans) return
        if (node.parent.params && node.parent.params.includes(node))
          if (hasBooleanAnnotation(node))
            checkBooleanName(node, node.name, 'parameter')
      },

      // Boolean class properties (annotation-based only)
      PropertyDefinition(node) {
        if (!checkBooleans) return
        if (node.key.type !== 'Identifier') return
        if (hasBooleanAnnotation(node)) {
          const name = node.key.name
          if (name.startsWith('_'))
            checkBooleanName(node.key, name.slice(1), 'class property')
          else checkBooleanName(node.key, name, 'class property')
        }
      },

      // Boolean type properties (core only)
      TSPropertySignature(node) {
        if (!checkTypeProperties) return
        if (node.key.type !== 'Identifier') return
        if (hasBooleanAnnotation(node))
          checkBooleanName(node.key, node.key.name, 'type property')
      },
    }
  },
}
