---
name: ✨ Feature / Story
about: A new feature or user story for development
title: 'feat(scope): '
labels: enhancement
assignees: ''
---

<!--
📋 TICKET FRONTMATTER - Fill in these values
This metadata is parsed by the linter and used for tracking.
-->

```yaml
# 📦 METADATA
repo: TiedSiren51  # TiedSiren51 | expo-accessibility-service | expo-foreground-service | tied-siren-blocking-overlay | expo-list-installed-apps
story_points: 0    # Fibonacci: 1, 2, 3, 5, 8, 13, 21
labels:            # From: enhancement, bug, blocking, auth, android, epic, initiative, needs-refinement
  - enhancement
depends_on: []     # e.g., [123, 124] - issue numbers this depends on
blocks: []         # e.g., [125] - issue numbers blocked by this
```

---

## 📝 Summary

<!-- One paragraph explaining what this feature does and why it matters -->

## 🎯 Context

<!--
Background information the implementer (human or LLM) needs to understand:
- Why does this feature exist?
- What problem does it solve?
- Any relevant history or previous attempts?
-->

## 👤 User Story

<!--
As a [type of user],
I want [some goal],
So that [some reason].
-->

---

## ✅ Acceptance Criteria

### 📋 Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### 🎭 Scenarios (Given/When/Then)

#### ✅ Scenario 1: Happy path
```gherkin
Given [initial context]
When [action taken]
Then [expected outcome]
And [additional outcome]
```

#### ✅ Scenario 2: Alternative path
```gherkin
Given [initial context]
When [action taken]
Then [expected outcome]
```

#### ❌ Scenario 3: Error case
```gherkin
Given [initial context]
When [invalid action taken]
Then [error handling behavior]
```

---

## 🧪 Test Cases

### ✅ Passing Cases
<!-- Cases that SHOULD succeed -->
| Input | Expected Output | Notes |
|-------|-----------------|-------|
| Valid input A | Success result | Happy path |
| Edge case B | Handled gracefully | Boundary condition |

### ❌ Rejecting Cases
<!-- Cases that SHOULD fail or be rejected -->
| Input | Expected Behavior | Notes |
|-------|-------------------|-------|
| Invalid input A | Show error message | Validation |
| Unauthorized access | Return 403 | Security |

---

## 🔧 Technical Requirements

### 📁 Core Layer
<!-- Domain logic, Redux slices, ports -->
- [ ] Task 1
- [ ] Task 2

### 🔌 Infra Layer
<!-- Adapters, external services -->
- [ ] Task 1
- [ ] Task 2

### 🎨 UI Layer
<!-- Components, screens, view models -->
- [ ] Task 1
- [ ] Task 2

---

## 🗺️ Technical Hints

<!-- Help the implementer find relevant code -->
| Area | Location |
|------|----------|
| Start here | `core/domain/` |
| Related code | `infra/adapter/` |
| Test examples | `core/domain/__tests__/` |
| Similar feature | `#123` or `src/path/to/similar.ts` |

---

## 🚫 Out of Scope

<!-- Explicitly list what this ticket does NOT include -->
- Not included 1
- Not included 2 (separate ticket: #XXX)

## ⚠️ Constraints

<!-- Performance, compatibility, or other requirements -->
- Must complete in < X ms
- Must work offline
- No new dependencies
- Must support Android 8+

---

## ✅ Definition of Done

- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] Documentation updated (if applicable)

---

## 🔗 Related

- 📌 Parent Epic: #XX
- ⬅️ Depends on: #XX
- ➡️ Blocks: #XX
- 📚 ADR: `/docs/adr/relevant-decision.md`
