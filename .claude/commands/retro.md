---
description: Analyze PR review history and suggest improvements to reduce review rounds.
---

Run a retrospective on PR #$ARGUMENTS to identify what caused excessive review rounds and how to prevent them.

## Steps

1. **Fetch the full PR conversation history:**
   ```bash
   ./scripts/fetch-pr-comments.sh $ARGUMENTS
   ```
   This fetches ALL comments (not owner-only) to see the full back-and-forth.

2. **Fetch PR metadata:**
   ```bash
   gh pr view $ARGUMENTS --json title,body,commits,createdAt,updatedAt,reviews,comments
   ```

3. **Extract the commit history from PR metadata:**
   The `commits` field from step 2 already contains the full commit list. Parse it with:
   ```bash
   gh pr view $ARGUMENTS --json commits --jq '.commits[] | "\(.oid[0:7]) \(.messageHeadline) (\(.committedDate))"'
   ```

4. **Analyze the full conversation** and produce a structured retrospective:

   ### a. Timeline
   Build a chronological timeline of review rounds. A "round" is a cycle of:
   reviewer leaves comments -> author pushes fixes -> reviewer reviews again.
   Count the total rounds and note the dates.

   ### b. Root Cause Classification
   Classify each review comment into one of these categories:
   - **Architecture/Design** — structural decisions that should have been agreed upfront
   - **Naming/Style** — naming conventions, code style, formatting
   - **Logic/Bug** — actual bugs or logic errors caught in review
   - **Testing** — missing tests, test quality, test structure
   - **Over-engineering** — reviewer asked to simplify or reduce scope
   - **Under-engineering** — reviewer asked for more robustness, error handling
   - **Misunderstanding** — author misunderstood the requirement or reviewer intent
   - **Tooling/Config** — ESLint rules, CI config, build setup
   - **Nit** — trivial preferences, cosmetic
   Show counts per category.

   ### c. Repeat Offenders
   Identify patterns that caused multiple rounds:
   - Same file getting reviewed repeatedly
   - Same type of feedback recurring across rounds
   - Fixes that introduced new issues requiring another round
   - Misinterpretations of feedback that caused back-and-forth

   ### d. Prevention Recommendations
   For each root cause category with > 1 occurrence, suggest concrete preventive measures:
   - ESLint rules that could catch the issue automatically
   - ADR updates or new ADRs to document decisions
   - Changes to CLAUDE.md instructions
   - Pre-commit checks or CI checks
   - Spec/planning improvements
   - Slash command improvements (e.g., `/fix-review` could be better at X)

   ### e. Actionable Items
   Produce a prioritized list of concrete next steps, ordered by impact.
   Each item should be a specific, implementable action (not vague advice).

5. **Write the retrospective to a markdown file:**
   - Save to `docs/retrospective/PR-{number}-{short-desc}-review-retro.md`
   - Derive `{short-desc}` from the PR title (lowercase, kebab-case, max 5 words)
   - Follow the format of existing retrospectives in `docs/retrospective/`
   - Example: PR #273 "feat(blocklist): display selected apps at top" → `PR-273-selected-apps-on-top-review-retro.md`

6. **Output a summary** in the conversation with the file path and key stats (rounds, threads, top categories).

## Constraints

- Be brutally honest about patterns — the goal is to improve, not to assign blame
- Focus on systemic fixes (tooling, processes, instructions) over one-off advice
- If Claude caused most of the rework, say so clearly and suggest instruction changes
- If the reviewer's feedback was inconsistent or contradictory, note that too
- Quantify everything: counts, percentages, rounds per category
