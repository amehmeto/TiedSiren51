---
description: Create a git worktree with npm ci, push branch, and create draft PR. Automatically navigates to the new worktree.
---

## User Input

```text
$ARGUMENTS
```

## Worktree Creation Workflow

### Step 1: Parse Arguments

The user may provide:
- A PR number (e.g., `123`)
- A branch name (e.g., `feat/my-feature`)
- Both PR number and branch (e.g., `123 feat/my-feature`)
- Nothing (will prompt for details)

### Step 2: Determine Branch and Worktree Name

**If PR number is provided:**
1. Use `gh pr view <PR_NUMBER> --json headRefName,number` to get the branch name
2. Name the worktree: `worktrees/PR<number>-<branch-name>`

**If branch name is provided (no PR):**
1. Check if branch exists locally or remotely using `git branch -a | grep <branch>`
2. If exists: Create worktree with that branch
3. Name the worktree: `worktrees/<branch-name>`

**If nothing is provided:**
1. Ask the user: "What is this branch about? (e.g., 'fix login button styling', 'add user authentication')"
2. Based on their description, suggest a branch name following conventional naming:
   - Bug fixes: `fix/<short-description>`
   - Features: `feat/<short-description>`
   - Refactoring: `refactor/<short-description>`
   - Docs: `docs/<short-description>`
3. Confirm the suggested branch name with the user
4. Create the branch from `main`
5. Name the worktree: `worktrees/<branch-name>`

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
2. Create a draft PR using `gh pr create`:
   ```bash
   gh pr create --draft --title "<type>: <description>" --body "$(cat <<'EOF'
   ## Summary
   - <Brief description of changes>

   ## Test plan
   - [ ] Tests pass
   - [ ] Manual testing completed

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```
3. Report the PR URL to the user

## Examples

**With PR number:**
```
/worktree 42
```
→ Fetches PR #42, creates worktree at `../worktrees/PR42-feat-add-login`, navigates there (no PR created - already exists)

**With branch name:**
```
/worktree feat/new-feature
```
→ Creates worktree at `../worktrees/feat-new-feature`, navigates there, pushes branch, and creates draft PR

**Interactive (no arguments):**
```
/worktree
```
→ Asks user about the branch purpose, suggests name, creates branch and worktree, navigates there, pushes branch, and creates draft PR

## Important Notes

- Always fetch latest from origin before creating worktree: `git fetch origin`
- Use `git worktree list` to show existing worktrees if there's a conflict
- Sanitize branch names for directory names (replace `/` with `-`)
- The worktree directory is created as a sibling to the main repo to keep it clean
