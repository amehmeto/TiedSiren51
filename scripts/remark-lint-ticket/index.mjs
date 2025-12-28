/**
 * 🎫 remark-lint-ticket
 *
 * Custom remark plugin to validate ticket markdown files.
 * Ensures tickets follow the required structure for LLM consumption.
 */

import { visit } from 'unist-util-visit'
import yaml from 'js-yaml'

// ============================================================================
// 📋 CONFIGURATION
// ============================================================================

const VALID_REPOS = [
  'TiedSiren51',
  'expo-accessibility-service',
  'expo-foreground-service',
  'tied-siren-blocking-overlay',
  'expo-list-installed-apps',
]

const VALID_LABELS = [
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

const FIBONACCI_POINTS = [0, 1, 2, 3, 5, 8, 13, 21]

const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical']

// Required sections for different ticket types
const FEATURE_SECTIONS = [
  { pattern: /📝\s*Summary/i, name: '📝 Summary' },
  { pattern: /🎯\s*Context/i, name: '🎯 Context' },
  { pattern: /✅\s*Acceptance Criteria/i, name: '✅ Acceptance Criteria' },
  { pattern: /🎭\s*Scenarios|Given.*When.*Then/i, name: '🎭 Scenarios (Given/When/Then)' },
]

const BUG_SECTIONS = [
  { pattern: /🐛\s*Bug Summary/i, name: '🐛 Bug Summary' },
  { pattern: /🔄\s*Reproduction/i, name: '🔄 Reproduction' },
  { pattern: /✅\s*Acceptance Criteria/i, name: '✅ Acceptance Criteria' },
]

const EPIC_SECTIONS = [
  { pattern: /🎯\s*Goal/i, name: '🎯 Goal' },
  { pattern: /📋\s*Stories/i, name: '📋 Stories / Tasks' },
  { pattern: /✅\s*Success Criteria/i, name: '✅ Success Criteria' },
]

// ============================================================================
// 🔧 UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a file should be validated as a ticket.
 * Only validates:
 * - Files in .github/ISSUE_TEMPLATE/
 * - Temp files created by validate-ticket.sh (/tmp/ticket-*)
 * - Files that have ticket-like structure (METADATA block)
 */
function isTicketFile(file, tree) {
  const filePath = file.path || file.history?.[0] || ''

  // Always validate files in ISSUE_TEMPLATE or temp ticket files
  if (filePath.includes('.github/ISSUE_TEMPLATE/') || filePath.includes('/tmp/ticket-')) {
    return true
  }

  // Check if file has ticket metadata block - if so, validate it
  const { yamlContent } = extractYamlFromCodeBlock(tree)
  if (yamlContent) {
    return true
  }

  // Not a ticket file - skip validation
  return false
}

/**
 * Extract YAML metadata from a code block
 */
function extractYamlFromCodeBlock(tree) {
  let yamlContent = null
  let yamlNode = null

  visit(tree, 'code', (node) => {
    if (node.lang === 'yaml' && node.value.includes('METADATA')) {
      yamlContent = node.value
        .replace(/^#.*$/gm, '') // Remove comments
        .trim()
      yamlNode = node
    }
  })

  return { yamlContent, yamlNode }
}

/**
 * Parse YAML content safely
 */
function parseYaml(content) {
  try {
    return { data: yaml.load(content), error: null }
  } catch (error) {
    return { data: null, error: error.message }
  }
}

/**
 * Get all headings from the tree
 */
function getHeadings(tree) {
  const headings = []
  visit(tree, 'heading', (node) => {
    const text = node.children
      .filter((child) => child.type === 'text')
      .map((child) => child.value)
      .join('')
    headings.push({ text, node, depth: node.depth })
  })
  return headings
}

/**
 * Check if tree contains gherkin code blocks
 */
function hasGherkinBlocks(tree) {
  let found = false
  visit(tree, 'code', (node) => {
    if (node.lang === 'gherkin') {
      found = true
    }
  })
  return found
}

/**
 * Check if content has Given/When/Then patterns
 */
function hasGherkinPatterns(tree) {
  let found = false
  const gherkinPattern = /\b(Given|When|Then|And|But)\b.*\b(Given|When|Then|And|But)\b/is

  visit(tree, 'code', (node) => {
    if (gherkinPattern.test(node.value)) {
      found = true
    }
  })

  return found
}

/**
 * Detect ticket type from content
 */
function detectTicketType(headings, metadata) {
  const headingTexts = headings.map((h) => h.text.toLowerCase())

  if (metadata?.labels?.includes('epic') || headingTexts.some((h) => h.includes('goal') && h.includes('🎯'))) {
    return 'epic'
  }

  if (metadata?.labels?.includes('bug') || headingTexts.some((h) => h.includes('bug'))) {
    return 'bug'
  }

  return 'feature'
}

// ============================================================================
// 🎫 VALIDATION FUNCTIONS
// ============================================================================

function validateMetadata(tree, file) {
  const { yamlContent, yamlNode } = extractYamlFromCodeBlock(tree)

  if (!yamlContent) {
    file.message('❌ Missing YAML metadata block with `# 📦 METADATA` comment')
    return null
  }

  const { data, error } = parseYaml(yamlContent)

  if (error) {
    file.message(`❌ Invalid YAML in metadata block: ${error}`)
    return null
  }

  // Validate required fields
  if (!data.repo) {
    file.message('❌ Missing `repo` field in metadata')
  } else if (!VALID_REPOS.includes(data.repo)) {
    file.message(`❌ Invalid repo "${data.repo}". Valid: ${VALID_REPOS.join(', ')}`)
  }

  if (data.story_points === undefined) {
    file.message('❌ Missing `story_points` field in metadata')
  } else if (!FIBONACCI_POINTS.includes(data.story_points)) {
    file.message(`❌ story_points must be Fibonacci: ${FIBONACCI_POINTS.join(', ')}`)
  }

  if (!data.labels || !Array.isArray(data.labels)) {
    file.message('❌ Missing `labels` array in metadata')
  } else {
    const invalidLabels = data.labels.filter((l) => !VALID_LABELS.includes(l))
    if (invalidLabels.length > 0) {
      file.message(`⚠️ Unknown labels: ${invalidLabels.join(', ')}`)
    }
  }

  if (data.depends_on && !Array.isArray(data.depends_on)) {
    file.message('❌ `depends_on` must be an array')
  }

  if (data.blocks && !Array.isArray(data.blocks)) {
    file.message('❌ `blocks` must be an array')
  }

  // Bug-specific validation
  if (data.labels?.includes('bug') && data.severity) {
    if (!VALID_SEVERITIES.includes(data.severity)) {
      file.message(`❌ Invalid severity "${data.severity}". Valid: ${VALID_SEVERITIES.join(', ')}`)
    }
  }

  return data
}

function validateRequiredSections(tree, file, ticketType) {
  const headings = getHeadings(tree)

  let requiredSections
  if (ticketType === 'epic') {
    requiredSections = EPIC_SECTIONS
  } else if (ticketType === 'bug') {
    requiredSections = BUG_SECTIONS
  } else {
    requiredSections = FEATURE_SECTIONS
  }

  for (const section of requiredSections) {
    const found = headings.some((h) => section.pattern.test(h.text))
    if (!found) {
      file.message(`❌ Missing required section: ${section.name}`)
    }
  }
}

function validateGherkin(tree, file, ticketType) {
  // Epics don't need gherkin
  if (ticketType === 'epic') {
    return
  }

  if (!hasGherkinBlocks(tree) && !hasGherkinPatterns(tree)) {
    file.message('⚠️ Missing Given/When/Then scenarios (use ```gherkin code blocks)')
  }
}

function validateStoryPointsNotInTitle(tree, file) {
  const headings = getHeadings(tree)

  for (const heading of headings) {
    if (/\d+\s*sp\b/i.test(heading.text) || /\bsp\s*\d+/i.test(heading.text)) {
      file.message('⚠️ Story points should be in metadata, not in title/heading')
    }
  }
}

// ============================================================================
// 🔌 PLUGIN EXPORT
// ============================================================================

export default function remarkLintTicket() {
  return (tree, file) => {
    // Skip validation for non-ticket files (ADRs, README, etc.)
    if (!isTicketFile(file, tree)) {
      return
    }

    // Validate metadata and get parsed data
    const metadata = validateMetadata(tree, file)

    // Detect ticket type
    const headings = getHeadings(tree)
    const ticketType = detectTicketType(headings, metadata)

    // Run validation rules
    validateRequiredSections(tree, file, ticketType)
    validateGherkin(tree, file, ticketType)
    validateStoryPointsNotInTitle(tree, file)
  }
}

// Export for testing
export {
  VALID_REPOS,
  VALID_LABELS,
  FIBONACCI_POINTS,
  VALID_SEVERITIES,
  FEATURE_SECTIONS,
  BUG_SECTIONS,
  EPIC_SECTIONS,
  isTicketFile,
  extractYamlFromCodeBlock,
  parseYaml,
  getHeadings,
  hasGherkinBlocks,
  hasGherkinPatterns,
  detectTicketType,
  validateMetadata,
  validateRequiredSections,
  validateGherkin,
  validateStoryPointsNotInTitle,
}
