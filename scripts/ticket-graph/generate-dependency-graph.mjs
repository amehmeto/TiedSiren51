#!/usr/bin/env node
/**
 * Generate Ticket Dependency Graph
 *
 * Fetches all issues from GitHub, builds a dependency graph,
 * validates it, and generates output (Mermaid diagram, markdown, or ASCII).
 *
 * Usage:
 *   node scripts/generate-dependency-graph.mjs          # Generate markdown
 *   node scripts/generate-dependency-graph.mjs --live   # Open in mermaid.live
 *   node scripts/generate-dependency-graph.mjs --ascii  # ASCII output
 *   node scripts/generate-dependency-graph.mjs --json   # Export graph as JSON
 *
 * Architecture:
 *   1. Fetch issues from GitHub (github-fetcher.mjs)
 *   2. Build TicketGraph (ticket-graph.mjs)
 *   3. Validate graph (cycles, dangling refs, etc.)
 *   4. Render to output format (mermaid-renderer.mjs or markdown)
 */

import { execSync } from 'node:child_process'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { writeFileSync, unlinkSync } from 'node:fs'

const execAsync = promisify(exec)

import { VALID_REPOS, REPO_ABBREVIATIONS, REPO_DISPLAY_ABBREV, MAIN_REPO, BLOCKING_REPOS, CATEGORY_KEYWORDS } from '../remark-lint-ticket/config.mjs'
import {
  buildGraphFromTickets,
  fetchAllIssues,
  transformIssuesToTickets,
  parseDependencyRef as parseDependencyRefBase,
} from './index.mjs'
import { renderMermaidDiagram, validateMermaid } from './mermaid-renderer.mjs'

// Re-export parsing functions with config bound (for backward compatibility)
export function parseDependencyRef(ref, currentRepo) {
  return parseDependencyRefBase(ref, currentRepo, REPO_ABBREVIATIONS, VALID_REPOS)
}

export function depRefKey(ref) {
  return `${ref.repo}#${ref.number}`
}

// ============================================================================
// Configuration
// ============================================================================

const OUTPUT_FILE = 'docs/dependency-graph.md'

const REPOS = Object.entries(VALID_REPOS).map(([name, url]) => ({
  name,
  fullName: url.replace('https://github.com/', ''),
}))

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a unique key for a ticket (repo#number format)
 */
function formatTicketId(repo, number) {
  return `${repo}#${number}`
}

/**
 * Format a dependency ref for display
 */
function formatDepRef(ref, currentRepo) {
  if (ref.repo === currentRepo) {
    return `#${ref.number}`
  }
  const abbrev = REPO_DISPLAY_ABBREV[ref.repo] || ref.repo
  return `${abbrev}#${ref.number}`
}

function formatStoryPointsMarkdown(points) {
  if (!points) return '-'
  const colorMap = {
    1: '🔵',
    2: '🟢',
    3: '🟢',
    5: '🟠',
  }
  const emoji = colorMap[points] || '🔴'
  return `${emoji} ${points}`
}

// ============================================================================
// Inventory Tables
// ============================================================================

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

// ============================================================================
// Ticket Grouping
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

  for (const type of Object.keys(groups)) {
    groups[type].sort((a, b) => a.number - b.number)
  }

  return groups
}

function groupFeaturesByCategory(features) {
  const categories = {}

  for (const feature of features) {
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

// ============================================================================
// Dependency Matrix
// ============================================================================

function generateDependencyMatrix(tickets) {
  const blockers = []

  for (const t of tickets) {
    const blocks = t.metadata?.blocks || []
    if (blocks.length > 0) {
      blockers.push({ ticket: t, blocks })
    }
  }

  if (blockers.length === 0) return ''

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

// ============================================================================
// ASCII Graph with ANSI Colors
// ============================================================================

// ANSI color codes
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  strikethrough: '\x1b[9m',
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
  // Bright foreground
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
}

// Status styling
const STATUS_STYLES = {
  done: { emoji: '✅', color: ANSI.gray, style: ANSI.dim + ANSI.strikethrough },
  in_progress: { emoji: '🔄', color: ANSI.brightYellow, style: ANSI.bold },
  todo: { emoji: '📝', color: ANSI.white, style: '' },
}

// Category colors
const CATEGORY_COLORS = {
  initiative: ANSI.brightMagenta,
  epic: ANSI.brightBlue,
  auth: ANSI.brightGreen,
  blocking: ANSI.brightRed,
  bug: ANSI.red,
  other: ANSI.white,
}

function categorizeTicket(ticket, epicCategories) {
  if (ticket.type === 'initiative') return 'initiative'
  if (ticket.type === 'epic') return 'epic'
  if (ticket.type === 'bug') return 'bug'

  if (BLOCKING_REPOS.includes(ticket.repo)) return 'blocking'

  // Check parent epic category
  const parentEpic = ticket.metadata?.parentEpic
  if (parentEpic && epicCategories.has(parentEpic)) {
    return epicCategories.get(parentEpic)
  }

  const title = ticket.title.toLowerCase()
  const labels = ticket.metadata?.labels || []

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => title.includes(kw) || labels.some(l => l.includes(kw)))) {
      return category
    }
  }

  return 'other'
}

