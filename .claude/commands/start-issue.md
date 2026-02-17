---
description: Start working on a GitHub issue - launches ralph loop in the current worktree.
---

This command assumes you are already in the correct worktree (created via `/prepare-worktree`).

1. **Extract the issue number** from `$ARGUMENTS`. If no argument is provided, extract it from the current branch name (format: `<type>/TS<number>-<slug>`).

2. **Detect the PR** for the current branch:
   ```bash
   gh pr list --head "$(git branch --show-current)" --json number,url --jq '.[0] // empty'
   ```

3. **Fetch the issue content**:
   ```bash
   gh issue view <issue_number> --comments
   ```

4. **Write the ralph-loop prompt to a file** using the Write tool to create `.claude/ralph-prompt.md` with the following content (injecting extracted values):

```markdown
Implement the following GitHub issue in this worktree.

PR: {PR_URL, or "none" if not found}

{ISSUE_CONTENT from step 3}

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

5. Launch the ralph loop with a **single-line** prompt referencing the file. This is critical — the `/ralph-loop` args must be a single line with no newlines, because the Bash tool rejects multi-line commands:

```
/ralph-loop Read .claude/ralph-prompt.md and implement the task described within --completion-promise COMPLETE --max-iterations 5
```
