#!/usr/bin/env node
/**
 * Generate Ticket Dependency Graph
 *
 * Fetches all open issues from GitHub, parses their yaml metadata,
 * and generates a Mermaid-based dependency graph.
 *
 * Usage: node scripts/generate-dependency-graph.mjs
 */

import { execSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { VALID_REPOS, REPO_ABBREVIATIONS, REPO_DISPLAY_ABBREV, MAIN_REPO } from './remark-lint-ticket/config.mjs'

// ============================================================================
// Cross-Repo Dependency Types
// ============================================================================

/**
 * A dependency reference that can be local (just #123) or cross-repo (TSBO#9)
 * @typedef {Object} DependencyRef
 * @property {string} repo - Repository name (full name, e.g., 'tied-siren-blocking-overlay')
 * @property {number} number - Issue number
 */

/**
 * Parse a dependency reference string into a DependencyRef object.
 * Supports formats:
 * - "123" or "#123" → local repo ref
 * - "repo#123" → cross-repo ref (full name)
 * - "ABBREV#123" → cross-repo ref (abbreviation)
 *
 * @param {string} ref - The reference string
 * @param {string} currentRepo - The current repo context for local refs
 * @returns {DependencyRef|null} Parsed reference or null if invalid
 * @public Exported for testing
 */
export function parseDependencyRef(ref, currentRepo) {
  const trimmed = ref.trim()
  if (!trimmed) return null

  // Check for cross-repo format: "repo#123" or "ABBREV#123"
  const crossRepoMatch = trimmed.match(/^([^#]+)#(\d+)$/)
  if (crossRepoMatch) {
    const [, repoOrAbbrev, numStr] = crossRepoMatch
    const num = parseInt(numStr, 10)
    if (isNaN(num)) return null

    // Resolve abbreviation to full repo name
    const fullRepo = REPO_ABBREVIATIONS[repoOrAbbrev] || repoOrAbbrev
    if (!VALID_REPOS[fullRepo]) {
      console.warn(`  ⚠️  Unknown repo in dependency ref: ${repoOrAbbrev}`)
      return null
    }
    return { repo: fullRepo, number: num }
  }

  // Local ref: just a number (possibly with #)
  const localMatch = trimmed.match(/^#?(\d+)$/)
  if (localMatch) {
    const num = parseInt(localMatch[1], 10)
    if (isNaN(num)) return null
    return { repo: currentRepo, number: num }
  }

  return null
}

/**
 * Create a unique key for a dependency ref (for use in Maps/Sets)
 * @param {DependencyRef} ref
 * @returns {string}
 * @public Exported for testing
 */
export function depRefKey(ref) {
  return `${ref.repo}#${ref.number}`
}

/**
 * Format a dependency ref for display
 * @param {DependencyRef} ref
 * @param {string} currentRepo - Current context repo (for omitting repo prefix on local refs)
 * @returns {string}
 * @public Exported for testing
 */
export function formatDepRef(ref, currentRepo) {
  if (ref.repo === currentRepo) {
    return `#${ref.number}`
  }
  const abbrev = REPO_DISPLAY_ABBREV[ref.repo] || ref.repo
  return `${abbrev}#${ref.number}`
}

const OUTPUT_FILE = 'docs/dependency-graph.md'

// Build repo list from config
const REPOS = Object.entries(VALID_REPOS).map(([name, url]) => ({
  name,
  fullName: url.replace('https://github.com/', ''),
}))

// ============================================================================
// Mermaid Validation
// ============================================================================

function validateMermaid(code) {
  const tmpFile = join(tmpdir(), `mermaid-validate-${Date.now()}.mmd`)
  const outFile = join(tmpdir(), `mermaid-validate-${Date.now()}.svg`)

  try {
    writeFileSync(tmpFile, code)
    execSync(`npx --yes @mermaid-js/mermaid-cli -i "${tmpFile}" -o "${outFile}" 2>&1`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 60000, // 60s timeout for npx download
    })
    return { valid: true }
  } catch (error) {
    const errorMsg = error.stdout || error.stderr || error.message
    // Check for common failure modes
    if (errorMsg.includes('ENOENT') || errorMsg.includes('not found')) {
      return {
        valid: false,
        error: 'mermaid-cli not available. Install with: npm install -g @mermaid-js/mermaid-cli',
      }
    }
    return { valid: false, error: errorMsg }
  } finally {
    try {
      unlinkSync(tmpFile)
      unlinkSync(outFile)
    } catch {}
  }
}

// ============================================================================
// GitHub API
// ============================================================================

function fetchOpenIssues() {
  const allIssues = []

  for (const repo of REPOS) {
    try {
      const result = execSync(
        `gh issue list --repo ${repo.fullName} --state open --limit 100 --json number,title,body,labels`,
        { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
      )
      const issues = JSON.parse(result)
      for (const issue of issues) {
        issue.repo = repo.name
      }
      allIssues.push(...issues)
    } catch {
      // Repo might not exist or have no issues
    }
  }

  return allIssues
}

// ============================================================================
// YAML Parsing
// ============================================================================

/**
 * Extract metadata from issue body YAML block.
 * Note: depends_on and blocks are stored as raw strings here,
 * then parsed into DependencyRef objects by parseTicketDependencies().
 */
function extractMetadata(body) {
  const yamlMatch = body?.match(/```yaml\s*\n([\s\S]*?)```/)
  if (!yamlMatch) return null

  const yamlContent = yamlMatch[1]
  const metadata = {}

  // Parse simple yaml fields
  const repoMatch = yamlContent.match(/^repo:\s*(.+)$/m)
  const pointsMatch = yamlContent.match(/^story_points:\s*(\d+)/m)
  const dependsMatch = yamlContent.match(/^depends_on:\s*\[([^\]]*)\]/m)
  const blocksMatch = yamlContent.match(/^blocks:\s*\[([^\]]*)\]/m)
  const severityMatch = yamlContent.match(/^severity:\s*(\w+)/m)

  // Parse labels array
  const labelsMatch = yamlContent.match(/^labels:\s*\n((?:\s+-\s+.+\n?)+)/m)
  if (labelsMatch) {
    metadata.labels = labelsMatch[1]
      .split('\n')
      .map((l) => l.replace(/^\s+-\s+/, '').trim())
      .filter(Boolean)
  }

  if (repoMatch) metadata.repo = repoMatch[1].trim()
  if (pointsMatch) metadata.story_points = parseInt(pointsMatch[1], 10)
  if (severityMatch) metadata.severity = severityMatch[1].trim()

  // Store raw dependency strings for later parsing with repo context
  if (dependsMatch) {
    metadata.depends_on_raw = dependsMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
  }
  if (blocksMatch) {
    metadata.blocks_raw = blocksMatch[1].split(',').map((s) => s.trim()).filter(Boolean)
  }

  return metadata
}

/**
 * Parse raw dependency strings into DependencyRef objects.
 * Called after we know the ticket's repo context.
 *
 * @param {Object} metadata - The metadata object from extractMetadata
 * @param {string} ticketRepo - The repository this ticket belongs to
 * @returns {Object} metadata with depends_on and blocks as DependencyRef[]
 */
function parseTicketDependencies(metadata, ticketRepo) {
  if (!metadata) return metadata

  if (metadata.depends_on_raw) {
    metadata.depends_on = metadata.depends_on_raw
      .map((ref) => parseDependencyRef(ref, ticketRepo))
      .filter(Boolean)
    delete metadata.depends_on_raw
  }

  if (metadata.blocks_raw) {
    metadata.blocks = metadata.blocks_raw
      .map((ref) => parseDependencyRef(ref, ticketRepo))
      .filter(Boolean)
    delete metadata.blocks_raw
  }

  return metadata
}

function detectTicketType(issue, metadata) {
  const labels = issue.labels?.map((l) => l.name) || metadata?.labels || []

  if (labels.includes('initiative')) return 'initiative'
  if (labels.includes('epic')) return 'epic'
  if (labels.includes('bug')) return 'bug'
  return 'feature'
}

// ============================================================================
// Graph Generation
// ============================================================================

function groupTicketsByType(tickets) {
  const groups = {
    initiative: [],
    epic: [],
    bug: [],
    feature: [],
  }

  for (const ticket of tickets) {
    groups[ticket.type].push(ticket)
  }

  // Sort by number within each group
  for (const type of Object.keys(groups)) {
    groups[type].sort((a, b) => a.number - b.number)
  }

  return groups
}

function groupFeaturesByCategory(features) {
  const categories = {}

  for (const feature of features) {
    // Categorize by title prefix or labels
    let category = 'Other'
    const title = feature.title.toLowerCase()
    const labels = feature.metadata?.labels || []

    if (title.includes('auth') || labels.includes('auth')) {
      category = 'Authentication'
    } else if (labels.includes('blocking') || title.includes('blocking') || title.includes('siren')) {
      category = 'Blocking Architecture'
    }

    if (!categories[category]) categories[category] = []
    categories[category].push(feature)
  }

  return categories
}

function formatStoryPointsMarkdown(points) {
  if (!points) return '-'
  const colorMap = {
    1: '🔵', // blue
    2: '🟢', // green
    3: '🟢', // green
    5: '🟠', // orange
  }
  const emoji = colorMap[points] || '🔴' // red for anything else
  return `${emoji} ${points}`
}

function generateInventoryTable(tickets, type) {
  if (tickets.length === 0) return ''

  const headers = {
    initiative: '| # | Title | SP | Depends On | Blocks |',
    epic: '| # | Title | SP | Depends On | Blocks |',
    bug: '| # | Title | SP | Severity | Related |',
    feature: '| # | Title | SP | Depends On | Blocks |',
  }

  const separator = {
    initiative: '|---|-------|----:|------------|--------|',
    epic: '|---|-------|----:|------------|--------|',
    bug: '|---|-------|----:|----------|---------| ',
    feature: '|---|-------|----:|------------|--------|',
  }

  let table = `${headers[type]}\n${separator[type]}\n`

  for (const t of tickets) {
    const deps = t.metadata?.depends_on?.map((ref) => formatDepRef(ref, t.repo)).join(', ') || '-'
    const blocks = t.metadata?.blocks?.map((ref) => formatDepRef(ref, t.repo)).join(', ') || '-'
    const severity = t.metadata?.severity || 'medium'
    const sp = formatStoryPointsMarkdown(t.metadata?.story_points)

    if (type === 'bug') {
      table += `| #${t.number} | ${t.title} | ${sp} | ${severity} | ${deps} |\n`
    } else {
      table += `| #${t.number} | ${t.title} | ${sp} | ${deps} | ${blocks} |\n`
    }
  }

  return table
}

function categorizeTicket(t) {
  const title = t.title.toLowerCase()
  const labels = t.metadata?.labels || []

  if (t.type === 'initiative') return 'initiative'
  if (t.type === 'epic') return 'epic'
  if (t.type === 'bug') return 'bug'
  if (labels.includes('auth') || title.includes('auth') || title.includes('sign-in') || title.includes('password')) return 'auth'
  if (labels.includes('blocking') || title.includes('blocking') || title.includes('siren') || title.includes('tier') || title.includes('lookout')) return 'blocking'
  return 'other'
}

function getStoryPointsColor(points) {
  if (points === 1) return '#3b82f6' // blue
  if (points === 2 || points === 3) return '#22c55e' // green
  if (points === 5) return '#f97316' // orange
  return '#ef4444' // red
}

function formatStoryPoints(points) {
  if (!points) return ''
  const color = getStoryPointsColor(points)
  return ` <span style='color:${color}'>${points}pt${points > 1 ? 's' : ''}</span>`
}

function calculateDepths(tickets) {
  const depths = new Map()
  // Use composite keys for cross-repo support
  const ticketKeys = new Set(tickets.map((t) => depRefKey({ repo: t.repo, number: t.number })))
  const ticketByKey = new Map(tickets.map((t) => [depRefKey({ repo: t.repo, number: t.number }), t]))

  // Find roots (no dependencies within our set)
  const roots = tickets.filter((t) => {
    const deps = t.metadata?.depends_on || []
    return !deps.some((ref) => ticketKeys.has(depRefKey(ref)))
  })

  // BFS to assign depths
  const queue = roots.map((t) => [depRefKey({ repo: t.repo, number: t.number }), 0])
  while (queue.length > 0) {
    const [key, depth] = queue.shift()
    if (depths.has(key) && depths.get(key) >= depth) continue
    depths.set(key, depth)

    const ticket = ticketByKey.get(key)
    const blocks = ticket?.metadata?.blocks || []
    for (const childRef of blocks) {
      const childKey = depRefKey(childRef)
      if (ticketKeys.has(childKey)) {
        queue.push([childKey, depth + 1])
      }
    }
  }

  return depths
}

// ============================================================================
// Mermaid Diagram Helpers
// ============================================================================

// Base colors per category (hex shades from dark to light)
const CATEGORY_COLOR_SHADES = {
  initiative: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'], // purple
  epic: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],       // blue
  auth: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],       // green
  blocking: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],   // orange
  bug: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'],        // red
  other: ['#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'],      // gray
}