function buildEpicCategories(tickets) {
  const epicCategories = new Map()

  for (const ticket of tickets) {
    if (ticket.type !== 'epic') continue

    const title = ticket.title.toLowerCase()
    const labels = ticket.metadata?.labels || []

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(kw => title.includes(kw) || labels.some(l => l.includes(kw)))) {
        epicCategories.set(ticket.number, category)
        break
      }
    }

    if (!epicCategories.has(ticket.number)) {
      epicCategories.set(ticket.number, 'other')
    }
  }

  return epicCategories
}

function truncateTitle(title, maxLen = 40) {
  // Remove common prefixes
  let cleaned = title
    .replace(/^\[?\w+\]?\s*/i, '')           // [Epic], [Bug], etc.
    .replace(/^feat\([^)]*\):\s*/i, '')      // feat(scope):
    .replace(/^fix\([^)]*\):\s*/i, '')       // fix(scope):
    .replace(/^refactor\([^)]*\):\s*/i, '')  // refactor(scope):
    .replace(/^chore\([^)]*\):\s*/i, '')     // chore(scope):
    .replace(/^test\([^)]*\):\s*/i, '')      // test(scope):
    .replace(/^\([^)]*\):\s*/i, '')          // (scope): without type prefix

  if (cleaned.length > maxLen) {
    return cleaned.substring(0, maxLen - 3) + '...'
  }
  return cleaned
}

function formatAsciiTicket(ticket, epicCategories) {
  const status = ticket.status || 'todo'
  const statusStyle = STATUS_STYLES[status]
  const category = categorizeTicket(ticket, epicCategories)
  const categoryColor = CATEGORY_COLORS[category]

  const repoAbbrev = REPO_DISPLAY_ABBREV[ticket.repo] || ticket.repo
  const id = `${repoAbbrev}#${ticket.number}`
  const title = truncateTitle(ticket.title)
  const sp = ticket.metadata?.story_points ? ` [${ticket.metadata.story_points}sp]` : ''

  const emoji = statusStyle.emoji
  const idColored = `${categoryColor}${id}${ANSI.reset}`

  let titleColored = title
  if (status === 'done') {
    titleColored = `${ANSI.gray}${ANSI.dim}${title}${ANSI.reset}`
  } else if (status === 'in_progress') {
    titleColored = `${ANSI.bold}${ANSI.brightYellow}${title}${ANSI.reset}`
  }

  const spColored = sp ? `${ANSI.cyan}${sp}${ANSI.reset}` : ''

  return `${emoji} ${idColored} ${titleColored}${spColored}`
}

function buildAsciiTreeContext(tickets) {
  const withDeps = tickets.filter(
    (t) => (t.metadata?.depends_on?.length || 0) > 0 || (t.metadata?.blocks?.length || 0) > 0,
  )

  const ticketByKey = new Map(withDeps.map((t) => [formatTicketId(t.repo, t.number), t]))
  const ticketKeys = new Set(ticketByKey.keys())
  const allTicketsByKey = new Map(tickets.map((t) => [formatTicketId(t.repo, t.number), t]))

  const children = new Map()
  for (const t of withDeps) {
    const key = formatTicketId(t.repo, t.number)
    children.set(key, t.metadata?.blocks || [])
  }

  const hasParent = new Set()
  for (const t of withDeps) {
    for (const blockRef of t.metadata?.blocks || []) {
      hasParent.add(formatTicketId(blockRef.repo, blockRef.number))
    }
  }
  const roots = withDeps
    .filter((t) => !hasParent.has(formatTicketId(t.repo, t.number)))
    .map((t) => formatTicketId(t.repo, t.number))

  return { ticketByKey, ticketKeys, children, roots, allTicketsByKey }
}

