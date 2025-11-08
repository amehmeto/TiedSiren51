#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */

/**
 * Compares PR coverage with base branch coverage and posts/updates a GitHub PR comment
 * Usage: Called from GitHub Actions with github and context objects
 */

module.exports = async ({ github, context }) => {
  const fs = require('fs')

  let prCoverage, baseCoverage

  try {
    prCoverage = JSON.parse(fs.readFileSync('pr-coverage.json', 'utf8'))
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

  try {
    baseCoverage = JSON.parse(fs.readFileSync('base-coverage.json', 'utf8'))
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

  const formatChange = (current, previous) => {
    const diff = (current - previous).toFixed(2)
    const arrow = diff > 0 ? '📈' : diff < 0 ? '📉' : '➡️'
    const sign = diff > 0 ? '+' : ''
    return `${arrow} ${sign}${diff}%`
  }

  const stmtChange = formatChange(prStats.statements.pct, baseStats.statements.pct)
  const funcChange = formatChange(prStats.functions.pct, baseStats.functions.pct)
  const branchChange = formatChange(prStats.branches.pct, baseStats.branches.pct)
  const lineChange = formatChange(prStats.lines.pct, baseStats.lines.pct)

  const comment = `## 📊 Coverage Report

| Metric | Base Branch | This PR | Change |
|--------|-------------|---------|--------|
| **Statements** | ${baseStats.statements.pct.toFixed(2)}% | ${prStats.statements.pct.toFixed(2)}% | ${stmtChange} |
| **Functions** | ${baseStats.functions.pct.toFixed(2)}% | ${prStats.functions.pct.toFixed(2)}% | ${funcChange} |
| **Branches** | ${baseStats.branches.pct.toFixed(2)}% | ${prStats.branches.pct.toFixed(2)}% | ${branchChange} |
| **Lines** | ${baseStats.lines.pct.toFixed(2)}% | ${prStats.lines.pct.toFixed(2)}% | ${lineChange} |

${prStats.statements.pct >= baseStats.statements.pct ? '✅ Coverage maintained or improved!' : '⚠️ Coverage decreased'}`

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
