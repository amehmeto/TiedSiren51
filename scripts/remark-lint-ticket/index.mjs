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
  GITHUB_ORG,
  NEW_REPO_PREFIX,
  VALID_LABELS,
  FIBONACCI_POINTS,
  VALID_SEVERITIES,
  FEATURE_SECTIONS,
  BUG_SECTIONS,
  EPIC_SECTIONS,
  INITIATIVE_SECTIONS,
  SECTION_TEMPLATES,
  HIERARCHY_TEMPLATES,
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
  if (
    filePath.includes('.github/ISSUE_TEMPLATE/') ||
    filePath.includes('/tmp/ticket-')
  ) {
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
 * Check if a file is a template file (should skip hierarchy URL validation)
 * Templates have placeholder #XX values which are intentional
 */
function isTemplateFile(file) {
  const filePath = file.path || file.history?.[0] || ''
  return filePath.includes('.github/ISSUE_TEMPLATE/')
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
  const gherkinPattern =
    /\b(Given|When|Then|And|But)\b.*\b(Given|When|Then|And|But)\b/is

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

  if (
    metadata?.labels?.includes('epic') ||
    headingTexts.some((h) => h.includes('goal') && h.includes('🎯'))
  ) {
    return 'epic'
  }

  if (
    metadata?.labels?.includes('bug') ||
    headingTexts.some((h) => h.includes('bug'))
  ) {
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
      file.message(
        `❌ NEW_REPO: must be followed by the proposed repo name (e.g., "NEW_REPO: my-new-repo")`,
      )
    }
  } else if (!validRepoNames.includes(data.repo)) {
    const repoList = validRepoNames
      .map((name) => `  - ${name}: ${VALID_REPOS[name]}`)
      .join('\n')
    file.message(
      `❌ Invalid repo "${data.repo}". Must be one of:\n${repoList}\n  Or use "NEW_REPO: <name>" if a new repository is needed`,
    )
  }

  if (data.story_points === undefined) {
    file.message('❌ Missing `story_points` field in metadata')
  } else if (!FIBONACCI_POINTS.includes(data.story_points)) {
    file.message(
      `❌ story_points must be Fibonacci: ${FIBONACCI_POINTS.join(', ')}`,
    )
  }

  if (!data.labels || !Array.isArray(data.labels)) {
    file.message('❌ Missing `labels` array in metadata')
  } else {
    const invalidLabels = data.labels.filter((l) => !VALID_LABELS.includes(l))
    if (invalidLabels.length > 0) {
      file.message(`⚠️ Unknown labels: ${invalidLabels.join(', ')}`)
    }
  }

  // Validate depends_on (mandatory)
  if (data.depends_on === undefined) {
    file.message(
      '❌ Missing `depends_on` field in metadata (use `depends_on: []` if no dependencies)',
    )
  } else if (!Array.isArray(data.depends_on)) {
    file.message('❌ `depends_on` must be an array')
  }

  // Validate blocks (mandatory)
  if (data.blocks === undefined) {
    file.message(
      '❌ Missing `blocks` field in metadata (use `blocks: []` if this issue blocks nothing)',
    )
  } else if (!Array.isArray(data.blocks)) {
    file.message('❌ `blocks` must be an array')
  }

  // Bug-specific validation
  if (data.labels?.includes('bug') && data.severity) {
    if (!VALID_SEVERITIES.includes(data.severity)) {
      file.message(
        `❌ Invalid severity "${data.severity}". Valid: ${VALID_SEVERITIES.join(', ')}`,
      )
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
    file.message(
      '⚠️ Missing Given/When/Then scenarios (use ```gherkin code blocks)',
    )
  }
}

function validateStoryPointsNotInTitle(tree, file) {
  const headings = getHeadings(tree)

  for (const heading of headings) {
    if (/\d+\s*sp\b/i.test(heading.text) || /\bsp\s*\d+/i.test(heading.text)) {
      file.message(
        '⚠️ Story points should be in metadata, not in title/heading',
      )
    }
  }
}

/**
 * Validate hierarchy links are filled in (not placeholder #XX)
 * Ticket hierarchy: Initiative > Epic > Issue
 * - Issues (feature/bug) must link to Epic AND Initiative
 * - Epics must link to Initiative
 * - Initiatives are top-level (no parent required)
 *
 * Note: Template files (.github/ISSUE_TEMPLATE/) skip URL validation
 * since they intentionally contain placeholder #XX values.
 */
function validateHierarchyLinks(tree, file, ticketType) {
  // Skip hierarchy URL validation for template files (they have placeholders)
  if (isTemplateFile(file)) {
    return
  }

  // Build valid GitHub URL pattern from config
  const validRepoNames = Object.keys(VALID_REPOS)
  const validUrlPattern = new RegExp(
    `https://github\\.com/${GITHUB_ORG}/(${validRepoNames.join('|')})/issues/(\\d+)`,
    'g',
  )

  // Find the hierarchy section
  let inHierarchySection = false
  let hierarchyContent = ''
  const foundUrls = []

  visit(tree, (node) => {
    if (node.type === 'heading') {
      const text = node.children?.map((c) => c.value).join('') || ''
      inHierarchySection = /🔗\s*Hierarchy/i.test(text)
    } else if (inHierarchySection) {
      if (node.type === 'heading') {
        inHierarchySection = false
      } else if (node.type === 'table' || node.type === 'tableRow' || node.type === 'tableCell') {
        // Collect table content
        if (node.children) {
          node.children.forEach((child) => {
            if (child.type === 'text') {
              hierarchyContent += child.value + ' '
            } else if (child.type === 'link') {
              hierarchyContent += child.url + ' '
              foundUrls.push(child.url)
            }
          })
        }
      } else if (node.type === 'text') {
        hierarchyContent += node.value + ' '
      } else if (node.type === 'link') {
        hierarchyContent += node.url + ' '
        foundUrls.push(node.url)
      }
    }
  })

  // Skip validation for initiatives (they're top-level)
  if (ticketType === 'initiative') {
    return
  }

  // Check for placeholder #XX in hierarchy section
  if (hierarchyContent.includes('/issues/XX') || hierarchyContent.includes('#XX')) {
    file.message(
      '⚠️ Hierarchy links contain placeholder #XX - replace with actual issue numbers',
    )
  }

  // Validate URLs are proper GitHub issue links to valid repos
  for (const url of foundUrls) {
    if (url.includes('github.com') && url.includes('/issues/')) {
      // Check if it's a valid repo URL
      const isValidRepo = validRepoNames.some((repo) =>
        url.includes(`github.com/${GITHUB_ORG}/${repo}/issues/`),
      )
      if (!isValidRepo) {
        file.message(
          `⚠️ Invalid hierarchy link: ${url} - must link to a valid repo (${validRepoNames.join(', ')})`,
        )
      }
      // Check it has a real issue number (not XX)
      if (url.includes('/issues/XX')) {
        file.message(
          `⚠️ Hierarchy link has placeholder issue number: ${url}`,
        )
      }
    }
  }

  // Validate that required parent links exist with proper GitHub URLs
  const hasValidInitiativeLink =
    /Initiative/i.test(hierarchyContent) &&
    foundUrls.some((url) => validUrlPattern.test(url) && /Initiative/i.test(hierarchyContent))
  const hasValidEpicLink =
    /Epic/i.test(hierarchyContent) &&
    foundUrls.some((url) => validUrlPattern.test(url) && /Epic/i.test(hierarchyContent))

  // Reset the regex lastIndex
  validUrlPattern.lastIndex = 0

  if (ticketType === 'epic') {
    if (!hasValidInitiativeLink) {
      file.message(
        '⚠️ Epic must link to parent Initiative with a valid GitHub issue URL',
      )
    }
  } else if (ticketType === 'feature' || ticketType === 'bug') {
    if (!hasValidInitiativeLink) {
      file.message(
        '⚠️ Issue must link to parent Initiative with a valid GitHub issue URL',
      )
    }
    if (!hasValidEpicLink) {
      file.message(
        '⚠️ Issue must link to parent Epic with a valid GitHub issue URL',
      )
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
          const joinedParagraph = createParagraph(currentParagraph.join('\n'))
          nodes.push(joinedParagraph)
          currentParagraph = []
        }
        nodes.push(createHeading(line.slice(4), 3))
      } else if (line.startsWith('<!--')) {
        if (currentParagraph.length > 0) {
          const joinedParagraph = createParagraph(currentParagraph.join('\n'))
          nodes.push(joinedParagraph)
          currentParagraph = []
        }
        nodes.push({ type: 'html', value: line })
      } else if (line.trim()) {
        currentParagraph.push(line)
      }
    }

    if (currentParagraph.length > 0) {
      const joinedParagraph = createParagraph(currentParagraph.join('\n'))
      nodes.push(joinedParagraph)
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
            children: [
              {
                type: 'text',
                value: line.replace(/^- \[[ x]\] /, '').replace(/^- /, ''),
              },
            ],
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
      if (
        !hasGherkinBlocks(tree) &&
        !hasGherkinPatterns(tree) &&
        ticketType !== 'epic' &&
        ticketType !== 'initiative'
      ) {
        file.message(
          '⚠️ Missing Given/When/Then scenarios (use ```gherkin code blocks)',
        )
      }
    } else {
      // Run validation rules (report mode)
      validateRequiredSections(tree, file, ticketType)
      validateGherkin(tree, file, ticketType)
    }

    validateStoryPointsNotInTitle(tree, file)
    validateHierarchyLinks(tree, file, ticketType)
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
  HIERARCHY_TEMPLATES,
  isTicketFile,
  isTemplateFile,
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
  validateHierarchyLinks,
  createHeading,
  createParagraph,
  createContentNodes,
  fixMissingSections,
}