function renderAsciiTree(key, prefix, context, epicCategories, printed, lines, connector = '') {
  const { ticketByKey, ticketKeys, children, allTicketsByKey } = context
  const ticket = ticketByKey.get(key) || allTicketsByKey.get(key)

  // Handle already printed (backreference)
  if (printed.has(key)) {
    const repoAbbrev = ticket ? (REPO_DISPLAY_ABBREV[ticket.repo] || ticket.repo) : ''
    const num = ticket ? ticket.number : key.split('#')[1]
    lines.push(`${prefix}${connector}${ANSI.gray}↑ ${repoAbbrev}#${num} (see above)${ANSI.reset}`)
    return
  }
  printed.add(key)

  // Format and print this node
  const formatted = ticket ? formatAsciiTicket(ticket, epicCategories) : `${ANSI.gray}${key}${ANSI.reset}`
  lines.push(`${prefix}${connector}${formatted}`)

  // Get children
  const blockRefs = children.get(key) || []
  const kids = blockRefs
    .map((ref) => formatTicketId(ref.repo, ref.number))
    .filter((k) => ticketKeys.has(k))

  // Render children
  kids.forEach((kid, i) => {
    const isLast = i === kids.length - 1
    const childConnector = isLast ? '└─ ' : '├─ '
    const childPrefix = prefix + (connector ? (connector.startsWith('└') ? '   ' : '│  ') : '')
    renderAsciiTree(kid, childPrefix, context, epicCategories, printed, lines, childConnector)
  })
}

