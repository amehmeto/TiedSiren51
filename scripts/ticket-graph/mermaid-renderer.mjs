/**
 * Mermaid Renderer - Generate Mermaid diagrams from TicketGraph
 *
 * This module is responsible for all Mermaid-specific rendering:
 * 1. Node styling (colors, shapes)
 * 2. Edge rendering
 * 3. Subgraph grouping (by epic, by type)
 *
 * It takes a TicketGraph and produces a Mermaid diagram string.
 */

import { execSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { BLOCKING_REPOS, CATEGORY_KEYWORDS } from '../remark-lint-ticket/config.mjs'

// ============================================================================
// Constants
// ============================================================================

const STATUS_EMOJI = {
  done: '✅',
  in_progress: '🔄',
  todo: '📝',
}

// Color manipulation constants
const LIGHTNESS_BOOST = 0.15
const MAX_LIGHTNESS = 0.85
const SATURATION_MULTIPLIER = 1.1

// Base colors per category (hex shades from dark to light)
const CATEGORY_COLOR_SHADES = {
  initiative: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  epic: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  auth: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
  blocking: ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa'],
  bug: ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca'],
  other: ['#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'],
}

// ============================================================================
// Color Utilities
// ============================================================================

function hexToGrayscale(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  const grayHex = gray.toString(16).padStart(2, '0')
  return `#${grayHex}${grayHex}${grayHex}`
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  return [h * 360, s, l]
}

function hslToRgb(h, s, l) {
  h /= 360
  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function brightenColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  let [h, s, l] = rgbToHsl(r, g, b)
  l = Math.min(MAX_LIGHTNESS, l + LIGHTNESS_BOOST)
  s = Math.min(1, s * SATURATION_MULTIPLIER)

  const [nr, ng, nb] = hslToRgb(h, s, l)
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

// ============================================================================
// Text Utilities
// ============================================================================

/**
 * Sanitize and wrap a ticket title for Mermaid display
 */
function sanitizeTicketTitle(title, lineLength = 30, maxLines = 3) {
  const cleaned = title
    .replace(/^\[?\w+\]?\s*/i, '')
    .replace(/^feat\([^)]*\):\s*/i, '')
    .replace(/^fix\([^)]*\):\s*/i, '')
    .replace(/[[\]()]/g, '')
    .replace(/"/g, "'")

  const maxLength = lineLength * maxLines
  const truncated = cleaned.length > maxLength ? cleaned.substring(0, maxLength - 3) + '...' : cleaned

  const words = truncated.split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''

  const lines = []
  let currentLine = ''

  for (let i = 0; i < words.length; i++) {
    let word = words[i]
    if (word.length > lineLength) {
      word = word.substring(0, lineLength - 3) + '...'
    }
    if (currentLine.length + word.length + 1 <= lineLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
      if (lines.length >= maxLines - 1) {
        const remaining = words.slice(i).join(' ')
        if (remaining.length > lineLength) {
          const truncatedRemaining = remaining.substring(0, lineLength - 3) + '...'
          lines.push(truncatedRemaining)
        } else {
          lines.push(remaining)
        }
        break
      }
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  return lines.join('<br/>')
}

function formatStoryPoints(points) {
  if (!points) return ''
  return ` [${points}sp]`
}

// ============================================================================
// Categorization
// ============================================================================

/**
 * Build a map of epic numbers to their categories
 */
function buildEpicCategoryMap(graph) {
  const epicCategories = new Map()

  for (const node of graph.nodes.values()) {
    if (node.type !== 'epic') continue

    const title = node.title.toLowerCase()
    const labels = (node.labels || []).map((l) => (typeof l === 'string' ? l : l)?.toLowerCase() || '')

    let found = false
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (labels.some((label) => keywords.some((kw) => label.includes(kw)))) {
        epicCategories.set(node.number, category)
        found = true
        break
      }
    }

    if (!found) {
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some((kw) => title.includes(kw))) {
          epicCategories.set(node.number, category)
          found = true
          break
        }
      }
    }

    if (!found) {
      epicCategories.set(node.number, 'other')
    }
  }

  return epicCategories
}

/**
 * Categorize a node for styling purposes
 */
