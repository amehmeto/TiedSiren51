---
description: Create a git worktree with npm ci, push branch, and create draft PR. Automatically navigates to the new worktree.
---

## User Input

```text
$ARGUMENTS
```

## Worktree Creation Workflow

### Step 0: Analyze and Clean Up Existing Worktrees

**Before creating any new worktree, always perform cleanup:**

1. Run `git worktree list` to get all existing worktrees
2. For each worktree (except the main one):
   - Extract the branch name from the worktree
   - Check if there's an associated PR using `gh pr list --head <branch-name> --json number,state,mergedAt`
   - If the PR has been **merged** or **closed**:
     - Inform the user: "Found merged/closed PR #X for worktree <name>, removing..."
     - Run `git worktree remove <path>` to remove the worktree
     - Run `git branch -d <branch-name>` to delete the local branch (use `-D` if needed)
3. Run `git worktree prune` to clean up stale worktree references
4. Report summary: "Cleaned up X worktrees with merged/closed PRs"

### Step 1: Parse Arguments

The user may provide:
- A PR number (e.g., `123`)
- A branch name (e.g., `feat/my-feature`)
- Both PR number and branch (e.g., `123 feat/my-feature`)
- A cleanup flag (e.g., `--remove feat-my-feature` or `--prune`)
- Nothing (will prompt for details)

**Handle cleanup flags first:**
- `--remove <worktree-name>`: Remove a specific worktree and its branch
- `--prune`: Only run cleanup (Step 0) without creating a new worktree
- `--list`: Show all existing worktrees with their PR status

### Step 2: Determine Branch and Worktree Name

**If `--remove <name>` is provided:**
1. Find the worktree matching the name in `git worktree list`
2. Get the branch name from the worktree
3. Run `git worktree remove <path>`
4. Delete the local branch: `git branch -D <branch-name>`
5. Report success and exit

**If `--prune` is provided:**
1. Run only Step 0 (cleanup)
2. Report summary and exit

**If `--list` is provided:**
1. Run `git worktree list` to get all worktrees
2. For each worktree, check PR status using `gh pr list --head <branch> --json number,state,title,url`
3. Display a formatted table with: Path, Branch, PR #, PR Status, PR Title
4. Exit after displaying

**If PR number is provided:**
1. Use `gh pr view <PR_NUMBER> --json headRefName,number` to get the branch name
2. Name the worktree: `worktrees/PR<number>-<branch-name>`

**If branch name is provided (no PR):**
1. Check if branch exists locally or remotely using `git branch -a | grep <branch>`
2. If exists: Create worktree with that branch
3. Name the worktree: `worktrees/<branch-name>` (with `/` replaced by `-`)

**If nothing is provided:**
1. Ask the user: "What is this branch about? (e.g., 'fix login button styling', 'add user authentication')"
2. Based on their description, suggest a branch name following conventional naming:
   - Bug fixes: `fix/<short-description>`
   - Features: `feat/<short-description>`
   - Refactoring: `refactor/<short-description>`
   - Docs: `docs/<short-description>`
3. Confirm the suggested branch name with the user
4. Create the branch from `main`
5. Name the worktree: `worktrees/<branch-name>` (with `/` replaced by `-`)

### Step 3: Create Worktree

1. Ensure the `worktrees/` directory exists at the repository root level (sibling to this repo)
2. Worktree path should be: `../worktrees/<worktree-name>`
3. Run: `git worktree add ../worktrees/<worktree-name> <branch-name>`
   - If branch doesn't exist, use: `git worktree add -b <branch-name> ../worktrees/<worktree-name> main`

### Step 4: Install Dependencies

1. Change to the worktree directory
2. Run `npm ci` to install dependencies
3. Report success or any errors

### Step 5: Report

Output a summary:
- Worktree path (absolute)
- Branch name
- PR number (if applicable)
- npm ci status

### Step 6: Navigate to Worktree

After creating the worktree and installing dependencies, **automatically navigate to the new worktree directory**:

1. Use `cd <worktree-absolute-path>` to change to the new worktree
2. This sets the working directory for all subsequent commands in the conversation
3. Confirm to the user that you are now working in the new worktree context

### Step 7: Push Branch and Create Draft PR

**Only for new branches** (skip if checking out an existing PR):

1. Push the branch to remote: `SKIP_E2E_CHECK=true git push -u origin <branch-name>`
2. Create a draft PR using `gh pr create` with enhanced template:
   ```bash
   gh pr create --draft --title "<type>: <description>" --body "$(cat <<'EOF'
   ## Summary

   <!-- Brief description of what this PR does and why -->

   ## Changes

   - [ ] TODO: List changes made

   ## Related Issues

   <!-- Link related issues: Closes #123, Fixes #456, Related to #789 -->

   ## Test plan

   - [ ] Unit tests pass (`npm test`)
   - [ ] Lint passes (`npm run lint`)
   - [ ] Manual testing completed

   ## Screenshots (if applicable)

   <!-- Add screenshots for UI changes -->

   ---
   Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```
3. Report the PR URL to the user

## Examples

**With PR number:**
```
/worktree 42
```
- Cleans up any merged PR worktrees
- Fetches PR #42, creates worktree at `../worktrees/PR42-feat-add-login`
- Navigates there (no PR created - already exists)

**With branch name:**
```
/worktree feat/new-feature
```
- Cleans up any merged PR worktrees
- Creates worktree at `../worktrees/feat-new-feature`
- Navigates there, pushes branch, creates draft PR

**Interactive (no arguments):**
```
/worktree
```
- Cleans up any merged PR worktrees
- Asks user about the branch purpose
- Suggests name, creates branch and worktree
- Navigates there, pushes branch, creates draft PR

**Remove a specific worktree:**
```
/worktree --remove feat-my-feature
```
- Removes the worktree and its local branch

**Prune merged worktrees only:**
```
/worktree --prune
```
- Only cleans up worktrees with merged/closed PRs

**List all worktrees with status:**
```
/worktree --list
```
- Shows all worktrees with their PR status

## Important Notes

- Always fetch latest from origin before creating worktree: `git fetch origin`
- Automatic cleanup runs before every worktree creation
- Use `git worktree list` to show existing worktrees if there's a conflict
- Sanitize branch names for directory names (replace `/` with `-`)
- The worktree directory is created as a sibling to the main repo to keep it clean
