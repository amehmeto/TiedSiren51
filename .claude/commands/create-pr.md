---
description: Create a feature branch, commit changes, push, and open a PR.
---

Create PR workflow:

1. **Check current branch state**:
   - Run `git branch --show-current` to get the current branch
   - Run `git status` to see uncommitted changes
   - Run `git log origin/main..HEAD --oneline` to see unpushed commits

2. **Create feature branch if on main**:
   - If on `main` or `master`:
     - First, create a GitHub issue if one doesn't exist: `gh issue create --title "<description>" --body "..."`
     - Generate branch name with format: `<type>/TS<issue-number>-<short-description>`
     - Example: `feat/TS42-add-dark-mode`, `fix/TS243-login-validation`
     - Types: feat, fix, refactor, chore, docs, test, perf
     - Run `git checkout -b <branch-name>`
   - If already on a feature branch, continue with that branch

3. **Stage and commit changes**:
   - Run `git add -A` to stage all changes (including `.claude/` config files)
   - Create a conventional commit message based on the changes
   - Use HEREDOC format:
   ```
   git commit -m "$(cat <<'EOF'
   <type>(<scope>): <description>

   <optional body explaining what and why>

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Push to remote**:
   - Use `git push -u origin <branch-name>` to push and set upstream
   - If e2e check prompt fails (non-interactive), use `SKIP_E2E_CHECK=true git push -u origin <branch-name>`

5. **Create or update PR**:
   - Check if PR exists: `gh pr view --json url 2>/dev/null`
   - If no PR exists, create one:
   ```bash
   gh pr create --title "<type>(<scope>): <description>" --body "$(cat <<'EOF'
   ## Summary
   <bullet points describing the changes>

   ## Test plan
   - [ ] Unit tests pass
   - [ ] Lint passes
   - [ ] Manual testing completed

   ---
   Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```
   - If PR exists, update the description with `gh pr edit --body` to reflect current changes

6. **Output the PR URL** so the user can review it.

Execute this workflow now.
