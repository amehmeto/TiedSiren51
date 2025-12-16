---
description: Review a PR with focus on architecture patterns and ADR compliance. Updates ADRs if new architectural decisions are discovered.
---

## User Input

```text
$ARGUMENTS
```

## Architecture Review Workflow

### Step 1: Identify the PR

**If PR number is provided** (e.g., `123`):
- Use `gh pr view <PR_NUMBER> --json number,title,body,headRefName,files` to get PR details

**If no argument provided:**
- Use `gh pr list --state open` to show open PRs
- Ask user which PR to review

### Step 2: Gather PR Context

1. Get the full diff: `gh pr diff <PR_NUMBER>`
2. Get the list of changed files: `gh pr view <PR_NUMBER> --json files`
3. Read the PR description for stated architectural intent

### Step 3: Load Existing ADRs

Read all ADR files to understand current architectural decisions:

```
docs/adr/
├── core/                    # Core layer patterns
│   ├── dependency-injection-pattern.md
│   ├── domain-based-slices.md
│   ├── entity-adapter-normalization.md
│   ├── listener-pattern.md
│   ├── redux-toolkit-for-business-logic.md
│   └── typed-async-thunk-factory.md
├── testing/                 # Testing patterns
│   ├── fixture-pattern.md
│   ├── stub-vs-fake-implementations.md
│   └── test-store-factory.md
├── infrastructure/          # Infrastructure patterns
│   ├── date-provider-pattern.md
│   ├── local-first-architecture.md
│   └── prisma-orm-sqlite.md
└── hexagonal-architecture.md  # Overall architecture
```

### Step 4: Architecture Review Checklist

For each changed file, evaluate against these criteria:

#### Layer Compliance (Hexagonal Architecture)
- [ ] **Core layer** (`core/`): No infrastructure imports, only ports/interfaces
- [ ] **Infrastructure layer** (`infra/`): Implements ports, can import external libs
- [ ] **UI layer** (`ui/`, `app/`): Only imports from core selectors/usecases, not direct state manipulation

#### Domain Structure (domain-based-slices.md)
- [ ] New domains follow the standard structure: `slice.ts`, `selectors/`, `usecases/`, `listeners/`
- [ ] Slice files use `createSlice` with proper naming
- [ ] No cross-domain state mutations

#### Dependency Injection (dependency-injection-pattern.md)
- [ ] New dependencies added to `Dependencies` type in `core/_redux_/dependencies.ts`
- [ ] Usecases receive dependencies via `extra` in thunks
- [ ] No direct instantiation of infrastructure in core

#### Testing Patterns
- [ ] Tests use `createTestStore` with correct signature: `(dependencies?, preloadedState?)`
- [ ] Fixtures are colocated with their domains
- [ ] Stubs used for simple value returns, Fakes for stateful behavior

#### Listener Pattern (listener-pattern.md)
- [ ] Listeners registered in `registerListeners.ts`
- [ ] Listeners use gateway subscriptions, not RTK listener middleware
- [ ] Proper cleanup/unsubscribe handling

### Step 5: Identify New Architectural Decisions

Look for patterns in the PR that represent NEW architectural choices not yet documented:

1. **New patterns**: Novel approaches to solving problems
2. **Technology additions**: New libraries or tools
3. **Structural changes**: New folder conventions or file organization
4. **Anti-pattern fixes**: Corrections that should be documented as "don't do this"

### Step 6: Generate Review Report

Output a structured review with:

```markdown
## Architecture Review: PR #<number>

### Summary
<Brief description of what the PR does architecturally>

### Layer Compliance
| File | Layer | Status | Notes |
|------|-------|--------|-------|
| ... | ... | ✅/⚠️/❌ | ... |

### ADR Compliance
| ADR | Status | Findings |
|-----|--------|----------|
| hexagonal-architecture.md | ✅/⚠️/❌ | ... |
| ... | ... | ... |

### Architectural Concerns
<List any violations or concerns>

### Suggested ADR Updates
<List any new decisions that should be documented>

### Recommendations
<Actionable items for the PR author>
```

### Step 7: Update ADRs (if necessary)

If new architectural decisions are discovered:

1. **Ask for confirmation** before modifying any ADR
2. For each ADR update:
   - Show the proposed changes
   - Explain why this decision should be documented
   - Get user approval before editing

ADR update format:
```markdown
## Decision
<What was decided>

## Context
<Why this decision was made>

## Consequences
<What this means for the codebase>
```

### Step 8: Provide Review Comments

Optionally add review comments to the PR using:
```bash
gh pr review <PR_NUMBER> --comment --body "<review content>"
```

## Examples

**Review specific PR:**
```
/arch-review 153
```
→ Reviews PR #153 for architecture compliance

**Review with auto-update:**
```
/arch-review 153
```
→ Reviews PR, identifies new patterns, proposes ADR updates

## Important Notes

- Focus on **architecture**, not code style or minor issues
- ADRs are living documents - update them when patterns evolve
- When in doubt, ask the user before making ADR changes
- Reference specific files and line numbers in findings
- Consider the **intent** behind changes, not just the implementation
