Sync the current feature branch with main and push:

1. **Fetch and merge main**:
   - Run `git fetch origin main`
   - Run `git merge origin/main --no-edit`

2. **Handle conflicts if any**:
   - If the merge has conflicts, list them clearly and resolve each one
   - Prefer keeping both sides for additive changes (new rules, new imports, etc.)
   - For true conflicts, prefer the feature branch changes when intent is clear, otherwise ask
   - After resolving, verify no conflict markers remain with grep
   - Stage resolved files and complete the merge commit with `git commit --no-edit`

3. **Verify**:
   - Run `git status` to confirm clean working tree
   - Run `git log --oneline -3` to confirm merge commit

4. **Push**:
   - Run `SKIP_E2E_CHECK=true git push` to push the merge
   - Wait for CI to pass

5. **Report**:
   - Confirm the branch is up to date with main
   - Report any files that had conflicts and how they were resolved
