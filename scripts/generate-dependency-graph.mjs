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
import { writeFileSync } from 'node:fs'
import { VALID_REPOS } from './remark-lint-ticket/config.mjs'

const REPO = 'amehmeto/TiedSiren51'
const OUTPUT_FILE = 'docs/TICKET-DEPENDENCY-GRAPH.md'

// ============================================================================
// GitHub API
// ============================================================================

function fetchOpenIssues() {
  const result = execSync(
    `gh issue list --repo ${REPO} --state open --limit 100 --json number,title,body,labels`,
    { encoding: 'utf-8' },
  )
  return JSON.parse(result)
}

// ============================================================================
// YAML Parsing
// ============================================================================

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

  // Parse number arrays
  if (dependsMatch) {
    metadata.depends_on = dependsMatch[1]
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n))
  }
  if (blocksMatch) {
    metadata.blocks = blocksMatch[1]
      .split(',')
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n))
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

function generateInventoryTable(tickets, type) {
  if (tickets.length === 0) return ''

  const headers = {
    initiative: '| # | Title | Depends On | Blocks |',
    epic: '| # | Title | Depends On | Blocks |',
    bug: '| # | Title | Severity | Related |',
    feature: '| # | Title | Depends On | Blocks |',
  }

  const separator = {
    initiative: '|---|-------|------------|--------|',
    epic: '|---|-------|------------|--------|',
    bug: '|---|-------|----------|---------| ',
    feature: '|---|-------|------------|--------|',
  }

  let table = `${headers[type]}\n${separator[type]}\n`

  for (const t of tickets) {
    const deps = t.metadata?.depends_on?.map((n) => `#${n}`).join(', ') || '-'
    const blocks = t.metadata?.blocks?.map((n) => `#${n}`).join(', ') || '-'
    const severity = t.metadata?.severity || 'medium'

    if (type === 'bug') {
      table += `| #${t.number} | ${t.title} | ${severity} | ${deps} |\n`
    } else {
      table += `| #${t.number} | ${t.title} | ${deps} | ${blocks} |\n`
    }
  }

  return table
}

function generateMermaidDiagram(tickets) {
  const nodes = []
  const edges = []

  // Group by type for subgraphs
  const groups = groupTicketsByType(tickets)

  // Generate nodes
  const addNode = (t, prefix) => {
    const shortTitle = t.title.length > 30 ? t.title.substring(0, 30) + '...' : t.title
    nodes.push(`    ${prefix}${t.number}["#${t.number} ${shortTitle}"]`)
  }

  // Initiatives
  if (groups.initiative.length > 0) {
    nodes.push('    subgraph Initiatives')
    groups.initiative.forEach((t) => addNode(t, 'I'))
    nodes.push('    end')
  }

  // Epics
  if (groups.epic.length > 0) {
    nodes.push('    subgraph Epics')
    groups.epic.forEach((t) => addNode(t, 'E'))
    nodes.push('    end')
  }

  // Generate edges from depends_on
  for (const t of tickets) {
    const deps = t.metadata?.depends_on || []
    for (const dep of deps) {
      const source = tickets.find((x) => x.number === dep)
      const target = t
      if (source && target) {
        const sourcePrefix = source.type === 'initiative' ? 'I' : source.type === 'epic' ? 'E' : 'F'
        const targetPrefix = target.type === 'initiative' ? 'I' : target.type === 'epic' ? 'E' : 'F'
        edges.push(`    ${sourcePrefix}${source.number} --> ${targetPrefix}${target.number}`)
      }
    }
  }

  return `\`\`\`mermaid
flowchart TD
${nodes.join('\n')}

    %% Dependencies
${edges.join('\n')}
\`\`\``
}

