/**
 * GitHub Fetcher - Fetch issues and PRs from GitHub repositories
 *
 * This module handles all GitHub API interactions via the gh CLI.
 * It's responsible for:
 * 1. Fetching issues from multiple repos in parallel
 * 2. Fetching PR states to determine ticket status
 * 3. Parsing YAML metadata from issue bodies
 */

import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

// ============================================================================
// Types
// ============================================================================

/**
 * @typedef {Object} RawIssue
 * @property {number} number
 * @property {string} title
 * @property {string} body
 * @property {Array<{name: string}>} labels
 * @property {string} state - 'open' or 'closed'
 * @property {string} repo - Added by fetcher
 * @property {'done' | 'in_progress' | 'todo'} status - Computed from PR state
 */

/**
 * @typedef {Object} DependencyRef
 * @property {string} repo - Repository name
 * @property {number} number - Issue number
 */

/**
 * @typedef {Object} TicketMetadata
 * @property {number} [story_points]
 * @property {string} [severity]
 * @property {string[]} [labels]
 * @property {DependencyRef[]} [depends_on]
 * @property {DependencyRef[]} [blocks]
 * @property {number} [parentEpic]
 * @property {number} [parentInitiative]
 */

// ============================================================================
// Configuration
// ============================================================================

// API limits for GitHub CLI queries
const ISSUE_FETCH_LIMIT = 100
const PR_FETCH_LIMIT = 200

// ============================================================================
// PR State Fetching
// ============================================================================

/**
 * Fetch PRs for a single repo and extract issue -> PR state mappings
 * @param {Object} repo - Repository info with name and fullName
 * @returns {Promise<Array<{issueKey: string, prState: string}>>}
 */
async function fetchRepoPullRequestStates(repo) {
  const mappings = []

  try {
    const { stdout } = await execAsync(
      `gh pr list --repo ${repo.fullName} --state all --limit ${PR_FETCH_LIMIT} --json number,state,mergedAt,closingIssuesReferences`,
    )
    const prs = JSON.parse(stdout)

    for (const pr of prs) {
      const normalizedState = (pr.state || '').toUpperCase()
      let prState = 'closed'
      if (pr.mergedAt) {
        prState = 'merged'
      } else if (normalizedState === 'OPEN') {
        prState = 'open'
      }

      const linkedIssues = pr.closingIssuesReferences || []
      for (const linkedIssue of linkedIssues) {
        mappings.push({
          issueKey: `${repo.name}#${linkedIssue.number}`,
          prState,
        })
      }
    }
  } catch (error) {
    const errorMsg = error.message || ''
    if (!errorMsg.includes('404') && !errorMsg.includes('no pull requests')) {
      console.warn(`  Warning: Could not fetch PRs from ${repo.name}: ${errorMsg.slice(0, 100)}`)
    }
  }

  return mappings
}

/**
 * Fetch all PRs from all repos in parallel and build a map of issue -> PR state
 * @param {Object[]} repos - Array of repo info objects
 * @returns {Promise<Map<string, 'merged' | 'open' | 'closed'>>}
 */
async function fetchPullRequestStates(repos) {
  const results = await Promise.all(repos.map((repo) => fetchRepoPullRequestStates(repo)))

  const prStateByIssue = new Map()
  for (const mappings of results) {
    for (const { issueKey, prState } of mappings) {
      const existingState = prStateByIssue.get(issueKey)
      if (
        !existingState ||
        prState === 'merged' ||
        (prState === 'open' && existingState !== 'merged')
      ) {
        prStateByIssue.set(issueKey, prState)
      }
    }
  }

  return prStateByIssue
}

/**
 * Detect ticket status based on PR state or issue state
 * @param {Object} issue - GitHub issue object
 * @param {Map<string, string>} prStateByIssue - PR state map
 * @returns {'done' | 'in_progress' | 'todo'}
 */
function detectTicketStatus(issue, prStateByIssue) {
  const normalizedState = (issue.state || '').toUpperCase()

  if (normalizedState === 'CLOSED') {
    return 'done'
  }

  const issueKey = `${issue.repo}#${issue.number}`
  const prState = prStateByIssue.get(issueKey)

  if (prState === 'merged') return 'done'
  if (prState === 'open') return 'in_progress'

  return 'todo'
}

// ============================================================================
// Issue Fetching
// ============================================================================

/**
 * Fetch issues for a single repo
 * @param {Object} repo - Repository info
 * @param {Map<string, string>} prStateByIssue - PR state map
 * @returns {Promise<RawIssue[]>}
 */
async function fetchRepoIssues(repo, prStateByIssue) {
  try {
    const { stdout } = await execAsync(
      `gh issue list --repo ${repo.fullName} --state all --limit ${ISSUE_FETCH_LIMIT} --json number,title,body,labels,state`,
    )
    const issues = JSON.parse(stdout)
    for (const issue of issues) {
      issue.repo = repo.name
      issue.status = detectTicketStatus(issue, prStateByIssue)
    }
    return issues
  } catch (error) {
    const errorMsg = error.message || ''
    if (!errorMsg.includes('404')) {
      console.warn(`  Warning: Could not fetch issues from ${repo.name}: ${errorMsg.slice(0, 100)}`)
    }
    return []
  }
}

/**
 * Fetch all issues from all repos in parallel
 * @param {Object[]} repos - Array of repo info objects
 * @returns {Promise<RawIssue[]>}
 */
