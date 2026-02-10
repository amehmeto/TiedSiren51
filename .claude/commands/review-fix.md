---
description: Fetch PR review comments and fix them all in one pass.
---

Fix all pending review comments on PR #$ARGUMENTS.

## Steps

1. **Determine repo and current user:**
   ```bash
   REPO_INFO=$(gh repo view --json nameWithOwner,owner)
   REPO_NWO=$(echo "$REPO_INFO" | jq -r '.nameWithOwner')
   OWNER=$(echo "$REPO_INFO" | jq -r '.owner.login')
   ```

2. **Fetch all review comments from the PR:**
   ```bash
   gh pr view $ARGUMENTS --comments
   gh api repos/$REPO_NWO/pulls/$ARGUMENTS/comments
   ```
   Focus ONLY on comments from $OWNER. Ignore bot comments, CI status comments, and comments from other users.

3. **Ensure you are on the correct branch** for this PR:
   ```bash
   gh pr view $ARGUMENTS --json headRefName --jq '.headRefName'
   ```
   Find the worktree that has this branch checked out and `cd` into it. If no worktree exists, check out the branch directly with `git checkout <branch>`.

4. **Parse each review comment** to extract:
   - The file path and line number it's attached to
   - The comment body (my feedback / requested change)

5. **Create a todo plan** with one todo item per review comment, including the file, line reference, and what I asked for.

6. **Fix ALL review comments**, one by one, following the todo plan:
   - Apply the minimal change that addresses each comment — do NOT over-engineer
   - Do NOT modify files that weren't mentioned in review comments unless lint/test fixes require it
   - If a comment is ambiguous, make the most reasonable interpretation and note it for the summary

7. **Reply to each review comment** on the PR:
   - For each comment you fixed: reply with a concise summary of what you changed (e.g., "Fixed — extracted to variable" or "Moved `isSirenLocked` to `is-siren-locked.ts`")
   - For questions from the reviewer: reply with a direct answer to their question
   - Use the GitHub API to reply in-thread:
     ```bash
     gh api repos/$REPO_NWO/pulls/$PR_NUMBER/comments \
       -F body="Your reply" \
       -F commit_id="$(git rev-parse HEAD)" \
       -F path="file.ts" \
       -F line=1 \
       -F in_reply_to=COMMENT_ID
     ```

8. **After all fixes are applied:**
   - Run `npm run lint` and fix any violations
   - Run `npm test` and fix any test failures
   - Stage all changed files and commit with message: `fix: address PR review feedback`
   - Push with `/commit-push`

9. **After push, summarize on the PR:**
   ```bash
   gh pr comment $ARGUMENTS --body "Review feedback addressed: [summary of all changes made, one bullet per comment addressed]"
   ```

## Constraints

- Do NOT modify files that weren't mentioned in review comments unless lint/test requires it
- Do NOT over-engineer fixes — apply the minimal change that addresses each comment
- If a comment is ambiguous, make the most reasonable interpretation and note it in the PR summary comment
- Work from the correct worktree or branch for this PR
