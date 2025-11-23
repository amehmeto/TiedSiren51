# Coverage Tracking and History

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 maintains high test coverage (currently 98.83%). Need to:

- **Track coverage over time**: See trends and regressions
- **PR reviews**: Compare coverage changes in pull requests
- **Quality gates**: Ensure coverage doesn't drop
- **Visibility**: Make coverage visible to team
- **Accountability**: Know when/where coverage drops

**Requirements**:
- Track coverage metrics (statements, functions, branches, lines)
- Store coverage history locally
- Generate reports for PRs
- GitHub Actions integration
- Prevent coverage regressions

## Decision

Implement **custom coverage tracking scripts** with GitHub Actions integration.

### Implementation

**1. Coverage Scripts** (`/scripts/`)

```javascript
// /scripts/track-coverage.js
// Runs tests with coverage and saves to history

// /scripts/view-coverage-history.js
// Displays coverage trends over time

// /scripts/compare-coverage.js
// Compares current coverage to base branch (for PRs)
```

**2. Package Scripts**

```json
{
  "test:cov": "vitest run --coverage",
  "test:cov:track": "node scripts/track-coverage.js",
  "test:cov:history": "node scripts/view-coverage-history.js"
}
```

**3. GitHub Actions** (`.github/workflows/`)

```yaml
name: Coverage Report

on: [pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests with coverage
        run: yarn test:cov

      - name: Compare coverage
        run: node scripts/compare-coverage.js

      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            # Post coverage comparison as PR comment
```

**4. Coverage Storage**

```
/.coverage-history/
  ├── 2025-01-28.json
  ├── 2025-01-27.json
  └── 2025-01-26.json
```

## Consequences

### Positive

- **Visibility**: Coverage trends visible in README
- **PR feedback**: Automatic coverage comparison on PRs
- **Accountability**: Easy to see when coverage drops
- **History**: Coverage tracked over time
- **Quality gates**: Can enforce minimum coverage
- **Motivation**: Team can see progress toward 100%
- **Custom metrics**: Track domain-specific coverage
- **Local tracking**: Works without CI
- **Lightweight**: No external services needed

### Negative

- **Maintenance**: Custom scripts need maintenance
- **Storage**: Git history grows with coverage data
- **Manual tracking**: Developers must remember to run tracking script
- **No visualization**: Plain data, no fancy charts
- **Limited features**: Not as full-featured as SaaS tools

### Neutral

- **Custom solution**: More control, less convenience
- **Local-first**: Data stored in repo, not external service

## Alternatives Considered

### 1. Codecov / Coveralls
**Rejected because**:
- External service dependency
- Costs money for private repos (Codecov free tier limited)
- Overkill for single-person project
- Data leaves repository
- Adds CI complexity

### 2. No Coverage Tracking
**Rejected because**:
- Can't see trends
- Coverage could drop unnoticed
- No PR feedback
- Harder to improve

### 3. GitHub Actions Only (No Local)
**Rejected because**:
- Can't track coverage locally
- Requires pushing to see results
- Slower feedback

### 4. Manual Checks Only
**Rejected because**:
- Easy to forget
- Inconsistent
- No automation
- More effort

## Implementation Notes

### Key Files
- `/scripts/track-coverage.js` - Coverage tracking script
- `/scripts/view-coverage-history.js` - View historical data
- `/scripts/compare-coverage.js` - Compare coverage between commits
- `/.coverage-history/` - Historical coverage data
- `/.github/workflows/coverage.yml` - CI automation

### Coverage Metrics

Tracked metrics:
- **Statements**: % of statements executed
- **Functions**: % of functions called
- **Branches**: % of code branches taken
- **Lines**: % of lines executed

Current target: **98%+**

### Track Coverage Script

```javascript
// /scripts/track-coverage.js
const fs = require('fs')
const { execSync } = require('child_process')

// Run tests with coverage
execSync('vitest run --coverage', { stdio: 'inherit' })

// Read coverage summary
const coverage = JSON.parse(
  fs.readFileSync('coverage/coverage-summary.json', 'utf8')
)

const today = new Date().toISOString().split('T')[0]

// Save to history
const historyFile = `.coverage-history/${today}.json`
fs.writeFileSync(historyFile, JSON.stringify(coverage, null, 2))

console.log(`Coverage saved to ${historyFile}`)
```

### View History Script

```javascript
// /scripts/view-coverage-history.js
const fs = require('fs')
const path = require('path')

const historyDir = '.coverage-history'
const files = fs.readdirSync(historyDir).sort().reverse()

console.log('Coverage History (Last 10 Days):')
console.log('Date       | Statements | Functions | Branches | Lines')
console.log('-----------|------------|-----------|----------|------')

files.slice(0, 10).forEach(file => {
  const data = JSON.parse(
    fs.readFileSync(path.join(historyDir, file), 'utf8')
  )
  const { statements, functions, branches, lines } = data.total

  console.log(
    `${file.replace('.json', '')} | ${statements.pct}% | ${functions.pct}% | ${branches.pct}% | ${lines.pct}%`
  )
})
```

### PR Coverage Comparison

```javascript
// /scripts/compare-coverage.js
const fs = require('fs')

// Current coverage
const current = JSON.parse(
  fs.readFileSync('coverage/coverage-summary.json', 'utf8')
)

// Base branch coverage (from last history entry)
const historyFiles = fs.readdirSync('.coverage-history').sort()
const lastFile = historyFiles[historyFiles.length - 1]
const base = JSON.parse(
  fs.readFileSync(`.coverage-history/${lastFile}`, 'utf8')
)

// Compare
const diff = {
  statements: current.total.statements.pct - base.total.statements.pct,
  functions: current.total.functions.pct - base.total.functions.pct,
  branches: current.total.branches.pct - base.total.branches.pct,
  lines: current.total.lines.pct - base.total.lines.pct,
}

// Generate markdown comment
console.log('## Coverage Comparison')
console.log('')
console.log('| Metric | Current | Base | Change |')
console.log('|--------|---------|------|--------|')
Object.entries(diff).forEach(([metric, change]) => {
  const emoji = change >= 0 ? '📈' : '📉'
  const sign = change >= 0 ? '+' : ''
  console.log(
    `| ${metric} | ${current.total[metric].pct}% | ${base.total[metric].pct}% | ${emoji} ${sign}${change.toFixed(2)}% |`
  )
})
```

### GitHub Actions Workflow

```yaml
name: Test Coverage

on:
  pull_request:
    branches: [main]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history for comparison

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: yarn install

      - name: Run tests with coverage
        run: yarn test:cov

      - name: Compare coverage
        id: coverage
        run: |
          OUTPUT=$(node scripts/compare-coverage.js)
          echo "$OUTPUT" >> $GITHUB_STEP_SUMMARY

      - name: Comment PR
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs')
            const output = fs.readFileSync('coverage-comment.md', 'utf8')

            github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: output
            })
```

### README Badge

```markdown
**Current Coverage: 98.83%** 📊
```

### Coverage History Format

```json
{
  "total": {
    "statements": { "pct": 98.83 },
    "functions": { "pct": 98.5 },
    "branches": { "pct": 97.2 },
    "lines": { "pct": 98.83 }
  },
  "timestamp": "2025-01-28T12:00:00Z",
  "commit": "abc123..."
}
```

### Related ADRs
- [Vitest Over Jest](vitest-over-jest.md)
- [Test Store Factory](test-store-factory.md)

## References

- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- `/scripts/track-coverage.js` - Implementation
- `/README.md:15` - Current coverage display
