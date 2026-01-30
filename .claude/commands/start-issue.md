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
   cd .worktrees/<worktree-name>
   ```
   This is critical - all work must happen in the worktree, not the main repo.

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

4. After PR is created, update the PR description to accurately reflect ALL changes made (not just the original issue scope)