const CATEGORY_LABELS = {
  initiative: 'Initiatives',
  epic: 'Epics',
  auth: 'Authentication',
  blocking: 'Blocking',
  bug: 'Bugs',
  other: 'Other',
}

const CATEGORY_ORDER = ['initiative', 'epic', 'blocking', 'auth', 'bug', 'other']

/**
 * Create a unique Mermaid node ID for a ticket
 * @param {{ repo: string, number: number }} ticket
 * @returns {string}
 */
function createNodeId(ticket) {
  const abbrev = REPO_DISPLAY_ABBREV[ticket.repo] || ticket.repo.replace(/-/g, '')
  return `T_${abbrev}_${ticket.number}`
}

/**
 * Create a unique Mermaid node ID from a DependencyRef
 * @param {DependencyRef} ref
 * @returns {string}
 */
function createNodeIdFromRef(ref) {
  const abbrev = REPO_DISPLAY_ABBREV[ref.repo] || ref.repo.replace(/-/g, '')
  return `T_${abbrev}_${ref.number}`
}

/**
 * Generate Mermaid class definitions for category + depth styling
 * @param {number} maxDepth
 * @returns {string[]}
 */
function generateMermaidStyles(maxDepth) {
  const styles = []
  for (const [category, shades] of Object.entries(CATEGORY_COLOR_SHADES)) {
    for (let d = 0; d <= maxDepth; d++) {
      const idx = Math.min(d, shades.length - 1)
      const fill = shades[idx]
      const stroke = shades[Math.max(0, idx - 1)]
      const textColor = d < 2 ? '#fff' : '#000'
      styles.push(`    classDef ${category}${d} fill:${fill},stroke:${stroke},color:${textColor}`)
    }
  }
  return styles
}