function generateAsciiGraph(tickets) {
  const epicCategories = buildEpicCategories(tickets)
  const context = buildAsciiTreeContext(tickets)

  if (context.roots.length === 0) {
    return `${ANSI.yellow}No dependencies found.${ANSI.reset}`
  }

  const lines = []

  // Header
  lines.push(`${ANSI.bold}${ANSI.cyan}═══════════════════════════════════════════════════════════════${ANSI.reset}`)
  lines.push(`${ANSI.bold}${ANSI.cyan}                    TICKET DEPENDENCY GRAPH${ANSI.reset}`)
  lines.push(`${ANSI.bold}${ANSI.cyan}═══════════════════════════════════════════════════════════════${ANSI.reset}`)
  lines.push('')

  // Legend
  lines.push(`${ANSI.bold}Legend:${ANSI.reset}`)
  lines.push(`  ${STATUS_STYLES.done.emoji} Done    ${STATUS_STYLES.in_progress.emoji} In Progress    ${STATUS_STYLES.todo.emoji} To Do`)
  lines.push(`  ${CATEGORY_COLORS.initiative}■${ANSI.reset} Initiative  ${CATEGORY_COLORS.epic}■${ANSI.reset} Epic  ${CATEGORY_COLORS.auth}■${ANSI.reset} Auth  ${CATEGORY_COLORS.blocking}■${ANSI.reset} Blocking  ${CATEGORY_COLORS.bug}■${ANSI.reset} Bug`)
  lines.push('')
  lines.push(`${ANSI.bold}${ANSI.cyan}───────────────────────────────────────────────────────────────${ANSI.reset}`)
  lines.push('')

  // Separate tickets by type
  const initiatives = tickets.filter(t => t.type === 'initiative')
  const epics = tickets.filter(t => t.type === 'epic')
  const features = tickets.filter(t => t.type === 'feature')

  // Group features by parent epic
  const featuresByEpic = new Map()

  for (const ticket of features) {
    const parentEpic = ticket.metadata?.parentEpic
    if (parentEpic) {
      if (!featuresByEpic.has(parentEpic)) {
        featuresByEpic.set(parentEpic, [])
      }
      featuresByEpic.get(parentEpic).push(ticket)
    }
  }

  const printed = new Set()

  // Section: Initiatives (if they have dependencies)
  const initiativesWithDeps = initiatives.filter(t => context.ticketKeys.has(formatTicketId(t.repo, t.number)))
  if (initiativesWithDeps.length > 0) {
    lines.push(`${ANSI.bold}${CATEGORY_COLORS.initiative}━━━ INITIATIVES ━━━${ANSI.reset}`)
    lines.push('')
    for (const init of initiativesWithDeps) {
      const key = formatTicketId(init.repo, init.number)
      if (!printed.has(key)) {
        renderAsciiTree(key, '', context, epicCategories, printed, lines, '')
        lines.push('')
      }
    }
  }

  // Section: Epics with their children
  const epicsWithContent = epics.filter(epic => {
    const epicKey = formatTicketId(epic.repo, epic.number)
    const children = featuresByEpic.get(epic.number) || []
    const childrenWithDeps = children.filter(t => context.ticketKeys.has(formatTicketId(t.repo, t.number)))
    return context.ticketKeys.has(epicKey) || childrenWithDeps.length > 0
  })

  if (epicsWithContent.length > 0) {
    lines.push(`${ANSI.bold}${CATEGORY_COLORS.epic}━━━ EPICS ━━━${ANSI.reset}`)
    lines.push('')

    for (const epic of epicsWithContent) {
      const epicKey = formatTicketId(epic.repo, epic.number)
      const epicChildren = featuresByEpic.get(epic.number) || []
      const childrenWithDeps = epicChildren.filter(t => context.ticketKeys.has(formatTicketId(t.repo, t.number)))

      // Epic header
      const epicTitle = truncateTitle(epic.title, 45)
      const epicStatus = STATUS_STYLES[epic.status || 'todo']
      lines.push(`${ANSI.bold}${CATEGORY_COLORS.epic}┌─ #${epic.number}: ${epicTitle} ${epicStatus.emoji}${ANSI.reset}`)

      // If epic itself has dependencies, show it in the tree
      if (context.ticketKeys.has(epicKey) && !printed.has(epicKey)) {
        renderAsciiTree(epicKey, `${CATEGORY_COLORS.epic}│${ANSI.reset} `, context, epicCategories, printed, lines, '')
      }

      // Render children that are roots (not blocked by anything in the tree)
      const childRoots = childrenWithDeps.filter(child => {
        const childKey = formatTicketId(child.repo, child.number)
        return context.roots.includes(childKey) && !printed.has(childKey)
      })

      for (const child of childRoots) {
        const childKey = formatTicketId(child.repo, child.number)
        renderAsciiTree(childKey, `${CATEGORY_COLORS.epic}│${ANSI.reset} `, context, epicCategories, printed, lines, '')
      }

      lines.push(`${CATEGORY_COLORS.epic}└${'─'.repeat(50)}${ANSI.reset}`)
      lines.push('')
    }
  }

  // Section: Ungrouped features (features without parent epic but with dependencies)
  const orphanRoots = context.roots.filter(r => {
    if (printed.has(r)) return false
    const ticket = context.allTicketsByKey.get(r)
    return ticket && ticket.type === 'feature' && !ticket.metadata?.parentEpic
  })

  if (orphanRoots.length > 0) {
    lines.push(`${ANSI.bold}${ANSI.white}━━━ UNGROUPED FEATURES ━━━${ANSI.reset}`)
    lines.push('')
    for (const root of orphanRoots) {
      renderAsciiTree(root, '', context, epicCategories, printed, lines, '')
      lines.push('')
    }
  }

  // Stats footer
  lines.push(`${ANSI.bold}${ANSI.cyan}───────────────────────────────────────────────────────────────${ANSI.reset}`)
  const stats = {
    total: tickets.length,
    done: tickets.filter(t => t.status === 'done').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    todo: tickets.filter(t => t.status === 'todo').length,
  }
  lines.push(`${ANSI.bold}Stats:${ANSI.reset} ${stats.total} tickets | ✅ ${stats.done} done | 🔄 ${stats.inProgress} in progress | 📝 ${stats.todo} todo`)

  return lines.join('\n')
}

// ============================================================================
// Markdown Generation
// ============================================================================

