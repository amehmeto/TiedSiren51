/**
 * 📝 Remark Configuration (Fix Mode)
 *
 * Same as .remarkrc.mjs but with fix mode enabled for the ticket linter.
 * Use with: npm run lint:ticket:fix
 */

import remarkLintTicket from './scripts/remark-lint-ticket/index.mjs'

const config = {
  plugins: [
    // Parse YAML frontmatter (GitHub issue templates)
    'remark-frontmatter',

    // Custom ticket linting with fix mode enabled
    [remarkLintTicket, { fix: true }],

    // Disable other rules that might conflict with fixes
    ['remark-lint-no-undefined-references', false],
  ],
}

export default config
