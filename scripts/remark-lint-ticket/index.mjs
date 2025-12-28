/**
 * 🎫 remark-lint-ticket
 *
 * Custom remark plugin to validate ticket markdown files.
 * Ensures tickets follow the required structure for LLM consumption.
 */

import { visit } from 'unist-util-visit'
import yaml from 'js-yaml'

// Import configuration from shared config file
import {
  VALID_REPOS,
  NEW_REPO_PREFIX,
  VALID_LABELS,
  FIBONACCI_POINTS,
  VALID_SEVERITIES,
  FEATURE_SECTIONS,
  BUG_SECTIONS,
  EPIC_SECTIONS,
  INITIATIVE_SECTIONS,
  SECTION_TEMPLATES,
} from './config.mjs'

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

  if (
    metadata?.labels?.includes('initiative') ||
    headingTexts.some((h) => h.includes('vision') && h.includes('🎯'))
  ) {
    return 'initiative'
  }

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
  const validRepoNames = Object.keys(VALID_REPOS)
  if (!data.repo) {
    file.message('❌ Missing `repo` field in metadata')
  } else if (data.repo.startsWith(NEW_REPO_PREFIX)) {
    // Valid: ticket requires creating a new repo
    const newRepoName = data.repo.slice(NEW_REPO_PREFIX.length).trim()
    if (!newRepoName) {
      file.message(`❌ NEW_REPO: must be followed by the proposed repo name (e.g., "NEW_REPO: expo-new-module")`)
    }
  } else if (!validRepoNames.includes(data.repo)) {
    const repoList = validRepoNames.map((name) => `  - ${name}: ${VALID_REPOS[name]}`).join('\n')
    file.message(
      `❌ Invalid repo "${data.repo}". Must be one of:\n${repoList}\n  Or use "NEW_REPO: <name>" if a new repository is needed`,
    )
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
  if (ticketType === 'initiative') {
    requiredSections = INITIATIVE_SECTIONS
  } else if (ticketType === 'epic') {
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
  // Epics and initiatives don't need gherkin
  if (ticketType === 'epic' || ticketType === 'initiative') {
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
// 🔧 FIX MODE FUNCTIONS
// ============================================================================

/**
 * Create a heading node
 */
function createHeading(text, depth = 2) {
  return {
    type: 'heading',
    depth,
    children: [{ type: 'text', value: text }],
  }
}

/**
 * Create a paragraph node with HTML comment or text
 */
function createParagraph(text) {
  // Check if it's an HTML comment
  if (text.startsWith('<!--') && text.endsWith('-->')) {
    return {
      type: 'html',
      value: text,
    }
  }
  return {
    type: 'paragraph',
    children: [{ type: 'text', value: text }],
  }
}

/**
 * Create nodes from template content (handles code blocks, lists, tables)
 */
function createContentNodes(template) {
  const nodes = []

  // Handle code blocks
  if (template.startsWith('```')) {
    const match = template.match(/^```(\w*)\n([\s\S]*)\n```$/)
    if (match) {
      nodes.push({
        type: 'code',
        lang: match[1] || null,
        value: match[2],
      })
      return nodes
    }
  }

  // Handle tables (starts with |)
  if (template.startsWith('|')) {
    // Split into lines and create a simple HTML table representation
    // Remark will handle this as raw text which is fine for templates
    nodes.push({
      type: 'paragraph',
      children: [{ type: 'text', value: template }],
    })
    return nodes
  }

  // Handle multi-section content (like Reproduction with sub-headings)
  if (template.includes('###')) {
    const lines = template.split('\n')
    let currentParagraph = []

    for (const line of lines) {
      if (line.startsWith('### ')) {
        if (currentParagraph.length > 0) {
          nodes.push(createParagraph(currentParagraph.join('\n')))
          currentParagraph = []
        }
        nodes.push(createHeading(line.slice(4), 3))
      } else if (line.startsWith('<!--')) {
        if (currentParagraph.length > 0) {
          nodes.push(createParagraph(currentParagraph.join('\n')))
          currentParagraph = []
        }
        nodes.push({ type: 'html', value: line })
      } else if (line.trim()) {
        currentParagraph.push(line)
      }
    }

    if (currentParagraph.length > 0) {
      nodes.push(createParagraph(currentParagraph.join('\n')))
    }

    return nodes
  }

  // Handle list items
  if (template.startsWith('- ')) {
    nodes.push({
      type: 'list',
      ordered: false,
      spread: false,
      children: template.split('\n').map((line) => ({
        type: 'listItem',
        spread: false,
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', value: line.replace(/^- \[[ x]\] /, '').replace(/^- /, '') }],
          },
        ],
      })),
    })
    return nodes
  }

  // Default: simple paragraph or HTML comment
  nodes.push(createParagraph(template))
  return nodes
}

/**
 * Find missing sections and insert them into the tree
 */
function fixMissingSections(tree, file, ticketType) {
  const headings = getHeadings(tree)

  let requiredSections
  if (ticketType === 'initiative') {
    requiredSections = INITIATIVE_SECTIONS
  } else if (ticketType === 'epic') {
    requiredSections = EPIC_SECTIONS
  } else if (ticketType === 'bug') {
    requiredSections = BUG_SECTIONS
  } else {
    requiredSections = FEATURE_SECTIONS
  }

  const missingSections = []
  for (const section of requiredSections) {
    const found = headings.some((h) => section.pattern.test(h.text))
    if (!found) {
      missingSections.push(section.name)
    }
  }

  if (missingSections.length === 0) {
    return false // No fixes needed
  }

  // Find insertion point (before "Related" section or at end)
  let insertIndex = tree.children.length
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i]
    if (node.type === 'heading') {
      const text = node.children?.map((c) => c.value).join('') || ''
      if (/🔗\s*Related/i.test(text) || /Related/i.test(text)) {
        insertIndex = i
        break
      }
    }
  }

  // Create nodes for missing sections
  const newNodes = []
  for (const sectionName of missingSections) {
    // Add thematic break before section
    newNodes.push({ type: 'thematicBreak' })

    // Add heading
    newNodes.push(createHeading(sectionName, 2))

    // Add template content
    const template = SECTION_TEMPLATES[sectionName]
    if (template) {
      newNodes.push(...createContentNodes(template))
    }

    file.message(`🔧 Added missing section: ${sectionName}`)
  }

  // Insert nodes
  tree.children.splice(insertIndex, 0, ...newNodes)

  return true // Fixes were made
}

