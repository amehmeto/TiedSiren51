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
3. Launch `/ralph-wiggum:ralph-loop` with these acceptance criteria:
   - CI passes on the PR
   - No merge conflicts with main branch
   - All acceptance criteria from the ticket are met
   - All unit tests pass
   - Lint passes
   - PR created and ready for review
