/**
 * @fileoverview Require @amehmeto/ GitHub dependencies to be pinned to a commit hash.
 * Unpinned refs (e.g., "github:amehmeto/repo" without #<sha>) can break builds
 * when the default branch moves.
 */

const PINNED_GITHUB_REF = /github:amehmeto\/[\w-]+#[0-9a-f]{7,}/

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require @amehmeto/ packages to be pinned to a commit hash',
    },
    messages: {
      unpinned:
        '"{{ key }}" must be pinned to a commit hash (e.g., github:amehmeto/repo#abc1234). Got: "{{ value }}"',
    },
    schema: [],
  },

  create(context) {
    if (!context.filename.endsWith('package.json')) return {}

    return {
      JSONProperty(node) {
        if (
          node.key.type !== 'JSONLiteral' ||
          node.value.type !== 'JSONLiteral'
        )
          return

        const key = node.key.value
        const value = node.value.value
        if (
          typeof key !== 'string' ||
          !key.startsWith('@amehmeto/') ||
          typeof value !== 'string'
        )
          return

        if (!PINNED_GITHUB_REF.test(value)) {
          context.report({
            node: node.value,
            messageId: 'unpinned',
            data: { key, value },
          })
        }
      },
    }
  },
}
