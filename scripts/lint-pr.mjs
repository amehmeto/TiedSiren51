#!/usr/bin/env node

/**
 * 🔍 PR Linter
 *
 * Validates GitHub Pull Request titles and descriptions to ensure they:
 * - Reference the ticket(s) being addressed
 * - Follow a consistent format
 * - Include required sections
 *
 * Usage:
 *   node scripts/lint-pr.mjs --title "feat: add login #123" --body "## Summary\n..."
 *   echo '{"title": "...", "body": "..."}' | node scripts/lint-pr.mjs --stdin
 *   gh pr view --json title,body | node scripts/lint-pr.mjs --stdin
 */

import {
  VALID_REPOS,
  GITHUB_ORG,
  TICKET_PREFIXES,
  PREFIX_TO_REPO,
} from './remark-lint-ticket/config.mjs'

// ============================================================================
// 📋 CONFIGURATION
// ============================================================================

const ISSUE_PATTERN = /#(\d+)/g

// Jira-style ticket prefix pattern (e.g., TS-123, TSBO-45, EAS-7)
const VALID_PREFIXES = Object.values(TICKET_PREFIXES)
const TICKET_PREFIX_PATTERN = new RegExp(
  `^(${VALID_PREFIXES.join('|')})-(\\d+):\\s*`,
  'i',
)

// Build cross-repo pattern dynamically from config
// Matches: repo#123, org/repo#123, https://github.com/org/repo/issues/123, https://github.com/org/repo/pull/123
const crossRepoIssueSource =
  `(?:${GITHUB_ORG}\\/)?([a-zA-Z0-9_-]+)#(\\d+)|` +
  `https:\\/\\/github\\.com\\/${GITHUB_ORG}\\/([a-zA-Z0-9_-]+)\\/(?:issues|pull)\\/(\\d+)`
const CROSS_REPO_ISSUE_PATTERN = new RegExp(crossRepoIssueSource, 'g')

const VALID_REPO_NAMES = Object.keys(VALID_REPOS)

// Conventional commit prefixes
const COMMIT_PREFIXES = [
  'feat',
  'fix',
  'docs',
  'style',
  'refactor',
  'perf',
  'test',
  'build',
  'ci',
  'chore',
  'revert',
]