/**
 * Build a mapping of epic keys to their parent initiatives
 * @param {Object[]} tickets
 * @returns {Map<string, Object>}
 */
function buildEpicToInitiativeMap(tickets) {
  const initiatives = tickets.filter((t) => t.type === 'initiative')
  const epicToInitiative = new Map()

  for (const epic of tickets.filter((t) => t.type === 'epic')) {
    const epicKey = depRefKey({ repo: epic.repo, number: epic.number })

    // Check if any initiative blocks this epic
    for (const init of initiatives) {
      const blocksEpic = init.metadata?.blocks?.some(
        (ref) => ref.repo === epic.repo && ref.number === epic.number
      )
      if (blocksEpic) {
        epicToInitiative.set(epicKey, init)
        break
      }
    }

    // Or check if epic depends on an initiative
    if (!epicToInitiative.has(epicKey)) {
      for (const depRef of epic.metadata?.depends_on || []) {
        const parent = initiatives.find(
          (i) => i.repo === depRef.repo && i.number === depRef.number
        )
        if (parent) {
          epicToInitiative.set(epicKey, parent)
          break
        }
      }
    }
  }

  return epicToInitiative
}

/**
 * Sanitize a ticket title for display in Mermaid diagrams
 * @param {string} title
 * @param {number} maxLength
 * @returns {string}
 */
