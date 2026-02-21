---
description: Resume work on the current issue after restarting Claude (worktree already exists).
---

Resume work on the current GitHub issue. The worktree, branch, and PR already exist — we just need to pick up where we left off.

**Step 1: Detect the issue number from the current branch.**

Run:
```bash
git rev-parse --abbrev-ref HEAD
```

Extract the issue number from the branch name. The branch format is `<type>/TS<issue-number>-<slug>` (e.g. `feat/TS281-change-password` → issue `281`). Parse the number between `TS` and the next `-`.

If $ARGUMENTS is a number, use that as the issue number override instead of parsing from the branch.

**If the branch is `main` or `demo`, stop and tell the user they need to be in a worktree branch.**

**Step 2: Get the PR URL for this branch.**

Run:
```bash
gh pr list --head "$(git rev-parse --abbrev-ref HEAD)" --json url --jq '.[0].url // empty'
```

If no PR is found, warn the user but continue (the ralph loop prompt will show "none" for PR).

**Step 3: Fetch the full issue content.**

Run:
```bash
gh issue view <issue-number> --comments
```

Capture the full output as the issue content.

**Step 4: Write the ralph-loop prompt to `.claude/ralph-loop-prompt.local.md`** using the Write tool:

```markdown
Implement the following GitHub issue in this worktree.

PR: {PR_URL from step 2, or "none"}

{Full issue content from step 3}

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

**Step 5: Launch the ralph loop** with a single-line invocation referencing the prompt file:

```
/ralph-loop Read and implement the task described in .claude/ralph-loop-prompt.local.md --completion-promise "COMPLETE" --max-iterations 5
```