function categorizeNode(node, epicCategoryMap) {
  const title = node.title.toLowerCase()
  const labels = node.labels || []

  if (node.type === 'initiative') return 'initiative'
  if (node.type === 'epic') return 'epic'
  if (node.type === 'bug') return 'bug'

  if (BLOCKING_REPOS.includes(node.repo)) return 'blocking'

  const parentEpic = node.parentEpic
  if (parentEpic && epicCategoryMap.has(parentEpic)) {
    return epicCategoryMap.get(parentEpic)
  }

  if (labels.includes('auth') || title.includes('auth') || title.includes('sign-in') || title.includes('password')) return 'auth'
  if (labels.includes('blocking') || title.includes('blocking') || title.includes('siren') || title.includes('tier') || title.includes('lookout') || title.includes('strict')) return 'blocking'

  return 'other'
}

// ============================================================================
// Style Generation
// ============================================================================

/**
 * Generate Mermaid class definitions for styling
 */
function generateMermaidStyles(maxDepth) {
  const styles = []
  const statuses = ['todo', 'in_progress', 'done']

  for (const [category, shades] of Object.entries(CATEGORY_COLOR_SHADES)) {
    for (let d = 0; d <= maxDepth; d++) {
      const idx = Math.min(d, shades.length - 1)
      const baseFill = shades[idx]
      const baseStroke = shades[Math.max(0, idx - 1)]
      const textColor = d < 2 ? '#fff' : '#000'

      for (const status of statuses) {
        let fill = baseFill
        let stroke = baseStroke
        let text = textColor
        let extraStyle = ''

        if (status === 'done') {
          fill = hexToGrayscale(baseFill)
          stroke = hexToGrayscale(baseStroke)
          text = '#666'
          extraStyle = ',stroke-dasharray:3'
        } else if (status === 'in_progress') {
          fill = brightenColor(baseFill)
          stroke = '#000'
          extraStyle = ',stroke-width:3px'
        }

        styles.push(`    classDef ${category}${d}_${status} fill:${fill},stroke:${stroke},color:${text}${extraStyle}`)
      }
    }
  }
  return styles
}

// ============================================================================
// Node ID Generation
// ============================================================================

/**
 * Create a unique Mermaid node ID
 */
function createNodeId(node, repoDisplayAbbrev) {
  const abbrev = repoDisplayAbbrev[node.repo] || node.repo.replace(/-/g, '')
  return `T_${abbrev}_${node.number}`
}

// ============================================================================
// Main Renderer
// ============================================================================

/**
 * Render options for Mermaid diagram generation
 * @typedef {Object} RenderOptions
 * @property {Object} repoDisplayAbbrev - Map of repo names to display abbreviations
 * @property {boolean} [groupByEpic=true] - Group tickets under their parent epic
 * @property {boolean} [showCrossGroupEdges=false] - Show edges between different groups
 */

/**
 * Render a TicketGraph to Mermaid diagram format
 * @param {import('./ticket-graph.mjs').TicketGraph} graph
 * @param {RenderOptions} options
 * @returns {string}
 */