// ============================================================================
// 🔌 PLUGIN EXPORT
// ============================================================================

/**
 * Remark plugin to validate (and optionally fix) ticket markdown files.
 *
 * @param {Object} options - Plugin options
 * @param {boolean} options.fix - If true, insert missing sections instead of just reporting
 */
export default function remarkLintTicket(options = {}) {
  const { fix = false } = options

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

    // In fix mode, insert missing sections
    if (fix) {
      fixMissingSections(tree, file, ticketType)
      // Re-validate gherkin after potential fixes (still warn if missing)
      if (!hasGherkinBlocks(tree) && !hasGherkinPatterns(tree) && ticketType !== 'epic' && ticketType !== 'initiative') {
        file.message('⚠️ Missing Given/When/Then scenarios (use ```gherkin code blocks)')
      }
    } else {
      // Run validation rules (report mode)
      validateRequiredSections(tree, file, ticketType)
      validateGherkin(tree, file, ticketType)
    }

    validateStoryPointsNotInTitle(tree, file)
  }
}

// Export for testing
export {
  VALID_REPOS,
  NEW_REPO_PREFIX,
  VALID_LABELS,
  FIBONACCI_POINTS,
  VALID_SEVERITIES,
  FEATURE_SECTIONS,
  BUG_SECTIONS,
  EPIC_SECTIONS,
  INITIATIVE_SECTIONS,
  SECTION_TEMPLATES,
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
  createHeading,
  createParagraph,
  createContentNodes,
  fixMissingSections,
}
