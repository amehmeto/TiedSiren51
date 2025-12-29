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

function generateMermaidDiagram(tickets) {
  const nodes = []
  const edges = []
  const styles = []

  // Color classes
  styles.push('    classDef initiative fill:#9333ea,stroke:#7c3aed,color:#fff')
  styles.push('    classDef epic fill:#3b82f6,stroke:#2563eb,color:#fff')
  styles.push('    classDef auth fill:#22c55e,stroke:#16a34a,color:#fff')
  styles.push('    classDef blocking fill:#f97316,stroke:#ea580c,color:#fff')
  styles.push('    classDef bug fill:#ef4444,stroke:#dc2626,color:#fff')
  styles.push('    classDef other fill:#6b7280,stroke:#4b5563,color:#fff')

  // Generate nodes with categories
  const nodesByCategory = {}

  for (const t of tickets) {
    const category = categorizeTicket(t)
    if (!nodesByCategory[category]) nodesByCategory[category] = []

    const shortTitle = t.title
      .replace(/^\[?\w+\]?\s*/i, '') // Remove [Epic], [Initiative], feat(), fix() prefixes
      .replace(/^feat\([^)]*\):\s*/i, '')
      .replace(/^fix\([^)]*\):\s*/i, '')
    const label = shortTitle.length > 35 ? shortTitle.substring(0, 35) + '...' : shortTitle

    nodesByCategory[category].push({ ticket: t, label })
  }

  // Add subgraphs by category
  const categoryLabels = {
    initiative: '🚀 Initiatives',
    epic: '🏔️ Epics',
    auth: '🔐 Authentication',
    blocking: '🛡️ Blocking',
    bug: '🐛 Bugs',
    other: '📦 Other',
  }

  for (const [category, items] of Object.entries(nodesByCategory)) {
    if (items.length === 0) continue

    nodes.push(`    subgraph ${categoryLabels[category]}`)
    for (const { ticket: t, label } of items) {
      nodes.push(`        T${t.number}["#${t.number} ${label}"]:::${category}`)
    }
    nodes.push('    end')
  }

  // Generate edges
  for (const t of tickets) {
    for (const dep of t.metadata?.depends_on || []) {
      if (tickets.find((x) => x.number === dep)) {
        edges.push(`    T${dep} --> T${t.number}`)
      }
    }
  }

  return `\`\`\`mermaid
flowchart TD
${styles.join('\n')}

${nodes.join('\n')}

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
// ASCII Box Graph
// ============================================================================

function generateAsciiGraph(tickets) {
  const withDeps = tickets.filter(
    (t) => (t.metadata?.depends_on?.length || 0) > 0 || (t.metadata?.blocks?.length || 0) > 0,
  )

  if (withDeps.length === 0) return 'No dependencies found.'

  const children = new Map()
  for (const t of withDeps) {
    children.set(t.number, t.metadata?.blocks || [])
  }

  // Find roots
  const hasParent = new Set()
  for (const t of withDeps) {
    for (const b of t.metadata?.blocks || []) hasParent.add(b)
  }
  const roots = withDeps.filter((t) => !hasParent.has(t.number)).map((t) => t.number)

  const printed = new Set()
  const lines = []

  const renderTree = (num, indent = '') => {
    if (printed.has(num)) {
      lines.push(`${indent}└─▶ #${num} (↑)`)
      return
    }
    printed.add(num)

    const kids = (children.get(num) || []).filter((k) => withDeps.some((t) => t.number === k))
    const box = `┌──────┐\n${indent}│ #${String(num).padStart(3)} │\n${indent}└──┬───┘`

    if (kids.length === 0) {
      lines.push(`${indent}┌──────┐`)
      lines.push(`${indent}│ #${String(num).padStart(3)} │`)
      lines.push(`${indent}└──────┘`)
    } else {
      lines.push(`${indent}┌──────┐`)
      lines.push(`${indent}│ #${String(num).padStart(3)} │`)
      lines.push(`${indent}└──┬───┘`)
      lines.push(`${indent}   │`)

      kids.forEach((kid, i) => {
        const isLast = i === kids.length - 1
        const connector = isLast ? '└─▶ ' : '├─▶ '
        const childIndent = indent + (isLast ? '    ' : '│   ')

        if (printed.has(kid)) {
          lines.push(`${indent}   ${connector}#${kid} (↑)`)
        } else {
          lines.push(`${indent}   ${connector}`)
          renderTree(kid, childIndent)
        }
      })
    }
  }

  roots.forEach((root, i) => {
    if (i > 0) lines.push('\n' + '─'.repeat(40) + '\n')
    renderTree(root)
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

const liveMode = process.argv.includes('--live')

if (liveMode) {
  // Generate mermaid.live URL
  const mermaidCode = generateMermaidDiagram(tickets).replace(/```mermaid\n/, '').replace(/\n```$/, '')
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
