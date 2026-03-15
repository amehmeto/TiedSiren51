/**
 * 🎫 Ticket Linter Configuration
 *
 * Shared configuration for ticket validation.
 * This file is the single source of truth for valid repos, labels, etc.
 */

// GitHub organization for all repos
export const GITHUB_ORG = 'amehmeto'

// Main repository name (used as default context for local refs)
export const MAIN_REPO = 'TiedSiren'

// Valid repos with their GitHub URLs
// Use 'NEW_REPO: <name>' when the ticket requires creating a new repository (e.g., "NEW_REPO: my-new-repo")
export const VALID_REPOS = {
  TiedSiren: `https://github.com/amehmeto/TiedSiren`,
  'expo-accessibility-service': `https://github.com/amehmeto/expo-accessibility-service`,
  'expo-foreground-service': `https://github.com/amehmeto/expo-foreground-service`,
  'tied-siren-blocking-overlay': `https://github.com/amehmeto/tied-siren-blocking-overlay`,
  'expo-list-installed-apps': `https://github.com/amehmeto/expo-list-installed-apps`,
}

// Short abbreviations for repos (used in dependency references and graph display)
// Format: repo#N or abbrev#N (e.g., tied-siren-blocking-overlay#9 or TSBO#9)
export const REPO_ABBREVIATIONS = {
  // Full names map to themselves
  TiedSiren: 'TiedSiren',
  'expo-accessibility-service': 'expo-accessibility-service',
  'expo-foreground-service': 'expo-foreground-service',
  'tied-siren-blocking-overlay': 'tied-siren-blocking-overlay',
  'expo-list-installed-apps': 'expo-list-installed-apps',
  // Short abbreviations
  TS: 'TiedSiren',
  EAS: 'expo-accessibility-service',
  EFS: 'expo-foreground-service',
  TSBO: 'tied-siren-blocking-overlay',
  ELIA: 'expo-list-installed-apps',
}

// Single source of truth: repo name -> prefix mapping
// Used for display abbreviations, ticket prefixes, and reverse lookups
const REPO_PREFIXES = {
  TiedSiren: 'TS',
  'expo-accessibility-service': 'EAS',
  'expo-foreground-service': 'EFS',
  'tied-siren-blocking-overlay': 'TSBO',
  'expo-list-installed-apps': 'ELIA',
}

// Reverse mapping: full repo name -> abbreviation for display
export const REPO_DISPLAY_ABBREV = REPO_PREFIXES

// Jira-style ticket prefixes for issue/PR titles
// Format: PREFIX-123: description (e.g., "TS-123: feat(auth): add login")
export const TICKET_PREFIXES = REPO_PREFIXES

// Reverse mapping: prefix -> repo name (derived from REPO_PREFIXES)
const prefixToRepoEntries = Object.entries(REPO_PREFIXES).map(([repo, prefix]) => [prefix, repo])
export const PREFIX_TO_REPO = Object.fromEntries(prefixToRepoEntries)

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

// Repos that are automatically categorized as "blocking" in graphs
export const BLOCKING_REPOS = [
  'tied-siren-blocking-overlay',
  'expo-accessibility-service',
  'expo-foreground-service',
]

// Category keywords for matching tickets to categories in graphs
export const CATEGORY_KEYWORDS = {
  auth: ['auth', 'sign-in', 'password', 'login', 'firebase', 'session'],
  blocking: ['blocking', 'siren', 'tier', 'lookout', 'strict', 'overlay', 'schedule', 'native'],
}

// Required sections for different ticket types
// Hierarchy: Initiative > Epic > Issue (feature/bug)
export const FEATURE_SECTIONS = [
  { pattern: /📝\s*Summary/i, name: '📝 Summary' },
  { pattern: /🎯\s*Context/i, name: '🎯 Context' },
  { pattern: /✅\s*Acceptance Criteria/i, name: '✅ Acceptance Criteria' },
  { pattern: /🎭\s*Scenarios|Given.*When.*Then/i, name: '🎭 Scenarios (Given/When/Then)' },
  { pattern: /🔗\s*Hierarchy/i, name: '🔗 Hierarchy' },
]

export const BUG_SECTIONS = [
  { pattern: /🐛\s*Bug Summary/i, name: '🐛 Bug Summary' },
  { pattern: /🔄\s*Reproduction/i, name: '🔄 Reproduction' },
  { pattern: /✅\s*Acceptance Criteria/i, name: '✅ Acceptance Criteria' },
  { pattern: /🔗\s*Hierarchy/i, name: '🔗 Hierarchy' },
]

