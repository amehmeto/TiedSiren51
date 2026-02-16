#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */

/**
 * Compares coverage with base branch
 * Usage:
 *   - CLI: node scripts/compare-coverage.cjs
 *   - GitHub Actions: Called with github and context objects
 */

const fs = require('fs')

// Shared calculation functions
const calculateFolderCoverage = (coverage, folderPath) => {
  const files = Object.keys(coverage).filter(
    (path) =>
      path.includes(`/${folderPath}/`) && !path.includes('node_modules'),
  )

  if (files.length === 0) {
    return {
      statements: { pct: 0 },
      functions: { pct: 0 },
      branches: { pct: 0 },
      lines: { pct: 0 },
    }
  }

  const totals = files.reduce(
    (acc, file) => {
      const fileCov = coverage[file]
      acc.statements.covered += fileCov.statements?.covered || 0
      acc.statements.total += fileCov.statements?.total || 0
      acc.functions.covered += fileCov.functions?.covered || 0
      acc.functions.total += fileCov.functions?.total || 0
      acc.branches.covered += fileCov.branches?.covered || 0
      acc.branches.total += fileCov.branches?.total || 0
      acc.lines.covered += fileCov.lines?.covered || 0
      acc.lines.total += fileCov.lines?.total || 0
      return acc
    },
    {
      statements: { covered: 0, total: 0 },
      functions: { covered: 0, total: 0 },
      branches: { covered: 0, total: 0 },
      lines: { covered: 0, total: 0 },
    },
  )

  return {
    statements: {
      pct: totals.statements.total
        ? (totals.statements.covered / totals.statements.total) * 100
        : 0,
    },
    functions: {
      pct: totals.functions.total
        ? (totals.functions.covered / totals.functions.total) * 100
        : 0,
    },
    branches: {
      pct: totals.branches.total
        ? (totals.branches.covered / totals.branches.total) * 100
        : 0,
    },
    lines: {
      pct: totals.lines.total
        ? (totals.lines.covered / totals.lines.total) * 100
        : 0,
    },
  }
}

const formatChange = (current, previous) => {
  const diff = (current - previous).toFixed(2)
  const arrow = diff > 0 ? '🟢⬆️' : diff < 0 ? '🔴⬇️' : '➡️'
  const sign = diff > 0 ? '+' : ''
  return `${arrow} ${sign}${diff}%`
}

const getCoverageData = () => {
  let prCoverage, baseCoverage

  try {
    const prCoverageRaw = fs.readFileSync('pr-coverage.json', 'utf8')
    prCoverage = JSON.parse(prCoverageRaw)
  } catch {
    // Try coverage-summary.json for CLI mode
    try {
      const coverageSummaryRaw = fs.readFileSync('coverage/coverage-summary.json', 'utf8')
      prCoverage = JSON.parse(coverageSummaryRaw)
    } catch {
      prCoverage = {
        total: {
          statements: { pct: 0 },
          functions: { pct: 0 },
          branches: { pct: 0 },
          lines: { pct: 0 },
        },
      }
    }
  }

  try {
    const baseCoverageRaw = fs.readFileSync('base-coverage.json', 'utf8')
    baseCoverage = JSON.parse(baseCoverageRaw)
  } catch {
    baseCoverage = {
      total: {
        statements: { pct: 0 },
        functions: { pct: 0 },
        branches: { pct: 0 },
        lines: { pct: 0 },
      },
    }
  }

  const prStats = prCoverage.total
  const baseStats = baseCoverage.total

  const prUi = calculateFolderCoverage(prCoverage, 'ui')
  const baseUi = calculateFolderCoverage(baseCoverage, 'ui')
  const prCore = calculateFolderCoverage(prCoverage, 'core')
  const baseCore = calculateFolderCoverage(baseCoverage, 'core')
  const prInfra = calculateFolderCoverage(prCoverage, 'infra')
  const baseInfra = calculateFolderCoverage(baseCoverage, 'infra')

  return {
    prStats,
    baseStats,
    prUi,
    baseUi,
    prCore,
    baseCore,
    prInfra,
    baseInfra,
  }
}

