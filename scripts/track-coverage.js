#!/usr/bin/env node
/* eslint-disable no-console, no-unused-vars */

import fs from 'fs'

const COVERAGE_FILE = 'coverage/coverage-final.json'
const HISTORY_FILE = 'coverage-history.json'

function getCurrentCoverage() {
  try {
    const coverageData = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf8'))

    // Calculate overall coverage
    let totalFunctions = 0
    let coveredFunctions = 0
    let totalBranches = 0
    let coveredBranches = 0
    let totalStatements = 0
    let coveredStatements = 0

    Object.values(coverageData).forEach((file) => {
      if (file.s) {
        totalStatements += Object.keys(file.s).length
        coveredStatements += Object.values(file.s).filter(
          (count) => count > 0,
        ).length
      }

      if (file.f) {
        totalFunctions += Object.keys(file.f).length
        coveredFunctions += Object.values(file.f).filter(
          (count) => count > 0,
        ).length
      }

      if (file.b) {
        Object.values(file.b).forEach((branch) => {
          totalBranches += branch.length
          coveredBranches += branch.filter((count) => count > 0).length
        })
      }
    })

    return {
      date: new Date().toISOString(),
      statements:
        totalStatements > 0
          ? ((coveredStatements / totalStatements) * 100).toFixed(2)
          : '0',
      functions:
        totalFunctions > 0
          ? ((coveredFunctions / totalFunctions) * 100).toFixed(2)
          : '0',
      branches:
        totalBranches > 0
          ? ((coveredBranches / totalBranches) * 100).toFixed(2)
          : '0',
      lines:
        totalStatements > 0
          ? ((coveredStatements / totalStatements) * 100).toFixed(2)
          : '0',
    }
  } catch (error) {
    console.error('Error reading coverage file:', error.message)
    process.exit(1)
  }
}

function updateHistory(newCoverage) {
  let history = []

  if (fs.existsSync(HISTORY_FILE)) {
    try {
      history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))
    } catch (error) {
      console.warn('Error reading history file, starting fresh:', error.message)
    }
  }

  // Add new coverage data
  history.push(newCoverage)

  // Keep only last 100 entries
  if (history.length > 100) history = history.slice(-100)

  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2))

  console.log(`\n📊 Coverage tracking updated:`)
  console.log(`   Statements: ${newCoverage.statements}%`)
  console.log(`   Functions:  ${newCoverage.functions}%`)
  console.log(`   Branches:   ${newCoverage.branches}%`)
  console.log(`   Lines:      ${newCoverage.lines}%`)

  if (history.length > 1) {
    const previous = history[history.length - 2]
    const stmtDiff = (
      parseFloat(newCoverage.statements) - parseFloat(previous.statements)
    ).toFixed(2)
    console.log(
      `   Change:     ${stmtDiff > 0 ? '+' : ''}${stmtDiff}% statements`,
    )
  }
}

const coverage = getCurrentCoverage()
updateHistory(coverage)
