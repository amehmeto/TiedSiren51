# PR #283 Review Retrospective — Re-authentication for Sensitive Operations

## Timeline

| Round | Date | Review Comments | Fix Commit |
|-------|------|----------------|------------|
| 0 (initial) | Feb 13 14:28 | — | `70f73f5`, `570a184`, `629935f` |
| 1 | Feb 13 16:03-16:26 | 9 comments | `3a93272` |
| 2 | Feb 13 17:32-17:39 | 4 comments | `947f9f0` |
| 3 | Feb 13 23:21-23:25 | 4 comments | `69f0df0` |

**Total: 3 review rounds, 17 review comments across 13 threads. ~10 hours open.**

## Root Cause Classification

| Category | Count | % |
|----------|-------|---|
| Naming/Style | 5 | 29% |
| Tooling/Config | 5 | 29% |
| Nit | 3 | 18% |
| Testing | 2 | 12% |
| Under-engineering | 1 | 6% |
| Misunderstanding | 1 | 6% |

## Repeat Offenders

### `authentification.fixture.ts` — reviewed in all 3 rounds (4 threads)

Claude's initial fix (`expected` -> `isoTimestamp`) didn't match the reviewer's preference (`expectedDate`), causing a round 3 follow-up.

### ESLint rule escalation — 5 of 17 comments (29%)

The reviewer's philosophy: "if I caught it manually, an ESLint rule should catch it automatically." Claude addressed the code fix but the reviewer then asked for the rule in round 2/3. Predictable escalation:

1. Round 1: "Fix this style issue" -> Claude fixes code
2. Round 2: "Why didn't ESLint catch this?" -> Claude extends/creates rule
3. Round 3: "Expand the rule further" -> Claude broadens scope

### Cascading fixes

- Creating `no-unused-test-id` as `warn` -> Round 2: "should be `error`"
- Answering "no logger in catch" by adding one -> Round 3: "create an ESLint rule for it"
- Explaining `expect-separate-act-assert` doesn't apply to fixtures -> Round 3: "expand the rule"

## Prevention Recommendations

### 1. Proactively create ESLint rules alongside code fixes

**Impact: HIGH** — Would have eliminated 3-4 round 2/3 comments, potentially saving 1 full round.

When fixing a code style issue, always ask: "should an ESLint rule enforce this?" If yes, create or extend the rule in the SAME round. Don't wait for the reviewer to ask.

### 2. New ESLint rules default to `error` severity

**Impact: MEDIUM** — Would have eliminated the `warn` -> `error` follow-up.

When creating new ESLint rules, always use `error` severity unless there's a specific reason for `warn` (e.g., gradual rollout across many violations).

### 3. Fixture `then` method params: use `expected` + domain noun

**Impact: MEDIUM** — Would have avoided the `isoTimestamp` -> `expectedDate` round 3 rename.

Examples: `expectedDate`, `expectedEmail`, `expectedError` — not implementation-specific names like `isoTimestamp`.

### 4. Prefer inlining simple arithmetic over single-use named constants

**Impact: LOW** — Would have avoided the `REAUTH_COOLDOWN_MS` comment.

`5 * MINUTE` is clear enough inline. Only extract to a named constant if the value is reused or the intent isn't obvious from context.

### 5. Apply test conventions to fixture files

**Impact: LOW** — Already enforced by expanding `expect-separate-act-assert` to fixtures.

Fixture files that use `expect()` should follow the same AAA separation rules as test files.

## Key Insight

59% of review comments (10/17) were about naming/style or tooling — things that should be caught automatically. Claude addressed the symptom (fixed code) but not the systemic issue (ESLint enforcement) until explicitly asked.

**The reviewer's mental model: every manual review comment represents a missing lint rule.** Claude should adopt this proactively — every style fix should come paired with a rule to prevent recurrence.

If Claude had proactively created ESLint rules in round 1, this PR would likely have needed 1-2 rounds instead of 3.