function sanitizeTicketTitle(title, maxLength = 30) {
  const cleaned = title
    .replace(/^\[?\w+\]?\s*/i, '')
    .replace(/^feat\([^)]*\):\s*/i, '')
    .replace(/^fix\([^)]*\):\s*/i, '')
    .replace(/[[\]()]/g, '')
    .replace(/"/g, "'")
  return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned
}

/**
 * Group tickets by category with computed labels and depths
 * @param {Object[]} tickets
 * @param {Map<string, number>} depths
 * @returns {Object}
 */
function groupTicketsByCategory(tickets, depths) {
  const nodesByCategory = {}

  for (const t of tickets) {
    const category = categorizeTicket(t)
    if (!nodesByCategory[category]) nodesByCategory[category] = []

    const label = sanitizeTicketTitle(t.title)
    const ticketKey = depRefKey({ repo: t.repo, number: t.number })
    const depth = depths.get(ticketKey) || 0

    nodesByCategory[category].push({ ticket: t, label, depth })
  }

  return nodesByCategory
}

/**
 * Build Mermaid node definition for a ticket
 * @param {Object} ticket
 * @param {string} label
 * @param {number} depth
 * @param {string} category
 * @param {Map<string, Object>} epicToInitiative
 * @returns {string}
 */
function buildTicketNode(ticket, label, depth, category, epicToInitiative) {
  let safeLabel = label.replace(/"/g, "'")

  // For epics, show parent initiative
  if (category === 'epic') {
    const epicKey = depRefKey({ repo: ticket.repo, number: ticket.number })
    const parentInit = epicToInitiative.get(epicKey)
    if (parentInit) {
      const initName = parentInit.title.replace(/^\[Initiative\]\s*/i, '').substring(0, 15)
      safeLabel = `${safeLabel} [${initName}]`
    }
  }

  const storyPoints = formatStoryPoints(ticket.metadata?.story_points)
  const repoAbbrev = REPO_DISPLAY_ABBREV[ticket.repo] || ticket.repo
  const displayNum = ticket.repo !== MAIN_REPO ? `${repoAbbrev}#${ticket.number}` : `#${ticket.number}`
  const repoLabel = ticket.repo !== MAIN_REPO ? `<br/>📦 ${repoAbbrev}` : ''

  return `        ${createNodeId(ticket)}["${displayNum} ${safeLabel}${storyPoints}${repoLabel}"]:::${category}${depth}`
}

/**
 * Build external node definition for a missing cross-repo dependency
 * @param {DependencyRef} ref
 * @returns {string}
 */
function buildExternalNode(ref) {
  const abbrev = REPO_DISPLAY_ABBREV[ref.repo] || ref.repo
  return `    ${createNodeIdFromRef(ref)}["${abbrev}#${ref.number}<br/>📦 ${abbrev}"]:::other0`
}

function generateMermaidDiagram(tickets) {
  const nodes = []
  const edges = []

  // Calculate depths for shading
  const depths = calculateDepths(tickets)
  const maxDepth = Math.max(...depths.values(), 0)

  // Generate styles
  const styles = generateMermaidStyles(maxDepth)

  // Group tickets by category
  const nodesByCategory = groupTicketsByCategory(tickets, depths)

  // Build initiative lookup for epics
  const epicToInitiative = buildEpicToInitiativeMap(tickets)

  // Build ticket lookup by key for edge validation
  const ticketByKey = new Map(tickets.map((t) => [depRefKey({ repo: t.repo, number: t.number }), t]))

  // Track external nodes already added (Set for O(1) lookup)
  const addedExternalNodes = new Set()

  // Generate subgraph nodes by category
  for (const category of CATEGORY_ORDER) {
    const items = nodesByCategory[category]
    if (!items || items.length === 0) continue

    nodes.push(`    subgraph ${CATEGORY_LABELS[category]}`)
    nodes.push(`        direction TB`)
    for (const { ticket, label, depth } of items) {
      nodes.push(buildTicketNode(ticket, label, depth, category, epicToInitiative))
    }
    nodes.push('    end')
  }

  // Generate edges (including cross-repo edges)
  for (const t of tickets) {
    for (const depRef of t.metadata?.depends_on || []) {
      const depKey = depRefKey(depRef)
      const depTicket = ticketByKey.get(depKey)

      if (depTicket) {
        // Both tickets exist in our set - create solid edge
        edges.push(`    ${createNodeIdFromRef(depRef)} --> ${createNodeId(t)}`)
      } else if (depRef.repo !== t.repo && VALID_REPOS[depRef.repo]) {
        // External cross-repo dependency (different repo, not just a closed local ticket)
        // Show as external node with dashed edge
        const externalNodeId = createNodeIdFromRef(depRef)
        if (!addedExternalNodes.has(externalNodeId)) {
          nodes.push(buildExternalNode(depRef))
          addedExternalNodes.add(externalNodeId)
        }
        edges.push(`    ${externalNodeId} -.-> ${createNodeId(t)}`)
      }
      // Note: If depRef.repo === t.repo but ticket not found, it's likely a closed
      // local ticket - we skip it silently rather than showing as external
    }
  }

  return `\`\`\`mermaid
flowchart LR
${styles.join('\n')}

${nodes.join('\n')}

${edges.join('\n')}
\`\`\``
}

function generateFeaturesDiagram(features, title) {
  if (features.length === 0) return ''

  const nodes = []
  const edges = []

  // Helper to create unique node ID
  const featureNodeId = (f) => {
    const abbrev = REPO_DISPLAY_ABBREV[f.repo] || f.repo.replace(/-/g, '')
    return `F_${abbrev}_${f.number}`
  }

  // Build lookup map
  const featureByKey = new Map(features.map((f) => [depRefKey({ repo: f.repo, number: f.number }), f]))

  for (const f of features) {
    const shortTitle = f.title.length > 25 ? f.title.substring(0, 25) + '...' : f.title
    const storyPoints = formatStoryPoints(f.metadata?.story_points)
    const repoAbbrev = REPO_DISPLAY_ABBREV[f.repo] || f.repo
    const displayNum = f.repo !== MAIN_REPO ? `${repoAbbrev}#${f.number}` : `#${f.number}`
    nodes.push(`    ${featureNodeId(f)}["${displayNum} ${shortTitle}${storyPoints}"]`)

    const deps = f.metadata?.depends_on || []
    for (const depRef of deps) {
      const depKey = depRefKey(depRef)
      if (featureByKey.has(depKey)) {
        const depFeature = featureByKey.get(depKey)
        edges.push(`    ${featureNodeId(depFeature)} --> ${featureNodeId(f)}`)
      }
    }
  }

  return `### ${title}

\`\`\`mermaid
flowchart TD
${nodes.join('\n')}

${edges.join('\n')}
\`\`\``
}

function generateDependencyMatrix(tickets) {
  const blockers = []

  for (const t of tickets) {
    const blocks = t.metadata?.blocks || []
    if (blocks.length > 0) {
      blockers.push({
        ticket: t,
        blocks: blocks,
      })
    }
  }

  if (blockers.length === 0) return ''

  // Sort by repo then number
  blockers.sort((a, b) => {
    const repoCompare = a.ticket.repo.localeCompare(b.ticket.repo)
    if (repoCompare !== 0) return repoCompare
    return a.ticket.number - b.ticket.number
  })

  let table = '| Blocker | Blocks These Issues |\n|---------|---------------------|\n'
  for (const { ticket, blocks } of blockers) {
    const blockerLabel = formatDepRef({ repo: ticket.repo, number: ticket.number }, MAIN_REPO)
    const blockedLabels = blocks.map((ref) => formatDepRef(ref, ticket.repo)).join(', ')
    table += `| ${blockerLabel} | ${blockedLabels} |\n`
  }

  return table
}

function validateBidirectional(tickets) {
  const issues = []

  // Build lookup by key
  const ticketByKey = new Map(tickets.map((t) => [depRefKey({ repo: t.repo, number: t.number }), t]))

  for (const t of tickets) {
    const tRef = { repo: t.repo, number: t.number }
    const tLabel = formatDepRef(tRef, MAIN_REPO)
    const deps = t.metadata?.depends_on || []
    const blocks = t.metadata?.blocks || []

    // Check: if A depends_on B, then B should block A
    for (const depRef of deps) {
      const depKey = depRefKey(depRef)
      const parent = ticketByKey.get(depKey)
      if (parent) {
        const parentBlocksT = parent.metadata?.blocks?.some(
          (ref) => ref.repo === t.repo && ref.number === t.number
        )
        if (!parentBlocksT) {
          const depLabel = formatDepRef(depRef, MAIN_REPO)
          issues.push(`${depLabel} should have blocks: [${t.number}] (because ${tLabel} depends on it)`)
        }
      }
    }

    // Check: if A blocks B, then B should depend_on A
    for (const blockedRef of blocks) {
      const blockedKey = depRefKey(blockedRef)
      const child = ticketByKey.get(blockedKey)
      if (child) {
        const childDependsOnT = child.metadata?.depends_on?.some(
          (ref) => ref.repo === t.repo && ref.number === t.number
        )
        if (!childDependsOnT) {
          const blockedLabel = formatDepRef(blockedRef, MAIN_REPO)
          issues.push(`${blockedLabel} should have depends_on: [${t.number}] (because ${tLabel} blocks it)`)
        }
      }
    }
  }

  return issues
}

// ============================================================================
// ASCII Box Graph Helpers
// ============================================================================

/**
 * Build the dependency tree context from tickets
 * @param {Object[]} tickets
 * @returns {{ ticketByKey: Map, ticketKeys: Set, children: Map, roots: string[] }}
 */
function buildAsciiTreeContext(tickets) {
  const withDeps = tickets.filter(
    (t) => (t.metadata?.depends_on?.length || 0) > 0 || (t.metadata?.blocks?.length || 0) > 0,
  )

  const ticketByKey = new Map(withDeps.map((t) => [depRefKey({ repo: t.repo, number: t.number }), t]))
  const ticketKeys = new Set(ticketByKey.keys())

  const children = new Map()
  for (const t of withDeps) {
    const key = depRefKey({ repo: t.repo, number: t.number })
    children.set(key, t.metadata?.blocks || [])
  }

  // Find roots (tickets with no parent in our set)
  const hasParent = new Set()
  for (const t of withDeps) {
    for (const blockRef of t.metadata?.blocks || []) {
      hasParent.add(depRefKey(blockRef))
    }
  }
  const roots = withDeps
    .filter((t) => !hasParent.has(depRefKey({ repo: t.repo, number: t.number })))
    .map((t) => depRefKey({ repo: t.repo, number: t.number }))

  return { ticketByKey, ticketKeys, children, roots }
}

/**
 * Format a ticket key as a display label for ASCII output
 * @param {string} key
 * @param {Map} ticketByKey
 * @returns {string}
 */
function formatAsciiLabel(key, ticketByKey) {
  const ticket = ticketByKey.get(key)
  if (ticket) {
    return formatDepRef({ repo: ticket.repo, number: ticket.number }, MAIN_REPO)
  }
  return key
}

/**
 * Render an ASCII box for a ticket label
 * @param {string} label - The display label
 * @param {boolean} hasChildren - Whether this node has children
 * @param {string} indent - Current indentation
 * @returns {string[]} - Lines to add
 */
function renderAsciiBox(label, hasChildren, indent) {
  const labelPad = label.length > 5 ? label : label.padStart(5)
  const lines = []

  lines.push(`${indent}┌${'─'.repeat(labelPad.length + 2)}┐`)
  lines.push(`${indent}│ ${labelPad} │`)

  if (hasChildren) {
    lines.push(`${indent}└──┬${'─'.repeat(labelPad.length - 1)}┘`)
    lines.push(`${indent}   │`)
  } else {
    lines.push(`${indent}└${'─'.repeat(labelPad.length + 2)}┘`)
  }

  return lines
}

/**
 * Recursively render the ASCII tree
 * @param {string} key - Current node key
 * @param {string} indent - Current indentation
 * @param {Object} context - Tree context from buildAsciiTreeContext
 * @param {Set} printed - Set of already printed keys
 * @param {string[]} lines - Output lines array
 */
function renderAsciiTree(key, indent, context, printed, lines) {
  const { ticketByKey, ticketKeys, children } = context

  if (printed.has(key)) {
    lines.push(`${indent}└─▶ ${formatAsciiLabel(key, ticketByKey)} (↑)`)
    return
  }
  printed.add(key)

  const blockRefs = children.get(key) || []
  const kids = blockRefs
    .map((ref) => depRefKey(ref))
    .filter((k) => ticketKeys.has(k))

  const label = formatAsciiLabel(key, ticketByKey)

  // Render the box
  const boxLines = renderAsciiBox(label, kids.length > 0, indent)
  lines.push(...boxLines)

  // Render children
  kids.forEach((kid, i) => {
    const isLast = i === kids.length - 1
    const connector = isLast ? '└─▶ ' : '├─▶ '
    const childIndent = indent + (isLast ? '    ' : '│   ')

    if (printed.has(kid)) {
      lines.push(`${indent}   ${connector}${formatAsciiLabel(kid, ticketByKey)} (↑)`)
    } else {
      lines.push(`${indent}   ${connector}`)
      renderAsciiTree(kid, childIndent, context, printed, lines)
    }
  })
}

function generateAsciiGraph(tickets) {
  const context = buildAsciiTreeContext(tickets)

  if (context.roots.length === 0) return 'No dependencies found.'

  const printed = new Set()
  const lines = []

  context.roots.forEach((root, i) => {
    if (i > 0) lines.push('\n' + '─'.repeat(40) + '\n')
    renderAsciiTree(root, '', context, printed, lines)
  })

  return lines.join('\n')
}

// ============================================================================
// Main
// ============================================================================

function generateMarkdown(tickets) {
  const groups = groupTicketsByType(tickets)
  const featureCategories = groupFeaturesByCategory(groups.feature)
  const validationIssues = validateBidirectional(tickets)
  const today = new Date().toISOString().split('T')[0]

  let md = `# Ticket Dependency Graph

This document visualizes the dependencies between GitHub issues to help with planning and prioritization.

> **Auto-generated** from GitHub issue metadata. Do not edit manually.
> Last updated: ${today}

`

  // Validation warnings
  if (validationIssues.length > 0) {
    md += `## Validation Warnings

The following bidirectional reference issues were detected:

${validationIssues.map((i) => `- ${i}`).join('\n')}

---

`
  }

  // Complete inventory
  md += `## Complete Ticket Inventory

`

  if (groups.initiative.length > 0) {
    md += `### Initiatives (${groups.initiative.length})
${generateInventoryTable(groups.initiative, 'initiative')}

`
  }

  if (groups.epic.length > 0) {
    md += `### Epics (${groups.epic.length})
${generateInventoryTable(groups.epic, 'epic')}

`
  }

  if (groups.bug.length > 0) {
    md += `### Bugs (${groups.bug.length})
${generateInventoryTable(groups.bug, 'bug')}

`
  }

  // Features by category
  for (const [category, features] of Object.entries(featureCategories)) {
    md += `### Features - ${category} (${features.length})
${generateInventoryTable(features, 'feature')}

`
  }

  // Overview diagram
  md += `---

## Overview Diagram

${generateMermaidDiagram(tickets)}

`

  // Feature diagrams by category
  for (const [category, features] of Object.entries(featureCategories)) {
    if (features.length > 1 && features.some((f) => f.metadata?.depends_on?.length > 0)) {
      md += `
${generateFeaturesDiagram(features, `Features: ${category}`)}

`
    }
  }

  // Dependency matrix
  md += `---

## Dependency Matrix

Quick reference showing what blocks what:

${generateDependencyMatrix(tickets)}

---

## Valid Repositories

| Repo | URL |
|------|-----|
${Object.entries(VALID_REPOS)
  .map(([name, url]) => `| ${name} | ${url} |`)
  .join('\n')}

---

## Legend

- **Solid arrows (\`-->\`)**: Direct dependency (must complete first)
- **Initiatives (I)**: Strategic goals
- **Epics (E)**: Large features with multiple stories
- **Features (F)**: Individual stories/tasks
- **Subgraphs**: Logical groupings

### Story Points

| Points | Color |
|-------:|-------|
| 1 | 🔵 Blue |
| 2-3 | 🟢 Green |
| 5 | 🟠 Orange |
| 8+ | 🔴 Red |

---

*Auto-generated on ${today} from GitHub issue metadata*
`

  return md
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Main function to run the dependency graph generator
 */
function main() {
  const asciiMode = process.argv.includes('--ascii')
  const liveMode = process.argv.includes('--live')

  if (!asciiMode) {
    console.log(`Fetching open issues from ${REPOS.length} repos...`)
  }
  const issues = fetchOpenIssues()

  if (!asciiMode) {
    const repoCounts = {}
    for (const issue of issues) {
      repoCounts[issue.repo] = (repoCounts[issue.repo] || 0) + 1
    }
    console.log(`Found ${issues.length} open issues:`)
    for (const [repo, count] of Object.entries(repoCounts)) {
      console.log(`  - ${repo}: ${count}`)
    }
  }

  const tickets = issues.map((issue) => {
    const ticketRepo = issue.repo || MAIN_REPO
    const metadata = parseTicketDependencies(extractMetadata(issue.body), ticketRepo)
    return {
      number: issue.number,
      title: issue.title,
      labels: issue.labels,
      repo: ticketRepo,
      metadata,
      type: detectTicketType(issue, metadata),
    }
  })

  if (liveMode) {
    // Generate mermaid.live URL
    const mermaidCode = generateMermaidDiagram(tickets).replace(/```mermaid\n/, '').replace(/\n```$/, '')

    // Validate before opening
    console.log('Validating mermaid syntax...')
    const validation = validateMermaid(mermaidCode)
    if (!validation.valid) {
      console.error('Mermaid syntax error:')
      console.error(validation.error)
      console.error('\nGenerated code:')
      console.error(mermaidCode)
      process.exit(1)
    }
    console.log('Syntax valid')

    const state = JSON.stringify({ code: mermaidCode, mermaid: { theme: 'default' }, autoSync: true, updateDiagram: true })
    const encoded = Buffer.from(state).toString('base64url')
    const url = `https://mermaid.live/edit#base64:${encoded}`
    console.log('Opening mermaid.live...')
    execSync(`open "${url}"`)
  } else if (asciiMode) {
    // ASCII box graph
    console.log(generateAsciiGraph(tickets))
  } else {
    // Markdown mode: write to file
    console.log('Generating dependency graph...')
    const markdown = generateMarkdown(tickets)
    writeFileSync(OUTPUT_FILE, markdown)
    console.log(`Written to ${OUTPUT_FILE}`)
  }

  // Report validation issues
  const validationIssues = validateBidirectional(tickets)
  if (validationIssues.length > 0) {
    console.log('\nValidation warnings:')
    validationIssues.forEach((i) => console.log(`  - ${i}`))
  }
}

// Only run main when executed directly (not when imported for testing)
const isMainModule = process.argv[1]?.endsWith('generate-dependency-graph.mjs')
if (isMainModule) {
  main()
}
