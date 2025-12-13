# CI/CD Pipelines

## GitHub Actions Workflow

### PR Validation (.github/workflows/pr.yml)

```yaml
name: PR Validation

on:
  pull_request:

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Run tests with coverage
        run: npm run test:cov

      - name: Store PR coverage
        run: bash scripts/store-coverage.sh pr-coverage.json

      - name: Get base branch coverage
        run: bash scripts/get-base-coverage.sh "${{ github.event.pull_request.base.ref }}"

      - name: Compare coverage and comment
        uses: actions/github-script@v7
        with:
          script: |
            const compareAndComment = require('./scripts/compare-coverage.cjs');
            await compareAndComment({ github, context });
```

### Release Workflow (.github/workflows/release.yml)

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

### Path Filtering (.github/workflows/path-filter.yml)

Optimize CI by only running relevant jobs:

```yaml
name: Path Filter

on:
  workflow_call:
    outputs:
      app-changed:
        value: ${{ jobs.filter.outputs.app-changed }}
      shell-only:
        value: ${{ jobs.filter.outputs.shell-only }}

jobs:
  filter:
    runs-on: ubuntu-latest
    outputs:
      app-changed: ${{ steps.filter.outputs.app }}
      shell-only: ${{ steps.filter.outputs.shell-only }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            app:
              - 'src/**'
              - 'core/**'
              - 'infra/**'
              - 'ui/**'
              - 'package*.json'
              - 'tsconfig.json'
            shell-only:
              - '**/*.sh'
              - '!src/**'
```

## Git Hooks (.husky/)

### Pre-commit (.husky/pre-commit)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Prevent commits to main/master
sh .husky/scripts/no-commits-on-main.sh

# Run lint-staged
npx lint-staged
```

### Pre-push (.husky/pre-push)

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Guard scripts
sh .husky/scripts/branch-name-check.sh
sh .husky/scripts/uncommitted-files-check.sh

# Run tests
npm run test:cov
node scripts/compare-coverage.cjs
```

## Guard Scripts

### Branch Name Check (.husky/scripts/branch-name-check.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

BRANCH=$(git rev-parse --abbrev-ref HEAD)
VALID_PREFIXES="feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert"

# Optional: Add ticket prefix validation
# TICKET_PREFIX="PROJ"
# PATTERN="^($VALID_PREFIXES)/($TICKET_PREFIX-[0-9]+-)?.+"

PATTERN="^($VALID_PREFIXES)/.+"

if [[ ! $BRANCH =~ $PATTERN ]]; then
    echo "Error: Branch name '$BRANCH' doesn't match pattern"
    echo "Expected: <type>/<description>"
    echo "Types: $VALID_PREFIXES"
    echo "Examples:"
    echo "  feat/add-login-button"
    echo "  fix/user-auth-bug"
    exit 1
fi
```

### No Direct Push to Main (.husky/scripts/no-direct-push-main.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

BRANCH=$(git rev-parse --abbrev-ref HEAD)
PROTECTED_BRANCHES="main master"

for protected in $PROTECTED_BRANCHES; do
    if [[ "$BRANCH" == "$protected" ]]; then
        echo "Error: Direct push to '$BRANCH' is not allowed"
        echo "Please create a feature branch and open a PR"
        exit 1
    fi
done
```

### Uncommitted Files Check (.husky/scripts/uncommitted-files-check.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

if ! git diff-index --quiet HEAD --; then
    echo "Error: You have uncommitted changes"
    echo "Please commit or stash them before pushing"
    git status --short
    exit 1
fi
```

## Coverage Scripts

### Store Coverage (scripts/store-coverage.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

OUTPUT_FILE="${1:-coverage.json}"
COVERAGE_DIR="coverage"

if [[ -f "$COVERAGE_DIR/coverage-summary.json" ]]; then
    cp "$COVERAGE_DIR/coverage-summary.json" "$OUTPUT_FILE"
    echo "Coverage stored to $OUTPUT_FILE"
else
    echo "No coverage file found"
    exit 1
fi
```

### Get Base Coverage (scripts/get-base-coverage.sh)

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${1:-main}"
OUTPUT_FILE="base-coverage.json"

git fetch origin "$BASE_BRANCH"

# Check if coverage exists on base branch
if git show "origin/$BASE_BRANCH:coverage/coverage-summary.json" > /dev/null 2>&1; then
    git show "origin/$BASE_BRANCH:coverage/coverage-summary.json" > "$OUTPUT_FILE"
else
    # Create empty baseline if none exists
    echo '{"total":{"lines":{"pct":0},"statements":{"pct":0},"functions":{"pct":0},"branches":{"pct":0}}}' > "$OUTPUT_FILE"
fi
```