// Required sections in PR body
const REQUIRED_SECTIONS = [
  { pattern: /##\s*Summary/i, name: '## Summary', emoji: '📝' },
  { pattern: /##\s*🔗\s*Hierarchy|##\s*Hierarchy/i, name: '## 🔗 Hierarchy', emoji: '🔗' },
]

// Recommended sections (warnings only)
const RECOMMENDED_SECTIONS = [
  { pattern: /##\s*Test\s*[Pp]lan/i, name: '## Test Plan', emoji: '🧪' },
]

// Hierarchy link patterns
const HIERARCHY_PATTERNS = {
  initiative: /Initiative.*\[#(\d+)/i,
  epic: /Epic.*\[#(\d+)/i,
  issue: /Issue.*(?:Closes|Fixes|Resolves)?\s*#(\d+)/i,
}

// Valid GitHub issue URL pattern (must be from configured repos)
const VALID_GITHUB_ISSUE_URL = new RegExp(
  `https://github\\.com/${GITHUB_ORG}/(${VALID_REPO_NAMES.join('|')})/issues/(\\d+)`,
  'g',
)

// ============================================================================
// 🎨 OUTPUT HELPERS
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
}

function log(emoji, message, color = '') {
  console.log(`${color}${emoji} ${message}${colors.reset}`)
}

function logError(message) {
  log('❌', message, colors.red)
}

function logWarning(message) {
  log('⚠️ ', message, colors.yellow)
}

function logSuccess(message) {
  log('✅', message, colors.green)
}

function logInfo(message) {
  log('ℹ️ ', message, colors.blue)
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.cyan}${'─'.repeat(50)}${colors.reset}`)
  console.log(`${colors.bold}${colors.cyan}${title}${colors.reset}`)
  console.log(`${colors.cyan}${'─'.repeat(50)}${colors.reset}\n`)
}

// ============================================================================
// 🔍 VALIDATION FUNCTIONS
// ============================================================================

/**
 * Extract all issue references from text
 */
function extractIssueReferences(text) {
  const issues = []

  // Local issues (#123)
  const localMatches = text.matchAll(ISSUE_PATTERN)
  for (const match of localMatches) {
    issues.push({
      repo: 'TiedSiren51',
      number: parseInt(match[1], 10),
      raw: match[0],
    })
  }

  // Cross-repo issues (repo#123 or full URL)
  const crossRepoMatches = text.matchAll(CROSS_REPO_ISSUE_PATTERN)
  for (const match of crossRepoMatches) {
    const repo = match[1] || match[3]
    const number = parseInt(match[2] || match[4], 10)
    if (repo && number) {
      issues.push({
        repo,
        number,
        raw: match[0],
      })
    }
  }

  // Deduplicate
  const seen = new Set()
  return issues.filter((issue) => {
    const key = `${issue.repo}#${issue.number}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Validate PR title
 */
function validateTitle(title) {
  const errors = []
  const warnings = []
  const info = []

  if (!title || title.trim() === '') {
    errors.push('Title is empty')
    return { errors, warnings, info, issues: [] }
  }

  // Check for Jira-style ticket prefix (e.g., TS-123: feat: ...)
  const prefixMatch = title.match(TICKET_PREFIX_PATTERN)

  if (!prefixMatch) {
    errors.push(
      `Title must start with a Jira-style ticket prefix (e.g., "TS-123: feat: add login")`,
    )
    errors.push(`Valid prefixes: ${VALID_PREFIXES.join(', ')}`)
  } else {
    const [, prefix, number] = prefixMatch
    const upperPrefix = prefix.toUpperCase()
    const repo = PREFIX_TO_REPO[upperPrefix]
    info.push(`🎫 Ticket: ${upperPrefix}-${number} (${repo})`)
  }

  // Check for issue reference in title (in addition to the prefix)
  const issues = extractIssueReferences(title)

  // Also extract from the Jira-style prefix
  if (prefixMatch) {
    const [, prefix, number] = prefixMatch
    const upperPrefix = prefix.toUpperCase()
    const repo = PREFIX_TO_REPO[upperPrefix]
    if (repo) {
      issues.push({
        repo,
        number: parseInt(number, 10),
        raw: `${upperPrefix}-${number}`,
      })
    }
  }

  if (issues.length === 0) {
    errors.push(
      'Title must reference at least one ticket (e.g., "TS-123: feat: add login")',
    )
  }

  // Check for conventional commit prefix after the ticket number
  const titleAfterTicket = prefixMatch
    ? title.slice(prefixMatch[0].length)
    : title
  const hasConventionalPrefix = COMMIT_PREFIXES.some(
    (prefix) =>
      titleAfterTicket.toLowerCase().startsWith(`${prefix}:`) ||
      titleAfterTicket.toLowerCase().startsWith(`${prefix}(`),
  )

  if (!hasConventionalPrefix) {
    warnings.push(
      `Consider using conventional commit format after ticket: ${VALID_PREFIXES[0]}-123: ${COMMIT_PREFIXES.slice(0, 3).join('|')}: ...`,
    )
  }

  // Check title length
  if (title.length > 100) {
    warnings.push(`Title is ${title.length} chars (recommended: ≤100)`)
  }

  // Check for WIP
  if (/\bWIP\b/i.test(title) || /\[WIP\]/i.test(title)) {
    info.push('🚧 This is marked as Work In Progress')
  }

  return { errors, warnings, info, issues }
}

/**
 * Validate PR body/description
 */
function validateBody(body) {
  const errors = []
  const warnings = []
  const info = []

  if (!body || body.trim() === '') {
    errors.push('PR description is empty')
    return { errors, warnings, info, issues: [] }
  }

  // Extract all issue references from body
  const issues = extractIssueReferences(body)

  if (issues.length > 0) {
    info.push(
      `Found ${issues.length} ticket reference(s) in body: ${issues.map((i) => `${i.repo}#${i.number}`).join(', ')}`,
    )
  }

  // Check for required sections
  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(body)) {
      errors.push(`Missing required section: ${section.emoji} ${section.name}`)
    }
  }

  // Validate hierarchy links if hierarchy section exists
  const hasHierarchySection = /##\s*🔗\s*Hierarchy|##\s*Hierarchy/i.test(body)
  if (hasHierarchySection) {
    // Check for placeholder #XX
    if (body.includes('/issues/XX') || /\[#XX\s*-/i.test(body)) {
      warnings.push(
        'Hierarchy links contain placeholder #XX - replace with actual issue numbers',
      )
    }

    // Extract all GitHub issue URLs from body
    const urlPattern =
      /https:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)\/issues\/(\d+)/g
    const foundUrls = [...body.matchAll(urlPattern)]

    // Validate each URL is from a valid repo
    for (const match of foundUrls) {
      const [fullUrl, org, repo] = match
      if (org !== GITHUB_ORG) {
        warnings.push(
          `Hierarchy link to wrong org: ${fullUrl} (expected ${GITHUB_ORG})`,
        )
      } else if (!VALID_REPO_NAMES.includes(repo)) {
        warnings.push(
          `Hierarchy link to unknown repo: ${fullUrl} (valid repos: ${VALID_REPO_NAMES.join(', ')})`,
        )
      }
    }

    // Check for Initiative link with valid GitHub URL
    const hasInitiativeUrl =
      HIERARCHY_PATTERNS.initiative.test(body) &&
      foundUrls.some(
        ([, org, repo]) => org === GITHUB_ORG && VALID_REPO_NAMES.includes(repo),
      )
    if (!hasInitiativeUrl) {
      warnings.push(
        'Hierarchy section should link to parent Initiative with a valid GitHub issue URL',
      )
    }

    // Check for Epic link with valid GitHub URL
    const hasEpicUrl =
      HIERARCHY_PATTERNS.epic.test(body) &&
      foundUrls.some(
        ([, org, repo]) => org === GITHUB_ORG && VALID_REPO_NAMES.includes(repo),
      )
    if (!hasEpicUrl) {
      warnings.push(
        'Hierarchy section should link to parent Epic with a valid GitHub issue URL',
      )
    }

    // Check for Issue link (Closes #XX)
    if (!HIERARCHY_PATTERNS.issue.test(body) && !/Closes\s+#\d+/i.test(body)) {
      warnings.push(
        'Hierarchy section should reference the Issue being addressed (e.g., "Closes #123")',
      )
    }
  }

  // Check for recommended sections
  for (const section of RECOMMENDED_SECTIONS) {
    if (!section.pattern.test(body)) {
      warnings.push(`Consider adding section: ${section.emoji} ${section.name}`)
    }
  }

  // Check for "Closes #X" or "Fixes #X" patterns (good practice)
  const closesPattern = /\b(closes?|fixes?|resolves?)\s+#\d+/i
  if (!closesPattern.test(body)) {
    warnings.push(
      'Consider adding "Closes #X" or "Fixes #X" to auto-close the issue on merge',
    )
  }

  // Check for empty checklist items
  const hasUncheckedItems = /- \[ \]/.test(body)
  if (hasUncheckedItems) {
    info.push('📋 PR has unchecked checklist items')
  }

  // Check for screenshots/images in UI changes
  const looksLikeUIChange =
    /\b(ui|component|screen|button|modal|dialog|style|css|design)\b/i.test(body)
  const hasImages = /!\[.*?\]\(.*?\)|<img\s/i.test(body)
  if (looksLikeUIChange && !hasImages) {
    warnings.push('UI changes detected but no screenshots included')
  }

  return { errors, warnings, info, issues }
}

/**
 * Validate cross-repo references
 */
function validateCrossRepoReferences(issues) {
  const warnings = []

  for (const issue of issues) {
    if (
      issue.repo !== 'TiedSiren51' &&
      !VALID_REPO_NAMES.includes(issue.repo)
    ) {
      warnings.push(`Unknown repository: ${issue.repo} (from ${issue.raw})`)
    }
  }

  return warnings
}

// ============================================================================
// 📊 RESULT FORMATTING
// ============================================================================

function formatResults(titleResult, bodyResult) {
  const allIssues = [...titleResult.issues, ...bodyResult.issues]
  const uniqueIssues = []
  const seen = new Set()

  for (const issue of allIssues) {
    const key = `${issue.repo}#${issue.number}`
    if (!seen.has(key)) {
      seen.add(key)
      uniqueIssues.push(issue)
    }
  }

  const crossRepoWarnings = validateCrossRepoReferences(uniqueIssues)

  return {
    title: titleResult,
    body: bodyResult,
    allIssues: uniqueIssues,
    crossRepoWarnings,
    hasErrors: titleResult.errors.length > 0 || bodyResult.errors.length > 0,
    hasWarnings:
      titleResult.warnings.length > 0 ||
      bodyResult.warnings.length > 0 ||
      crossRepoWarnings.length > 0,
  }
}

function printResults(results) {
  console.log(
    `\n${colors.bold}${colors.magenta}🔍 PR Linter Results${colors.reset}\n`,
  )

  // Title validation
  logSection('📋 Title Validation')

  if (results.title.errors.length === 0) {
    logSuccess('Title format is valid')
  }
  for (const error of results.title.errors) {
    logError(error)
  }
  for (const warning of results.title.warnings) {
    logWarning(warning)
  }
  for (const info of results.title.info) {
    logInfo(info)
  }

  // Body validation
  logSection('📄 Description Validation')

  if (results.body.errors.length === 0) {
    logSuccess('Description format is valid')
  }
  for (const error of results.body.errors) {
    logError(error)
  }
  for (const warning of results.body.warnings) {
    logWarning(warning)
  }
  for (const info of results.body.info) {
    logInfo(info)
  }

  // Cross-repo validation
  if (results.crossRepoWarnings.length > 0) {
    logSection('🔗 Cross-Repository References')
    for (const warning of results.crossRepoWarnings) {
      logWarning(warning)
    }
  }

  // Summary
  logSection('📊 Summary')

  if (results.allIssues.length === 0) {
    logError('No ticket references found in PR!')
    console.log(
      `\n${colors.gray}Tip: Add issue references like #123 or repo#123${colors.reset}`,
    )
  } else {
    console.log(`${colors.bold}🎫 Linked Tickets:${colors.reset}`)
    for (const issue of results.allIssues) {
      const repoLabel =
        issue.repo === 'TiedSiren51'
          ? ''
          : ` ${colors.gray}(${issue.repo})${colors.reset}`
      console.log(`   • #${issue.number}${repoLabel}`)
    }
  }

  console.log('')

  const totalErrors = results.title.errors.length + results.body.errors.length
  const totalWarnings =
    results.title.warnings.length +
    results.body.warnings.length +
    results.crossRepoWarnings.length

  if (totalErrors > 0) {
    console.log(
      `${colors.red}${colors.bold}❌ ${totalErrors} error(s) found${colors.reset}`,
    )
  }
  if (totalWarnings > 0) {
    console.log(
      `${colors.yellow}⚠️  ${totalWarnings} warning(s) found${colors.reset}`,
    )
  }
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(
      `${colors.green}${colors.bold}✨ PR looks great!${colors.reset}`,
    )
  }

  console.log('')

  return totalErrors === 0
}

function printJsonResults(results) {
  const output = {
    valid: !results.hasErrors,
    title: {
      errors: results.title.errors,
      warnings: results.title.warnings,
      info: results.title.info,
      issues: results.title.issues,
    },
    body: {
      errors: results.body.errors,
      warnings: results.body.warnings,
      info: results.body.info,
      issues: results.body.issues,
    },
    linkedTickets: results.allIssues,
    crossRepoWarnings: results.crossRepoWarnings,
  }

  console.log(JSON.stringify(output, null, 2))
  return !results.hasErrors
}

// ============================================================================
// 🚀 MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2)

  let title = ''
  let body = ''
  let jsonOutput = false

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--title' && args[i + 1]) {
      title = args[++i]
    } else if (args[i] === '--body' && args[i + 1]) {
      body = args[++i]
    } else if (args[i] === '--json') {
      jsonOutput = true
    } else if (args[i] === '--stdin') {
      // Read from stdin
      const chunks = []
      for await (const chunk of process.stdin) {
        chunks.push(chunk)
      }
      const input = Buffer.concat(chunks).toString('utf8')

      try {
        const parsed = JSON.parse(input)
        title = parsed.title || ''
        body = parsed.body || ''
      } catch {
        console.error('Error: Invalid JSON input')
        process.exit(1)
      }
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
🔍 PR Linter - Validate Pull Request titles and descriptions

${colors.bold}Usage:${colors.reset}
  node scripts/lint-pr.mjs --title "..." --body "..."
  gh pr view --json title,body | node scripts/lint-pr.mjs --stdin
  node scripts/lint-pr.mjs --stdin < pr.json

${colors.bold}Options:${colors.reset}
  --title <text>   PR title to validate
  --body <text>    PR description to validate
  --stdin          Read JSON input from stdin (expects {title, body})
  --json           Output results as JSON
  --help, -h       Show this help

${colors.bold}Examples:${colors.reset}
  # Validate a PR
  node scripts/lint-pr.mjs --title "feat: add login #123" --body "## Summary\\nAdds login"

  # Validate current PR
  gh pr view --json title,body | node scripts/lint-pr.mjs --stdin

  # CI integration with JSON output
  gh pr view --json title,body | node scripts/lint-pr.mjs --stdin --json

${colors.bold}Validation Rules:${colors.reset}
  ${colors.red}Errors (must fix):${colors.reset}
    • Title must start with Jira-style prefix (TS-123: feat: ...)
    • Valid prefixes: ${VALID_PREFIXES.join(', ')}
    • Description must have ## Summary section
    • Description must have ## 🔗 Hierarchy section

  ${colors.yellow}Warnings (recommended):${colors.reset}
    • Use conventional commit format after ticket (feat:, fix:, etc.)
    • Keep title ≤100 chars (accounts for Jira prefix overhead)
    • Add ## Test Plan section
    • Hierarchy should link to Initiative, Epic, and Issue
    • Add screenshots for UI changes

${colors.bold}Title Format:${colors.reset}
  PREFIX-NUMBER: type(scope): description
  Example: TS-123: feat(auth): add Google Sign-In
`)
      process.exit(0)
    }
  }

  // If no input provided, try to get from current PR
  if (!title && !body && process.stdin.isTTY) {
    console.log(
      `${colors.yellow}No input provided. Trying to get current PR...${colors.reset}\n`,
    )

    try {
      const { execSync } = await import('child_process')
      const prJson = execSync('gh pr view --json title,body', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      })
      const parsed = JSON.parse(prJson)
      title = parsed.title || ''
      body = parsed.body || ''
      console.log(
        `${colors.green}Found PR: "${title.slice(0, 50)}..."${colors.reset}\n`,
      )
    } catch {
      console.error(
        `${colors.red}No PR found in current branch. Use --help for usage.${colors.reset}`,
      )
      process.exit(1)
    }
  }

  // Validate
  const titleResult = validateTitle(title)
  const bodyResult = validateBody(body)
  const results = formatResults(titleResult, bodyResult)

  // Output
  const success = jsonOutput ? printJsonResults(results) : printResults(results)

  process.exit(success ? 0 : 1)
}

main().catch((error) => {
  console.error('Error:', error.message)
  process.exit(1)
})
