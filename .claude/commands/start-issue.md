---
description: Manage git worktrees - create, list, prune merged PRs, or remove.
---

Run the start-issue script with the provided arguments:

```bash
./scripts/start-issue.sh $ARGUMENTS
```

After the script completes:

1. **Change to the worktree directory** using the WORKTREE_PATH from the script's SUMMARY output:
   ```bash
   cd <WORKTREE_PATH>
   ```
   This is critical - all work must happen in the worktree, not the main repo.

2. Extract the full issue content between `ISSUE_CONTENT_START` and `ISSUE_CONTENT_END` from the SUMMARY output.

3. Launch a ralph loop to implement the issue, injecting the extracted issue content:

```
/ralph-loop "Implement the following GitHub issue in this worktree.

{ISSUE_CONTENT between ISSUE_CONTENT_START and ISSUE_CONTENT_END}

Completion checklist:
- ALL acceptance criteria from the issue are met
- All unit tests pass (npm test)
- Lint passes (npm run lint)
- Changes committed and pushed with /commit-push
- CI passes on the PR
- No merge conflicts with main

When ALL criteria are met, output: <promise>COMPLETE</promise>" --completion-promise "COMPLETE" --max-iterations 5
```

4. After PR is created, update the PR description to accurately reflect ALL changes made (not just the original issue scope)
