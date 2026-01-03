---
description: Commit all changes and push to remote with SKIP_E2E_CHECK flag.
---

Commit and push workflow:

1. **Always include `.claude/` changes**: Stage all changes from `.claude/settings.local.json` and other Claude config files, even if unrelated to the current task. These track conversation context.

2. **Stage and commit**:
   - Run `git add -A` to stage all changes
   - Create a conventional commit message based on the changes
   - Use HEREDOC format for the commit message

3. **Push with SKIP_E2E_CHECK**:
   - Always use `SKIP_E2E_CHECK=true git push` because the e2e test prompt requires interactive TTY which is not available in Claude Code

4. **Commit message format**:
```
<type>(<scope>): <description>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

Execute the commit and push now.
