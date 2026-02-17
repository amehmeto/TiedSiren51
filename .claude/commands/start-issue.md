---
description: Start working on a GitHub issue - creates worktree and launches ralph loop.
---

First, prepare the worktree by running `/prepare-worktree $ARGUMENTS`.

**If `/prepare-worktree` fails, stop and report the error. Do NOT proceed to the steps below.**

After `/prepare-worktree` completes successfully:

1. Extract the following from the SUMMARY output:
   - The full issue content between `ISSUE_CONTENT_START` and `ISSUE_CONTENT_END`
   - The `PR_URL` value
   - If `ISSUE_CONTENT` is empty, fetch it with `gh issue view <number> --repo <owner/repo>`

2. **Write the ralph-loop prompt to a file** using the Write tool to create `.claude/ralph-prompt.md` with the following content (injecting extracted values):

```markdown
Implement the following GitHub issue in this worktree.

PR: {PR_URL from SUMMARY, or "none" if not yet created}

{ISSUE_CONTENT between ISSUE_CONTENT_START and ISSUE_CONTENT_END}

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
```

3. Launch the ralph loop with a **single-line** prompt referencing the file. This is critical — the `/ralph-loop` args must be a single line with no newlines, because the Bash tool rejects multi-line commands:

```
/ralph-loop Read .claude/ralph-prompt.md and implement the task described within --completion-promise COMPLETE --max-iterations 5
```
