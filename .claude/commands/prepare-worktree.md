---
description: Manage git worktrees - create, list, prune merged PRs, or remove.
---

Run the start-issue script with the provided arguments:

```bash
./scripts/prepare-worktree.sh $ARGUMENTS
```

**If the script exits with a non-zero code, stop and report the error to the user. Do NOT proceed to the steps below.**

If the command was `--list`, `--prune`, or `--remove`, stop here and report the output to the user.

After the script completes successfully (issue number case):

1. **Change to the worktree directory** using the WORKTREE_PATH from the script's SUMMARY output:
   ```bash
   cd <WORKTREE_PATH>
   ```
   This is critical - all work must happen in the worktree, not the main repo.

2. Report the SUMMARY output to the user (WORKTREE_PATH, BRANCH, PR_URL, etc.).
