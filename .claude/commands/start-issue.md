---
description: Manage git worktrees - create, list, prune merged PRs, or remove.
---

Run the start-issue script with the provided arguments:

```bash
./scripts/start-issue.sh $ARGUMENTS
```

**If the script exits with a non-zero code, stop and report the error to the user. Do NOT proceed to the steps below.**

After the script completes successfully:

1. **Change to the worktree directory** using the WORKTREE_PATH from the script's SUMMARY output:
   ```bash
   cd <WORKTREE_PATH>
   ```
   This is critical - all work must happen in the worktree, not the main repo.

2. Extract the following from the SUMMARY output:
   - The full issue content between `ISSUE_CONTENT_START` and `ISSUE_CONTENT_END`
   - The `PR_URL` value

3. Write the full ralph-loop prompt to `.claude/ralph-loop-prompt.local.md` using the Write tool, replacing placeholders with actual extracted values:

   ```markdown
   Implement the following GitHub issue in this worktree.

   PR: {PR_URL from SUMMARY}

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

4. Launch the ralph loop with a single-line invocation referencing the prompt file:

   ```
   /ralph-loop Read and implement the task described in .claude/ralph-loop-prompt.local.md --completion-promise "COMPLETE" --max-iterations 5
   ```