export async function fetchAllIssues(repos) {
  const prStateByIssue = await fetchPullRequestStates(repos)
  const results = await Promise.all(repos.map((repo) => fetchRepoIssues(repo, prStateByIssue)))
  return results.flat()
}

// ============================================================================
// Metadata Parsing
// ============================================================================

/**
 * Parse a dependency reference string
 * @param {string} ref - Reference like "123", "#123", or "REPO#123"
 * @param {string} currentRepo - Current repo context for local refs
 * @param {Object} repoAbbreviations - Map of abbreviations to full names
 * @param {Object} validRepos - Map of valid repo names
 * @returns {DependencyRef | null}
 */
export function parseDependencyRef(ref, currentRepo, repoAbbreviations, validRepos) {
  const trimmed = ref.trim()
  if (!trimmed) return null

  // Cross-repo format: "repo#123" or "ABBREV#123"
  const crossRepoMatch = trimmed.match(/^([^#]+)#(\d+)$/)
  if (crossRepoMatch) {
    const [, repoOrAbbrev, numStr] = crossRepoMatch
    const num = parseInt(numStr, 10)
    if (isNaN(num)) return null

    const fullRepo = repoAbbreviations[repoOrAbbrev] || repoOrAbbrev
    if (!validRepos[fullRepo]) {
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
 * Extract metadata from issue body YAML block and hierarchy section
 * @param {string} body - Issue body
 * @returns {Object} - Raw metadata (dependencies as strings)
 */
export function extractMetadata(body) {
  if (!body) return null

  const metadata = {}

  // Parse YAML block if present
  const yamlMatch = body.match(/```yaml\s*\n([\s\S]*?)```/)
  if (yamlMatch) {
    const yamlContent = yamlMatch[1]

    const repoMatch = yamlContent.match(/^repo:\s*(.+)$/m)
    const pointsMatch = yamlContent.match(/^story_points:\s*(\d+)/m)
    const dependsMatch = yamlContent.match(/^depends_on:\s*\[([^\]]*)\]/m)
    const blocksMatch = yamlContent.match(/^blocks:\s*\[([^\]]*)\]/m)
    const severityMatch = yamlContent.match(/^severity:\s*(\w+)/m)

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

    if (dependsMatch) {
      metadata.depends_on_raw = dependsMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (blocksMatch) {
      metadata.blocks_raw = blocksMatch[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
  }

  // Parse hierarchy section for parent epic
  const epicMatch = body.match(/\|\s*(?:🏔️\s*)?Epic\s*\|\s*\[#(\d+)/i)
  if (epicMatch) {
    metadata.parentEpic = parseInt(epicMatch[1], 10)
  }

  const initMatch = body.match(/\|\s*(?:🚀\s*)?Initiative\s*\|\s*\[#(\d+)/i)
  if (initMatch) {
    metadata.parentInitiative = parseInt(initMatch[1], 10)
  }

  return metadata
}

/**
 * Parse raw dependency strings into DependencyRef objects
 * @param {Object} metadata - Raw metadata
 * @param {string} ticketRepo - Ticket's repo
 * @param {Object} repoAbbreviations - Abbreviation map
 * @param {Object} validRepos - Valid repos map
 * @returns {TicketMetadata}
 */
export function parseTicketDependencies(metadata, ticketRepo, repoAbbreviations, validRepos) {
  if (!metadata) return metadata

  if (metadata.depends_on_raw) {
    metadata.depends_on = metadata.depends_on_raw
      .map((ref) => parseDependencyRef(ref, ticketRepo, repoAbbreviations, validRepos))
      .filter(Boolean)
    delete metadata.depends_on_raw
  }

  if (metadata.blocks_raw) {
    metadata.blocks = metadata.blocks_raw
      .map((ref) => parseDependencyRef(ref, ticketRepo, repoAbbreviations, validRepos))
      .filter(Boolean)
    delete metadata.blocks_raw
  }

  return metadata
}

/**
 * Detect ticket type from labels
 * @param {Object} issue - Issue object
 * @param {Object} metadata - Parsed metadata
 * @returns {'initiative' | 'epic' | 'bug' | 'feature'}
 */
export function detectTicketType(issue, metadata) {
  const labels = issue.labels?.map((l) => l.name) || metadata?.labels || []

  if (labels.includes('initiative')) return 'initiative'
  if (labels.includes('epic')) return 'epic'
  if (labels.includes('bug')) return 'bug'
  return 'feature'
}

/**
 * Transform raw issues into ticket objects ready for graph building
 * @param {RawIssue[]} issues - Raw issues from GitHub
 * @param {string} mainRepo - Main repo name (for default)
 * @param {Object} repoAbbreviations - Abbreviation map
 * @param {Object} validRepos - Valid repos map
 * @returns {Object[]} - Tickets with parsed metadata
 */
export function transformIssuesToTickets(issues, mainRepo, repoAbbreviations, validRepos) {
  return issues.map((issue) => {
    const ticketRepo = issue.repo || mainRepo
    const metadata = parseTicketDependencies(
      extractMetadata(issue.body),
      ticketRepo,
      repoAbbreviations,
      validRepos,
    )

    return {
      number: issue.number,
      title: issue.title,
      labels: issue.labels,
      repo: ticketRepo,
      metadata,
      type: detectTicketType(issue, metadata),
      status: issue.status || 'todo',
    }
  })
}
