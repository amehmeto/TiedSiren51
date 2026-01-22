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
3. **Immediately begin implementing the issue** - read the relevant files and start coding. Do NOT stop after showing the issue summary.
