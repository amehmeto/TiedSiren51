---
description: Manage git worktrees - create, list, prune merged PRs, or remove.
---

Run the start-issue script with the provided arguments:

```bash
./scripts/start-issue.sh $ARGUMENTS
```

After the script completes:

1. Navigate to the new worktree directory if one was created
2. Fetch the issue details with `gh issue view <issue-number>`
3. Launch a ralph loop to implement the issue:

```
/ralph-loop "Implement issue #<issue-number>.

Read the issue acceptance criteria and implement them fully.

Completion checklist:
- All acceptance criteria from the ticket are met
- All unit tests pass (npm test)
- Lint passes (npm run lint)
- PR created with /commit-push
- CI passes on the PR
- No merge conflicts with main branch

When ALL criteria are met, output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE" --max-iterations 5
```
