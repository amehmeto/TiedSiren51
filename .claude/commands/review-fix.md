---
description: Fetch PR review comments and fix them all in one pass.
---

Fix all pending review comments on PR #$ARGUMENTS.

## Steps

1. **Determine repo owner and current user:**
   ```bash
   gh repo view --json owner --jq '.owner.login'
   gh api user --jq '.login'
   ```

2. **Fetch all review comments from the PR:**
   ```bash
   gh pr view $ARGUMENTS --comments
   gh api repos/{owner}/{repo}/pulls/$ARGUMENTS/comments
   ```
   Focus ONLY on comments from me (the repo owner). Ignore bot comments, CI status comments, and comments from other users.

3. **Ensure you are in the correct worktree** for this PR's branch:
   ```bash
   gh pr view $ARGUMENTS --json headRefName --jq '.headRefName'
   ```
   Find the worktree that has this branch checked out and `cd` into it. If no worktree exists, error and stop.

4. **Parse each review comment** to extract:
   - The file path and line number it's attached to
   - The comment body (my feedback / requested change)

5. **Create a todo plan** with one todo item per review comment, including the file, line reference, and what I asked for.

6. **Fix ALL review comments**, one by one, following the todo plan:
   - Apply the minimal change that addresses each comment — do NOT over-engineer
   - Do NOT modify files that weren't mentioned in review comments unless lint/test fixes require it
   - If a comment is ambiguous, make the most reasonable interpretation and note it for the summary

7. **After all fixes are applied:**
   - Run `npm run lint` and fix any violations
   - Run `npm test` and fix any test failures
   - Commit and push with `/commit-push` using message: `fix: address PR review feedback`

8. **After push, summarize on the PR:**
   ```bash
   gh pr comment $ARGUMENTS --body "Review feedback addressed: [summary of all changes made, one bullet per comment addressed]"
   ```

## Constraints

- Do NOT modify files that weren't mentioned in review comments unless lint/test requires it
- Do NOT over-engineer fixes — apply the minimal change that addresses each comment
- If a comment is ambiguous, make the most reasonable interpretation and note it in the PR summary comment
- Work from the correct worktree for this PR branch