export const EPIC_SECTIONS = [
  { pattern: /🎯\s*Goal/i, name: '🎯 Goal' },
  { pattern: /📋\s*Stories/i, name: '📋 Stories / Tasks' },
  { pattern: /✅\s*Success Criteria/i, name: '✅ Success Criteria' },
  { pattern: /🔗\s*Hierarchy/i, name: '🔗 Hierarchy' },
]

export const INITIATIVE_SECTIONS = [
  { pattern: /🎯\s*Vision/i, name: '🎯 Vision' },
  { pattern: /📋\s*Epics/i, name: '📋 Epics' },
  { pattern: /✅\s*Success Criteria/i, name: '✅ Success Criteria' },
  { pattern: /🔗\s*Hierarchy/i, name: '🔗 Hierarchy' },
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
  '🔗 Hierarchy':
    '| Level | Link |\n|-------|------|\n| 🚀 Initiative | [#XX - Initiative Name](https://github.com/amehmeto/TiedSiren/issues/XX) |\n| 🏔️ Epic | [#XX - Epic Name](https://github.com/amehmeto/TiedSiren/issues/XX) |',
}

// Hierarchy templates per ticket type (used for more specific fix suggestions)
export const HIERARCHY_TEMPLATES = {
  feature:
    '| Level | Link |\n|-------|------|\n| 🚀 Initiative | [#XX - Initiative Name](https://github.com/amehmeto/TiedSiren/issues/XX) |\n| 🏔️ Epic | [#XX - Epic Name](https://github.com/amehmeto/TiedSiren/issues/XX) |',
  bug:
    '| Level | Link |\n|-------|------|\n| 🚀 Initiative | [#XX - Initiative Name](https://github.com/amehmeto/TiedSiren/issues/XX) |\n| 🏔️ Epic | [#XX - Epic Name](https://github.com/amehmeto/TiedSiren/issues/XX) |',
  epic:
    '| Level | Link |\n|-------|------|\n| 🚀 Initiative | [#XX - Initiative Name](https://github.com/amehmeto/TiedSiren/issues/XX) |',
  initiative:
    '| Level | Description |\n|-------|-------------|\n| 🚀 **Initiative** | ← You are here |\n| 🏔️ Epics | Listed in table above |\n| 📋 Issues | Inside each Epic |',
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate that REPO_ABBREVIATIONS, REPO_DISPLAY_ABBREV, TICKET_PREFIXES, and PREFIX_TO_REPO
 * are consistent with VALID_REPOS.
 * Throws an error if any repo in VALID_REPOS is missing from the mappings.
 */
export function validateRepoAbbreviations() {
  const errors = []

  for (const repoName of Object.keys(VALID_REPOS)) {
    // Check REPO_ABBREVIATIONS has the full name mapping
    if (REPO_ABBREVIATIONS[repoName] !== repoName) {
      errors.push(`REPO_ABBREVIATIONS missing self-mapping for: ${repoName}`)
    }

    // Check REPO_DISPLAY_ABBREV has a display abbreviation
    if (!REPO_DISPLAY_ABBREV[repoName]) {
      errors.push(`REPO_DISPLAY_ABBREV missing abbreviation for: ${repoName}`)
    }

    // Check TICKET_PREFIXES has a prefix for this repo
    if (!TICKET_PREFIXES[repoName]) {
      errors.push(`TICKET_PREFIXES missing prefix for: ${repoName}`)
    }
  }

  // Check that all abbreviations point to valid repos
  for (const [abbrev, fullName] of Object.entries(REPO_ABBREVIATIONS)) {
    if (!VALID_REPOS[fullName]) {
      errors.push(`REPO_ABBREVIATIONS[${abbrev}] points to unknown repo: ${fullName}`)
    }
  }

  // Check that all display abbreviations are for valid repos
  for (const repoName of Object.keys(REPO_DISPLAY_ABBREV)) {
    if (!VALID_REPOS[repoName]) {
      errors.push(`REPO_DISPLAY_ABBREV has entry for unknown repo: ${repoName}`)
    }
  }

  // Check that PREFIX_TO_REPO is consistent with TICKET_PREFIXES
  for (const [repoName, prefix] of Object.entries(TICKET_PREFIXES)) {
    if (PREFIX_TO_REPO[prefix] !== repoName) {
      errors.push(`PREFIX_TO_REPO[${prefix}] should map to ${repoName}`)
    }
  }

  // Check that all prefixes in PREFIX_TO_REPO point to valid repos
  for (const [prefix, repoName] of Object.entries(PREFIX_TO_REPO)) {
    if (!VALID_REPOS[repoName]) {
      errors.push(`PREFIX_TO_REPO[${prefix}] points to unknown repo: ${repoName}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Repository abbreviation configuration errors:\n  - ${errors.join('\n  - ')}`)
  }
}

// Run validation on module load
validateRepoAbbreviations()
