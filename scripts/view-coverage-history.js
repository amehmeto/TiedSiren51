#!/usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs'

const HISTORY_FILE = 'coverage-history.json'

function viewHistory() {
  if (!fs.existsSync(HISTORY_FILE)) {
    console.log(
      '📊 No coverage history found. Run `yarn test:cov:track` first.',
    )
    return
  }

  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'))

    if (history.length === 0) {
      console.log('📊 Coverage history is empty.')
      return
    }

    console.log('📊 Coverage History:')
    console.log('====================================')

    history.slice(-10).forEach((entry, index) => {
      const date = new Date(entry.date).toLocaleString()
      console.log(`\n${index + 1}. ${date}`)
      console.log(`   Statements: ${entry.statements}%`)
      console.log(`   Functions:  ${entry.functions}%`)
      console.log(`   Branches:   ${entry.branches}%`)
      console.log(`   Lines:      ${entry.lines}%`)

      if (index > 0) {
        const prev = history[history.length - 10 + index - 1]
        const stmtDiff = (
          parseFloat(entry.statements) - parseFloat(prev.statements)
        ).toFixed(2)
        const funcDiff = (
          parseFloat(entry.functions) - parseFloat(prev.functions)
        ).toFixed(2)
        const branchDiff = (
          parseFloat(entry.branches) - parseFloat(prev.branches)
        ).toFixed(2)

        if (
          stmtDiff !== '0.00' ||
          funcDiff !== '0.00' ||
          branchDiff !== '0.00'
        ) {
          console.log(
            `   Changes: S:${stmtDiff > 0 ? '+' : ''}${stmtDiff}% F:${funcDiff > 0 ? '+' : ''}${funcDiff}% B:${branchDiff > 0 ? '+' : ''}${branchDiff}%`,
          )
        }
      }
    })

    console.log('\n====================================')
    console.log(`Total entries: ${history.length}`)

    if (history.length > 1) {
      const first = history[0]
      const last = history[history.length - 1]
      const totalChange = (
        parseFloat(last.statements) - parseFloat(first.statements)
      ).toFixed(2)
      console.log(
        `Overall change: ${totalChange > 0 ? '+' : ''}${totalChange}% statements`,
      )
    }
  } catch (error) {
    console.error('Error reading coverage history:', error.message)
  }
}

viewHistory()
