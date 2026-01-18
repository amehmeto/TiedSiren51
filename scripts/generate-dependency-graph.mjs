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
import { writeFileSync } from 'node:fs'

import { VALID_REPOS, REPO_ABBREVIATIONS, REPO_DISPLAY_ABBREV, MAIN_REPO } from './remark-lint-ticket/config.mjs'
import {
  buildGraphFromTickets,
  fetchAllIssues,
  transformIssuesToTickets,
  parseDependencyRef as parseDependencyRefBase,
} from './lib/index.mjs'
import { renderMermaidDiagram, validateMermaid } from './lib/mermaid-renderer.mjs'

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
// ASCII Graph
// ============================================================================

function buildAsciiTreeContext(tickets) {
  const withDeps = tickets.filter(
    (t) => (t.metadata?.depends_on?.length || 0) > 0 || (t.metadata?.blocks?.length || 0) > 0,
  )

  const ticketByKey = new Map(withDeps.map((t) => [formatTicketId(t.repo, t.number), t]))
  const ticketKeys = new Set(ticketByKey.keys())

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

  return { ticketByKey, ticketKeys, children, roots }
}

function formatAsciiLabel(key, ticketByKey) {
  const ticket = ticketByKey.get(key)
  if (ticket) {
    return formatDepRef({ repo: ticket.repo, number: ticket.number }, MAIN_REPO)
  }
  return key
}

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

function renderAsciiTree(key, indent, context, printed, lines) {
  const { ticketByKey, ticketKeys, children } = context

  if (printed.has(key)) {
    lines.push(`${indent}└─▶ ${formatAsciiLabel(key, ticketByKey)} (↑)`)
    return
  }
  printed.add(key)

  const blockRefs = children.get(key) || []
  const kids = blockRefs
    .map((ref) => formatTicketId(ref.repo, ref.number))
    .filter((k) => ticketKeys.has(k))

  const label = formatAsciiLabel(key, ticketByKey)
  const boxLines = renderAsciiBox(label, kids.length > 0, indent)
  lines.push(...boxLines)

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
| ⏳ | To Do | Normal colors |

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
    console.log(`Status breakdown: ✅ ${statusCounts.done} done, 🔄 ${statusCounts.in_progress} in progress, ⏳ ${statusCounts.todo} todo`)
  }

  // Step 3: Build the graph
  if (!asciiMode && !jsonMode) {
    console.log('Building dependency graph...')
  }
  const { graph, validationErrors } = buildGraphFromTickets(tickets, {
    formatId: formatTicketId,
  })

  // Step 4: Output
  if (jsonMode) {
    // Export graph as JSON
    const json = JSON.stringify(graph.toJSON(), null, 2)
    console.log(json)
  } else if (liveMode) {
    // Open in mermaid.live
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
    // ASCII box graph
    console.log(generateAsciiGraph(tickets))
  } else {
    // Markdown mode: write to file
    console.log('Generating markdown...')
    const markdown = generateMarkdown(tickets, graph, validationErrors)
    writeFileSync(OUTPUT_FILE, markdown)
    console.log(`Written to ${OUTPUT_FILE}`)
  }

  // Report validation issues
  if (validationErrors.length > 0 && !jsonMode) {
    console.log('\nValidation warnings:')
    for (const error of validationErrors) {
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
export { formatTicketId, formatDepRef }
