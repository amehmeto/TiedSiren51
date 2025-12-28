/**
 * 🎫 Ticket Linter Configuration
 *
 * Shared configuration for ticket validation.
 * This file is the single source of truth for valid repos, labels, etc.
 */

// GitHub organization for all repos
export const GITHUB_ORG = 'amehmeto'

// Valid repos with their GitHub URLs
// Use 'NEW_REPO: <name>' when the ticket requires creating a new repository
export const VALID_REPOS = {
  TiedSiren51: `https://github.com/amehmeto/TiedSiren51`,
  'expo-accessibility-service': `https://github.com/amehmeto/expo-accessibility-service`,
  'expo-foreground-service': `https://github.com/amehmeto/expo-foreground-service`,
  'tied-siren-blocking-overlay': `https://github.com/amehmeto/tied-siren-blocking-overlay`,
  'expo-list-installed-apps': `https://github.com/amehmeto/expo-list-installed-apps`,
}

// Special prefix for tickets that require creating a new repo
export const NEW_REPO_PREFIX = 'NEW_REPO:'

export const VALID_LABELS = [
  'enhancement',
  'bug',
  'blocking',
  'auth',
  'android',
  'ios',
  'epic',
  'initiative',
  'needs-refinement',
  'documentation',
  'in-progress',
]

export const FIBONACCI_POINTS = [0, 1, 2, 3, 5, 8, 13, 21]

export const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical']

// Required sections for different ticket types
export const FEATURE_SECTIONS = [
  { pattern: /📝\s*Summary/i, name: '📝 Summary' },
  { pattern: /🎯\s*Context/i, name: '🎯 Context' },
  { pattern: /✅\s*Acceptance Criteria/i, name: '✅ Acceptance Criteria' },
  { pattern: /🎭\s*Scenarios|Given.*When.*Then/i, name: '🎭 Scenarios (Given/When/Then)' },
]

export const BUG_SECTIONS = [
  { pattern: /🐛\s*Bug Summary/i, name: '🐛 Bug Summary' },
  { pattern: /🔄\s*Reproduction/i, name: '🔄 Reproduction' },
  { pattern: /✅\s*Acceptance Criteria/i, name: '✅ Acceptance Criteria' },
]

export const EPIC_SECTIONS = [
  { pattern: /🎯\s*Goal/i, name: '🎯 Goal' },
  { pattern: /📋\s*Stories/i, name: '📋 Stories / Tasks' },
  { pattern: /✅\s*Success Criteria/i, name: '✅ Success Criteria' },
]

export const INITIATIVE_SECTIONS = [
  { pattern: /🎯\s*Vision/i, name: '🎯 Vision' },
  { pattern: /📋\s*Epics/i, name: '📋 Epics' },
  { pattern: /✅\s*Success Criteria/i, name: '✅ Success Criteria' },
]

// Section templates for --fix mode
export const SECTION_TEMPLATES = {
  '📝 Summary': '<!-- One paragraph explaining what this feature does and why it matters -->',
  '🎯 Context':
    '<!-- Background information: Why does this feature exist? What problem does it solve? -->',
  '✅ Acceptance Criteria': '- [ ] Requirement 1\n- [ ] Requirement 2\n- [ ] Requirement 3',
  '🎭 Scenarios (Given/When/Then)':
    '```gherkin\nGiven [initial context]\nWhen [action taken]\nThen [expected outcome]\n```',
  '🐛 Bug Summary': '<!-- One sentence describing the bug -->',
  '🔄 Reproduction':
    '### 📋 Steps to Reproduce\n1. Step 1\n2. Step 2\n3. Step 3\n\n### ❌ Actual Behavior\n<!-- What happens now -->\n\n### ✅ Expected Behavior\n<!-- What should happen -->',
  '🎯 Goal': "<!-- One paragraph describing the epic's objective and business value -->",
  '📋 Stories / Tasks':
    '| # | Story | Points | Status | Notes |\n|---|-------|--------|--------|-------|\n| #XX | Story title | 3 | 🔲 Todo | |',
  '✅ Success Criteria':
    '- [ ] Criterion 1\n- [ ] Criterion 2\n- [ ] All stories completed',
  '🎯 Vision': "<!-- One paragraph describing the initiative's strategic objective and why it matters -->",
  '📋 Epics':
    '| # | Epic | Status | Notes |\n|---|------|--------|-------|\n| #XX | Epic title | 🔲 Todo | |',
}