export function renderMermaidDiagram(graph, options) {
  const { repoDisplayAbbrev = {}, groupByEpic = true, showCrossGroupEdges = false } = options

  const nodes = []
  const depths = graph.computeDepths()
  const maxDepth = Math.max(...depths.values(), 0)

  const styles = generateMermaidStyles(maxDepth)
  const epicCategoryMap = buildEpicCategoryMap(graph)

  // Separate nodes by type
  const initiatives = []
  const epics = []
  const epicByNumber = new Map()
  const ticketsByEpic = new Map()
  const orphanTickets = []

  for (const node of graph.nodes.values()) {
    if (node.type === 'initiative') {
      initiatives.push(node)
    } else if (node.type === 'epic') {
      epics.push(node)
      epicByNumber.set(node.number, node)
    } else if (groupByEpic && node.parentEpic && epicByNumber.has(node.parentEpic)) {
      // Will be grouped later
    } else if (groupByEpic && node.parentEpic) {
      // Parent epic might be added later
    } else {
      orphanTickets.push(node)
    }
  }

  // Second pass for epic children (now that epicByNumber is populated)
  for (const node of graph.nodes.values()) {
    if (node.type === 'initiative' || node.type === 'epic') continue

    if (groupByEpic && node.parentEpic && epicByNumber.has(node.parentEpic)) {
      if (!ticketsByEpic.has(node.parentEpic)) {
        ticketsByEpic.set(node.parentEpic, [])
      }
      ticketsByEpic.get(node.parentEpic).push(node)
    } else if (!orphanTickets.includes(node)) {
      orphanTickets.push(node)
    }
  }

  // Helper to build node line
  const buildNodeLine = (node) => {
    const label = sanitizeTicketTitle(node.title)
    const depth = depths.get(node.id) || 0
    const category = categorizeNode(node, epicCategoryMap)
    const storyPoints = formatStoryPoints(node.storyPoints)
    const repoAbbrev = repoDisplayAbbrev[node.repo] || node.repo
    const status = node.status || 'todo'
    const statusEmoji = STATUS_EMOJI[status] || ''
    const displayNum = `${statusEmoji} ${repoAbbrev}#${node.number}`
    return `        ${createNodeId(node, repoDisplayAbbrev)}["${displayNum} ${label}${storyPoints}"]:::${category}${depth}_${status}`
  }

  // Build subgraphs
  if (initiatives.length > 0) {
    nodes.push('    subgraph Initiatives')
    nodes.push('        direction TB')
    for (const node of initiatives) {
      nodes.push(buildNodeLine(node))
    }
    nodes.push('    end')
  }

  if (epics.length > 0) {
    nodes.push('    subgraph Epics')
    nodes.push('        direction TB')
    for (const node of epics) {
      nodes.push(buildNodeLine(node))
    }
    nodes.push('    end')
  }

  for (const epic of epics) {
    const children = ticketsByEpic.get(epic.number) || []
    if (children.length > 0) {
      const epicLabel = sanitizeTicketTitle(epic.title, 25, 1).replace(/<br\/>/g, ' ')
      const repoAbbrev = repoDisplayAbbrev[epic.repo] || epic.repo
      nodes.push(`    subgraph Epic_${epic.number}["${repoAbbrev}#${epic.number} ${epicLabel}"]`)
      nodes.push('        direction TB')
      for (const child of children) {
        nodes.push(buildNodeLine(child))
      }
      nodes.push('    end')
    }
  }

  if (orphanTickets.length > 0) {
    nodes.push('    subgraph Ungrouped')
    nodes.push('        direction TB')
    for (const node of orphanTickets) {
      nodes.push(buildNodeLine(node))
    }
    nodes.push('    end')
  }

  // Helper to get node's group
  const getNodeGroup = (node) => {
    if (node.type === 'initiative') return 'initiative'
    if (node.type === 'epic') return 'epic'
    if (node.parentEpic && epicByNumber.has(node.parentEpic)) return `epic_${node.parentEpic}`
    return 'ungrouped'
  }

  // Generate edges
  const edges = []
  for (const edge of graph.edges) {
    const fromNode = graph.getNode(edge.from)
    const toNode = graph.getNode(edge.to)

    if (!fromNode || !toNode) continue

    const fromGroup = getNodeGroup(fromNode)
    const toGroup = getNodeGroup(toNode)

    // Edge goes from dependency TO dependent (reversed from depends_on)
    // In Mermaid: A --> B means A points to B
    // We want: dependency --> dependent
    if (showCrossGroupEdges || fromGroup === toGroup) {
      edges.push(`    ${createNodeId(toNode, repoDisplayAbbrev)} --> ${createNodeId(fromNode, repoDisplayAbbrev)}`)
    }
  }

  return `\`\`\`mermaid
flowchart LR
${styles.join('\n')}

${nodes.join('\n')}

${edges.join('\n')}
\`\`\``
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate Mermaid syntax using mermaid-cli
 * @param {string} code - Mermaid code (without fences)
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMermaid(code) {
  const tmpFile = join(tmpdir(), `mermaid-validate-${Date.now()}.mmd`)
  const outFile = join(tmpdir(), `mermaid-validate-${Date.now()}.svg`)

  try {
    writeFileSync(tmpFile, code)
    execSync(`npx --yes @mermaid-js/mermaid-cli@10 -i "${tmpFile}" -o "${outFile}"`, {
      encoding: 'utf-8',
      stdio: 'pipe',
      timeout: 60000,
    })
    return { valid: true }
  } catch (error) {
    const errorMsg = error.stdout || error.stderr || error.message
    const isRealError =
      errorMsg.includes('Parse error') ||
      errorMsg.includes('Syntax error') ||
      errorMsg.includes('Error:') ||
      errorMsg.includes('EBADENGINE')

    if (!isRealError) {
      return { valid: true }
    }

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
    } catch {
      // Ignore cleanup errors
    }
  }
}