function generateFeaturesDiagram(features, title) {
  if (features.length === 0) return ''

  const nodes = []
  const edges = []

  for (const f of features) {
    const shortTitle = f.title.length > 25 ? f.title.substring(0, 25) + '...' : f.title
    nodes.push(`    F${f.number}["#${f.number} ${shortTitle}"]`)

    const deps = f.metadata?.depends_on || []
    for (const dep of deps) {
      if (features.find((x) => x.number === dep)) {
        edges.push(`    F${dep} --> F${f.number}`)
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
  const blockers = {}

  for (const t of tickets) {
    const blocks = t.metadata?.blocks || []
    if (blocks.length > 0) {
      blockers[t.number] = blocks
    }
  }

  if (Object.keys(blockers).length === 0) return ''

  let table = '| Blocker | Blocks These Issues |\n|---------|---------------------|\n'
  for (const [blocker, blocked] of Object.entries(blockers).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    table += `| #${blocker} | ${blocked.map((n) => `#${n}`).join(', ')} |\n`
  }

  return table
}

function validateBidirectional(tickets) {
  const issues = []

  for (const t of tickets) {
    const deps = t.metadata?.depends_on || []
    const blocks = t.metadata?.blocks || []

    // Check: if A depends_on B, then B should block A
    for (const dep of deps) {
      const parent = tickets.find((x) => x.number === dep)
      if (parent && !parent.metadata?.blocks?.includes(t.number)) {
        issues.push(`#${dep} should have blocks: [${t.number}] (because #${t.number} depends on it)`)
      }
    }

    // Check: if A blocks B, then B should depend_on A
    for (const blocked of blocks) {
      const child = tickets.find((x) => x.number === blocked)
      if (child && !child.metadata?.depends_on?.includes(t.number)) {
        issues.push(`#${blocked} should have depends_on: [${t.number}] (because #${t.number} blocks it)`)
      }
    }
  }

  return issues
}

// ============================================================================
// ASCII Output
// ============================================================================

function generateAsciiTree(tickets) {
  const lines = []
  const ticketMap = new Map(tickets.map((t) => [t.number, t]))

  // Find root nodes (no dependencies)
  const roots = tickets.filter((t) => !t.metadata?.depends_on?.length)

  // Build children map
  const childrenMap = new Map()
  for (const t of tickets) {
    const deps = t.metadata?.depends_on || []
    for (const dep of deps) {
      if (!childrenMap.has(dep)) childrenMap.set(dep, [])
      childrenMap.get(dep).push(t.number)
    }
  }

  const printed = new Set()

  const printNode = (num, prefix = '', isLast = true) => {
    if (printed.has(num)) {
      lines.push(`${prefix}${isLast ? '└── ' : '├── '}#${num} (see above)`)
      return
    }
    printed.add(num)

    const t = ticketMap.get(num)
    if (!t) return

    const connector = isLast ? '└── ' : '├── '
    const shortTitle = t.title.length > 45 ? t.title.substring(0, 45) + '...' : t.title
    lines.push(`${prefix}${connector}#${num} ${shortTitle}`)

    const children = childrenMap.get(num) || []
    const childPrefix = prefix + (isLast ? '    ' : '│   ')
    children.forEach((child, i) => {
      printNode(child, childPrefix, i === children.length - 1)
    })
  }

  lines.push('Dependency Graph (→ means "blocks")\n')

  // Print each root tree
  roots.forEach((root, i) => {
    const shortTitle = root.title.length > 45 ? root.title.substring(0, 45) + '...' : root.title
    lines.push(`#${root.number} ${shortTitle}`)
    printed.add(root.number)

    const children = childrenMap.get(root.number) || []
    children.forEach((child, j) => {
      printNode(child, '', j === children.length - 1)
    })
    if (i < roots.length - 1) lines.push('')
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

---

*Auto-generated on ${today} from GitHub issue metadata*
`

  return md
}

// Run
const asciiMode = process.argv.includes('--ascii')

if (!asciiMode) {
  console.log('Fetching open issues from GitHub...')
}
const issues = fetchOpenIssues()

if (!asciiMode) {
  console.log(`Found ${issues.length} open issues`)
}

const tickets = issues.map((issue) => {
  const metadata = extractMetadata(issue.body)
  return {
    number: issue.number,
    title: issue.title,
    labels: issue.labels,
    metadata,
    type: detectTicketType(issue, metadata),
  }
})

if (asciiMode) {
  // ASCII mode: just print to terminal
  console.log(generateAsciiTree(tickets))
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
