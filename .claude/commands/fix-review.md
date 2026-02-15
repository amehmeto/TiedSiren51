---
description: Fetch PR review comments and fix them all in one pass.
---

Fix all pending review comments on PR #$ARGUMENTS.

## Steps

1. **Fetch actionable PR comments using the dedicated script:**
   ```bash
   ./scripts/fetch-pr-comments.sh $ARGUMENTS --needs-action
   ```
   This returns structured JSON pre-filtered to only actionable threads:
   - `repo` / `owner` — repo metadata (use for API calls in later steps)
   - `issue_comments` — top-level PR comments from the owner
   - `reviews` — review bodies and states from the owner
   - `review_comment_threads` — only threads that need action (unresolved, no bot reply as last comment, from owner)

   **Interpreting the output:**
   - All returned threads need action — no further filtering required
   - Comments with `"outdated": true` refer to code that has since changed — verify if the feedback still applies
   - `has_bot_reply` indicates a previous bot response exists in the thread (but was followed by a new owner comment)

2. **Ensure you are on the correct branch** for this PR:
   ```bash
   gh pr view $ARGUMENTS --json headRefName --jq '.headRefName'
   ```
   Find the worktree that has this branch checked out and `cd` into it. If no worktree exists, check out the branch directly with `git checkout <branch>`.

3. **Parse each review comment** to extract:
   - The file path and line number it's attached to
   - The comment body (my feedback / requested change)

4. **Create a todo plan** with one todo item per review comment, including the file, line reference, and what I asked for.

5. **Fix ALL review comments**, one by one, following the todo plan:
   - Apply the minimal change that addresses each comment — do NOT over-engineer
   - Do NOT modify files that weren't mentioned in review comments unless lint/test fixes require it
   - If a comment is ambiguous, make the most reasonable interpretation and note it for the summary

6. **Reply to each review comment** on the PR:
   - **Always prefix replies with `🤖 Claude's answer:` ** so they're distinguishable from the repo owner's own comments
   - For each comment you fixed: reply with a concise summary of what you changed (e.g., "🤖 Claude's answer: Fixed — extracted to variable")
   - For questions from the reviewer: reply with a direct answer to their question
   - Reply in-thread using the wrapper script:
     ```bash
     ./scripts/reply-pr-comment.sh $ARGUMENTS COMMENT_ID "🤖 Claude's answer: Your reply"
     ```

7. **After all fixes are applied:**
   - Run `npm run lint` and fix any violations
   - Run `npm test` and fix any test failures
   - Stage all changed files and commit with message: `fix: address PR review feedback`
   - Push with `/commit-push`

8. **After push, summarize on the PR:**
   ```bash
   gh pr comment $ARGUMENTS --body "Review feedback addressed: [summary of all changes made, one bullet per comment addressed]"
   ```

## Constraints

- Do NOT modify files that weren't mentioned in review comments unless lint/test requires it
- Do NOT over-engineer fixes — apply the minimal change that addresses each comment
- If a comment is ambiguous, make the most reasonable interpretation and note it in the PR summary comment
- Work from the correct worktree or branch for this PR
