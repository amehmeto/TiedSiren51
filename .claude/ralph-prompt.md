Implement the following GitHub issue in this worktree.

PR: none (will be created after first commit via `gh pr create`)

## Context

The `no-inline-object-type` ESLint rule was introduced in PR #265 as a `warn` to avoid breaking existing code. It flags inline object type literals with 2+ properties, encouraging extraction into named type aliases.

## Task

1. Change `'local-rules/no-inline-object-type': 'warn'` to `'error'` in `.eslintrc.cjs`
2. Fix all files that violate this rule across the codebase by extracting inline object types into named type aliases
3. Ensure all tests pass after the refactoring

## Acceptance Criteria

- Rule is set to `error` in `.eslintrc.cjs`
- All inline object types with 2+ properties are extracted into named type aliases
- CI passes with zero violations

Before making structural changes, read /docs/adr/README.md for architectural decisions that must be followed.

Completion checklist:
- ALL acceptance criteria from the issue are met
- All unit tests pass (npm test)
- Lint passes (npm run lint)
- Changes committed and pushed with /commit-push
- CI passes on the PR
- No merge conflicts with main
- PR description updated to reflect ALL changes made

When ALL criteria are met, output: <promise>COMPLETE</promise>