function generateMarkdown(tickets, graph, validationErrors) {
  const groups = groupTicketsByType(tickets)
  const featureCategories = groupFeaturesByCategory(groups.feature)
  const today = new Date().toISOString().split('T')[0]

  let md = `# Ticket Dependency Graph

This document visualizes the dependencies between GitHub issues to help with planning and prioritization.

> **Auto-generated** from GitHub issue metadata. Do not edit manually.
> Last updated: ${today}

`

  // Validation warnings
  if (validationErrors.length > 0) {
    md += `## Validation Warnings

The following issues were detected in the dependency graph:

${validationErrors.map((e) => `- **${e.type}**: ${e.message}`).join('\n')}

---

`
  }

  // Graph statistics
  const stats = {
    nodes: graph.nodes.size,
    edges: graph.edges.length,
    roots: graph.getRoots().length,
    leaves: graph.getLeaves().length,
    orphans: graph.getOrphans().length,
  }

  const criticalPath = graph.getCriticalPath()

  md += `## Graph Statistics

| Metric | Value |
|--------|-------|
| Total Nodes | ${stats.nodes} |
| Total Edges | ${stats.edges} |
| Root Nodes (no dependencies) | ${stats.roots} |
| Leaf Nodes (nothing depends on them) | ${stats.leaves} |
| Orphan Nodes (isolated) | ${stats.orphans} |
| Critical Path Length | ${criticalPath.length} |

`

  if (criticalPath.path.length > 0) {
    md += `### Critical Path

The longest dependency chain in the graph:

\`${criticalPath.path.join(' → ')}\`

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

  for (const [category, features] of Object.entries(featureCategories)) {
    md += `### Features - ${category} (${features.length})
${generateInventoryTable(features, 'feature')}

`
  }

  // Overview diagram
  md += `---

## Overview Diagram

${renderMermaidDiagram(graph, { repoDisplayAbbrev: REPO_DISPLAY_ABBREV })}

`

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

### Status

| Emoji | Status | Style |
|-------|--------|-------|
| ✅ | Done | Grayscale, dashed border |
| 🔄 | In Progress | Bright, thick border |
| 📝 | To Do | Normal colors |

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
// Bidirectional Mismatch Fixing
// ============================================================================

/**
 * Fix bidirectional mismatches by updating GitHub issues
 * @param {Array} errors - Validation errors from buildGraphFromTickets
 * @param {Map} tickets - Tickets map for lookup
 * @param {Object} validRepos - Valid repos map for building full repo names
 * @returns {Promise<{fixed: number, failed: string[]}>}
 */
async function fixBidirectionalMismatches(errors, tickets, validRepos) {
  const bidirectionalErrors = errors.filter((e) => e.type === 'bidirectional_mismatch')
  if (bidirectionalErrors.length === 0) {
    return { fixed: 0, failed: [] }
  }

  // Group fixes by target issue
  const fixesByIssue = new Map()

  for (const error of bidirectionalErrors) {
    const targetId = error.nodes[0] // The issue that needs updating
    const [targetRepo, targetNumberStr] = targetId.split('#')
    const targetNumber = parseInt(targetNumberStr, 10)

    if (!fixesByIssue.has(targetId)) {
      fixesByIssue.set(targetId, { repo: targetRepo, number: targetNumber, addBlocks: [], addDependsOn: [] })
    }

    const fixes = fixesByIssue.get(targetId)
    if (error.fix?.addBlocks) {
      fixes.addBlocks.push(...error.fix.addBlocks)
    }
    if (error.fix?.addDependsOn) {
      fixes.addDependsOn.push(...error.fix.addDependsOn)
    }
  }

  let fixed = 0
  const failed = []

  for (const [issueId, fixes] of fixesByIssue) {
    try {
      const fullRepoName = validRepos[fixes.repo]?.replace('https://github.com/', '')
      if (!fullRepoName) {
        failed.push(`${issueId}: unknown repo ${fixes.repo}`)
        continue
      }

      // Fetch current issue body
      const { stdout } = await execAsync(
        `gh issue view ${fixes.number} --repo ${fullRepoName} --json body -q '.body'`,
      )
      const currentBody = stdout.trim()

      // Update the YAML block
      const updatedBody = updateYamlMetadata(currentBody, fixes.addBlocks, fixes.addDependsOn)

      if (updatedBody === currentBody) {
        console.log(`  - ${issueId}: no changes needed`)
        continue
      }

      // Update the issue
      const tempFile = `/tmp/issue-body-${fixes.number}.md`
      writeFileSync(tempFile, updatedBody)
      try {
        await execAsync(`gh issue edit ${fixes.number} --repo ${fullRepoName} --body-file "${tempFile}"`)
      } finally {
        try {
          unlinkSync(tempFile)
        } catch {
          // Ignore cleanup errors
        }
      }

      console.log(`  - ${issueId}: updated (added blocks: [${fixes.addBlocks.join(', ')}], depends_on: [${fixes.addDependsOn.join(', ')}])`)
      fixed++
    } catch (err) {
      failed.push(`${issueId}: ${err.message}`)
    }
  }

  return { fixed, failed }
}

/**
 * Update YAML metadata in issue body to add missing blocks/depends_on
 */
function updateYamlMetadata(body, addBlocks, addDependsOn) {
  if (!body) return body

  const yamlMatch = body.match(/(```yaml\s*\n)([\s\S]*?)(```)/)

  if (!yamlMatch) {
    // No YAML block exists, create one
    const newYaml = []
    if (addBlocks.length > 0) {
      newYaml.push(`blocks: [${addBlocks.join(', ')}]`)
    }
    if (addDependsOn.length > 0) {
      newYaml.push(`depends_on: [${addDependsOn.join(', ')}]`)
    }
    if (newYaml.length === 0) return body

    return `\`\`\`yaml\n${newYaml.join('\n')}\n\`\`\`\n\n${body}`
  }

  let yamlContent = yamlMatch[2]

  // Update or add blocks
  if (addBlocks.length > 0) {
    const blocksMatch = yamlContent.match(/^blocks:\s*\[([^\]]*)\]/m)
    if (blocksMatch) {
      // Parse existing blocks and merge
      const existing = blocksMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
      const merged = [...new Set([...existing, ...addBlocks])].sort((a, b) => a - b)
      yamlContent = yamlContent.replace(/^blocks:\s*\[[^\]]*\]/m, `blocks: [${merged.join(', ')}]`)
    } else {
      // Add new blocks line
      yamlContent = yamlContent.trimEnd() + `\nblocks: [${addBlocks.join(', ')}]\n`
    }
  }

  // Update or add depends_on
  if (addDependsOn.length > 0) {
    const dependsMatch = yamlContent.match(/^depends_on:\s*\[([^\]]*)\]/m)
    if (dependsMatch) {
      // Parse existing depends_on and merge
      const existing = dependsMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map(Number)
      const merged = [...new Set([...existing, ...addDependsOn])].sort((a, b) => a - b)
      yamlContent = yamlContent.replace(/^depends_on:\s*\[[^\]]*\]/m, `depends_on: [${merged.join(', ')}]`)
    } else {
      // Add new depends_on line
      yamlContent = yamlContent.trimEnd() + `\ndepends_on: [${addDependsOn.join(', ')}]\n`
    }
  }

  return body.replace(yamlMatch[0], yamlMatch[1] + yamlContent + yamlMatch[3])
}

