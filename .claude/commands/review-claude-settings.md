---
description: Review .claude/settings.local.json for security issues, garbage entries, and overly specific permissions.
---

Review `.claude/settings.local.json` for security, hygiene, and completeness.

**Mode:** If `$ARGUMENTS` contains `--full`, analyze the entire file. Otherwise, analyze only the git diff (staged + unstaged changes).

## Steps

1. **Gather the input to review:**

   **Default (diff only):**
   ```bash
   git diff HEAD -- .claude/settings.local.json
   git diff --cached -- .claude/settings.local.json
   ```
   If no diff exists, inform the user there are no changes and suggest using `--full`.

   **Full mode (`--full`):**
   Read the entire `.claude/settings.local.json` file.

2. **Read the full file for context** (even in diff mode, read it to understand what's already covered):
   ```bash
   cat .claude/settings.local.json
   ```

3. **Run the following analyses and produce a structured report:**

   ### a. Garbage Detection
   Look for entries that are clearly malformed or accidental — typically caused by permission fatigue (clicking "Allow" on a prompt that contained a long command or heredoc content). Signs of garbage:
   - Entries containing `\n`, `\\n`, heredoc markers (`EOF`, `HEREDOC`), or escaped quotes `\\\"`
   - Entries containing full file contents or multi-line command bodies
   - Entries that look like partial commit messages or PR bodies
   - Entries duplicating broader patterns that already exist (e.g. `Bash(./scripts/start-issue.sh:*)` when `Bash(./scripts/*.sh:*)` already covers it)

   For each garbage entry found:
   - Quote the entry
   - Explain why it's garbage
   - Recommend: **remove** (harmless noise) or **deny** (if the pattern could allow something dangerous if left)

   ### b. Security Audit
   Check allow entries for dangerous patterns:
   - `Bash(rm:*)` — allows arbitrary `rm` commands (should be scoped or in `ask`)
   - `Bash(mv:*)` — allows arbitrary moves
   - `Bash(sed:*)`, `Bash(bash:*)` — allows arbitrary code execution
   - `Bash(eval:*)`, `Bash(sudo:*)` — should always be denied (verify they are)
   - `Bash(curl:*)` without restrictions — data exfiltration risk
   - `Bash(git checkout:*)` broad patterns that could discard work
   - `Bash(git push:*)` without force-push being denied
   - Any allow entry that contradicts or undermines a deny entry

   Flag each as: **critical** (move to deny), **warning** (move to ask), or **info** (acceptable with caveat).

   ### c. Overly Specific Entries
   Find entries that are unnecessarily specific when a broader pattern already exists or would be better:
   - Specific file paths when a glob would work (e.g. `Bash(node eslint-rules/no-entire-state-selector.spec.cjs:*)` when `Bash(node eslint-rules/*.cjs:*)` exists)
   - Specific subcommands when the parent is already allowed (e.g. `Bash(git checkout feat/*:*)` when `Bash(git checkout:*)` exists)
   - Duplicate entries (exact or effectively equivalent)

   For each: recommend **remove** (already covered) or **broaden** (replace with pattern).

   ### d. Missing Deny Rules (Inspired by Changes)
   Based on the new entries and patterns in the diff, **proactively suggest** deny/ask rules the user hasn't thought of. Think adversarially — what could go wrong with these new permissions?

   Examples of the reasoning to apply:
   - If a new `gh api` allow was added → are destructive HTTP methods (DELETE, PUT, PATCH) denied for that specific API path?
   - If a new script was allowed → could that script be tricked into destructive behavior via arguments?
   - If a new `Bash(tool:*)` was added → what dangerous flags does that tool have?
   - If `Bash(node:*)` is allowed → is `Bash(node -e:*)` safe? (arbitrary code execution)
   - Look at the deny list for gaps: are there destructive git/gh commands not yet denied?

   For each suggestion: explain the attack vector and recommend **deny** or **ask**.

   ### e. Duplicate Ask Entries
   Find exact duplicates in the `ask` list (these accumulate from repeated prompts).

4. **Output format:**

   Present findings grouped by severity, with a summary count at the top:

   ```
   ## Settings Review Summary
   - X critical issues
   - X warnings
   - X garbage entries to clean
   - X redundant entries to remove
   - X new rules suggested

   ### Critical (move to deny)
   ...

   ### Warnings (move to ask)
   ...

   ### Garbage (remove or deny)
   ...

   ### Redundant (remove)
   ...

   ### Suggested New Rules
   ...
   ```

5. **After the report, ask** if the user wants you to apply the recommended fixes automatically.

## Constraints

- Do NOT modify the file unless the user explicitly approves
- Be paranoid — when in doubt, flag it
- Always explain the "why" for each finding
- Group related issues together (e.g. all git-related, all gh-related)
