/**
 * 📝 Remark Configuration
 *
 * Linting rules for markdown files, including ticket validation.
 */

import remarkLintTicket from './scripts/remark-lint-ticket/index.mjs'

const config = {
  plugins: [
    // Parse YAML frontmatter (GitHub issue templates)
    'remark-frontmatter',

    // Built-in remark-lint rules
    'remark-lint',

    // Link validation (skip for ISSUE_TEMPLATE since they have placeholders)
    [
      'remark-validate-links',
      {
        repository: false, // Don't validate repo links in templates
      },
    ],

    // Custom ticket linting
    remarkLintTicket,

    // Standard markdown rules
    'remark-lint-no-duplicate-headings-in-section',

    // Use ATX headings (##) consistently
    ['remark-lint-heading-style', 'atx'],

    // List indentation
    ['remark-lint-list-item-indent', 'one'],

    // Disable undefined-references (false positives with [ ] checkboxes and placeholders)
    ['remark-lint-no-undefined-references', false],
  ],
}

export default config