const formatCLI = (data) => {
  const {
    prStats,
    baseStats,
    prUi,
    baseUi,
    prCore,
    baseCore,
    prInfra,
    baseInfra,
  } = data

  const formatRow = (label, current, base) => {
    const currentStr = current.toFixed(2).padStart(6) + '%'
    const baseStr = base.toFixed(2).padStart(6) + '%'
    const change = formatChange(current, base)
    return `${label.padEnd(15)} ${baseStr}  ${currentStr}  ${change}`
  }

  console.log('\n📊 Coverage Report\n')
  console.log('Metric          Base      Current  Change')
  console.log('─'.repeat(60))
  const statementsRow = formatRow('Statements', prStats.statements.pct, baseStats.statements.pct)
  console.log(statementsRow)
  const functionsRow = formatRow('Functions', prStats.functions.pct, baseStats.functions.pct)
  console.log(functionsRow)
  const branchesRow = formatRow('Branches', prStats.branches.pct, baseStats.branches.pct)
  console.log(branchesRow)
  const linesRow = formatRow('Lines', prStats.lines.pct, baseStats.lines.pct)
  console.log(linesRow)
  console.log('')
  const uiLinesRow = formatRow('UI (Lines)', prUi.lines.pct, baseUi.lines.pct)
  console.log(uiLinesRow)
  const coreLinesRow = formatRow('Core (Lines)', prCore.lines.pct, baseCore.lines.pct)
  console.log(coreLinesRow)
  const infraLinesRow = formatRow('Infra (Lines)', prInfra.lines.pct, baseInfra.lines.pct)
  console.log(infraLinesRow)
  console.log('')

  if (prStats.statements.pct >= baseStats.statements.pct) {
    console.log('✅ Coverage maintained or improved!')
  } else {
    console.log('⚠️  Coverage decreased')
  }
  console.log('')
}

const formatGitHub = (data) => {
  const {
    prStats,
    baseStats,
    prUi,
    baseUi,
    prCore,
    baseCore,
    prInfra,
    baseInfra,
  } = data

  const stmtChange = formatChange(
    prStats.statements.pct,
    baseStats.statements.pct,
  )
  const funcChange = formatChange(
    prStats.functions.pct,
    baseStats.functions.pct,
  )
  const branchChange = formatChange(
    prStats.branches.pct,
    baseStats.branches.pct,
  )
  const lineChange = formatChange(prStats.lines.pct, baseStats.lines.pct)

  const uiChange = formatChange(prUi.lines.pct, baseUi.lines.pct)
  const coreChange = formatChange(prCore.lines.pct, baseCore.lines.pct)
  const infraChange = formatChange(prInfra.lines.pct, baseInfra.lines.pct)

  return `## 📊 Coverage Report

| Metric | Base Branch | This PR | Change |
|--------|-------------|---------|--------|
| **Statements** | ${baseStats.statements.pct.toFixed(2)}% | ${prStats.statements.pct.toFixed(2)}% | ${stmtChange} |
| **Functions** | ${baseStats.functions.pct.toFixed(2)}% | ${prStats.functions.pct.toFixed(2)}% | ${funcChange} |
| **Branches** | ${baseStats.branches.pct.toFixed(2)}% | ${prStats.branches.pct.toFixed(2)}% | ${branchChange} |
| **Lines** | ${baseStats.lines.pct.toFixed(2)}% | ${prStats.lines.pct.toFixed(2)}% | ${lineChange} |
| | | | |
| **UI** (Lines) | ${baseUi.lines.pct.toFixed(2)}% | ${prUi.lines.pct.toFixed(2)}% | ${uiChange} |
| **Core** (Lines) | ${baseCore.lines.pct.toFixed(2)}% | ${prCore.lines.pct.toFixed(2)}% | ${coreChange} |
| **Infra** (Lines) | ${baseInfra.lines.pct.toFixed(2)}% | ${prInfra.lines.pct.toFixed(2)}% | ${infraChange} |

${prStats.statements.pct >= baseStats.statements.pct ? '✅ Coverage maintained or improved!' : '⚠️ Coverage decreased'}`
}

// GitHub Actions mode
module.exports = async ({ github, context }) => {
  const data = getCoverageData()
  const comment = formatGitHub(data)

  // Find existing coverage comment
  const { data: comments } = await github.rest.issues.listComments({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
  })

  const existingComment = comments.find((comment) =>
    comment.body.includes('📊 Coverage Report'),
  )

  if (existingComment) {
    // Update existing comment
    await github.rest.issues.updateComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      comment_id: existingComment.id,
      body: comment,
    })
  } else {
    // Create new comment
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: comment,
    })
  }
}

// CLI mode
if (require.main === module) {
  const data = getCoverageData()
  formatCLI(data)
}