// ============================================================================
// Main Entry Point
// ============================================================================

async function main() {
  const asciiMode = process.argv.includes('--ascii')
  const liveMode = process.argv.includes('--live')
  const jsonMode = process.argv.includes('--json')

  // Step 1: Fetch issues from GitHub
  if (!asciiMode && !jsonMode) {
    console.log(`Fetching issues from ${REPOS.length} repos in parallel...`)
  }
  const issues = await fetchAllIssues(REPOS)

  // Step 2: Transform to tickets
  const tickets = transformIssuesToTickets(issues, MAIN_REPO, REPO_ABBREVIATIONS, VALID_REPOS)

  if (!asciiMode && !jsonMode) {
    const repoCounts = {}
    const statusCounts = { done: 0, in_progress: 0, todo: 0 }
    for (const ticket of tickets) {
      repoCounts[ticket.repo] = (repoCounts[ticket.repo] || 0) + 1
      statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1
    }
    console.log(`Found ${tickets.length} issues:`)
    for (const [repo, count] of Object.entries(repoCounts)) {
      console.log(`  - ${repo}: ${count}`)
    }
    console.log(`Status breakdown: ✅ ${statusCounts.done} done, 🔄 ${statusCounts.in_progress} in progress, 📝 ${statusCounts.todo} todo`)
  }

  // Step 3: Build the graph
  if (!asciiMode && !jsonMode) {
    console.log('Building dependency graph...')
  }
  let { graph, validationErrors } = buildGraphFromTickets(tickets, {
    formatId: formatTicketId,
  })

  // Step 4: Auto-fix bidirectional mismatches (always enabled)
  const bidirectionalErrors = validationErrors.filter((e) => e.type === 'bidirectional_mismatch')
  if (bidirectionalErrors.length > 0 && !jsonMode && !asciiMode) {
    console.log(`\nFixing ${bidirectionalErrors.length} bidirectional mismatch(es)...`)
    const { fixed, failed } = await fixBidirectionalMismatches(bidirectionalErrors, tickets, VALID_REPOS)

    if (fixed > 0) {
      console.log(`Fixed ${fixed} issue(s). Re-fetching to verify...`)
      // Re-fetch and rebuild to verify fixes
      const freshIssues = await fetchAllIssues(REPOS)
      const freshTickets = transformIssuesToTickets(freshIssues, MAIN_REPO, REPO_ABBREVIATIONS, VALID_REPOS)
      const freshResult = buildGraphFromTickets(freshTickets, { formatId: formatTicketId })
      graph = freshResult.graph
      validationErrors = freshResult.validationErrors
    }

    if (failed.length > 0) {
      console.error('Failed to fix:')
      for (const f of failed) {
        console.error(`  - ${f}`)
      }
    }
  }

  // Step 5: Check for remaining bidirectional errors (blocking)
  const remainingBidirectionalErrors = validationErrors.filter((e) => e.type === 'bidirectional_mismatch')
  if (remainingBidirectionalErrors.length > 0 && !jsonMode) {
    console.error(`\n❌ ${remainingBidirectionalErrors.length} bidirectional mismatch(es) could not be fixed:`)
    for (const error of remainingBidirectionalErrors) {
      console.error(`  - ${error.message}`)
    }
    console.error('\nManually update the issues listed above.')
    process.exit(1)
  }

  // Step 6: Output
  if (jsonMode) {
    // Export graph as JSON
    const json = JSON.stringify(graph.toJSON(), null, 2)
    console.log(json)
  } else if (liveMode) {
    // Open in mermaid.live (standalone)
    const mermaidCode = renderMermaidDiagram(graph, { repoDisplayAbbrev: REPO_DISPLAY_ABBREV })
      .replace(/```mermaid\n/, '')
      .replace(/\n```$/, '')

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
    // ASCII box graph (standalone)
    console.log(generateAsciiGraph(tickets))
  } else {
    // Markdown mode: write to file
    console.log('Generating markdown...')
    const markdown = generateMarkdown(tickets, graph, validationErrors)
    writeFileSync(OUTPUT_FILE, markdown)
    console.log(`Written to ${OUTPUT_FILE}`)
  }

  // Report other validation issues (non-bidirectional, since those are already handled)
  const otherErrors = validationErrors.filter((e) => e.type !== 'bidirectional_mismatch')
  if (otherErrors.length > 0 && !jsonMode) {
    console.log('\nValidation warnings:')
    for (const error of otherErrors) {
      console.log(`  - [${error.type}] ${error.message}`)
    }
  }

  // Report graph statistics
  if (!asciiMode && !jsonMode) {
    const criticalPath = graph.getCriticalPath()
    console.log('\nGraph statistics:')
    console.log(`  - Nodes: ${graph.nodes.size}`)
    console.log(`  - Edges: ${graph.edges.length}`)
    console.log(`  - Critical path length: ${criticalPath.length}`)
    if (criticalPath.path.length > 0) {
      console.log(`  - Critical path: ${criticalPath.path.slice(0, 5).join(' → ')}${criticalPath.path.length > 5 ? '...' : ''}`)
    }
  }
}

// Only run main when executed directly
const isMainModule = process.argv[1]?.endsWith('generate-dependency-graph.mjs')
if (isMainModule) {
  main().catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })
}

// Export for testing
export { formatTicketId, formatDepRef, updateYamlMetadata }
