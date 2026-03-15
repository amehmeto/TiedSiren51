---
name: 🐛 Bug Report
about: Something isn't working as expected
title: 'TS-XXX: fix(scope): '
labels: bug
assignees: ''
---

<!--
⚠️ IMPORTANT: After creating this issue, update the title with the actual issue number!
Example: TS-123: fix(auth): login button not working

Ticket prefixes by repo:
- TS = TiedSiren
- TSBO = tied-siren-blocking-overlay
- EAS = expo-accessibility-service
- EFS = expo-foreground-service
- ELIA = expo-list-installed-apps
-->

<!--
📋 TICKET FRONTMATTER - Fill in these values
This metadata is parsed by the linter and used for tracking.
-->

```yaml
# 📦 METADATA
# repo: Must be one of:
#   - TiedSiren (https://github.com/amehmeto/TiedSiren)
#   - expo-accessibility-service (https://github.com/amehmeto/expo-accessibility-service)
#   - expo-foreground-service (https://github.com/amehmeto/expo-foreground-service)
#   - tied-siren-blocking-overlay (https://github.com/amehmeto/tied-siren-blocking-overlay)
#   - expo-list-installed-apps (https://github.com/amehmeto/expo-list-installed-apps)
#   - NEW_REPO: <name> (if a new repository is needed)
repo: TiedSiren
story_points: 0    # Fibonacci: 1, 2, 3, 5, 8, 13, 21
labels:
  - bug
depends_on: []
blocks: []
severity: medium   # low | medium | high | critical
```

---

## 🐛 Bug Summary

<!-- One sentence describing the bug -->

## 📸 Evidence

<!-- Screenshots, videos, or Sentry logs -->

| Log/Screenshot | Status |
|----------------|--------|
| Expected log | ✅ / ❌ |

---

## 🔄 Reproduction

### 📋 Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### ❌ Actual Behavior
<!-- What happens now -->

### ✅ Expected Behavior
<!-- What should happen -->

### 🎭 Scenarios (Given/When/Then)

#### 🐛 Bug Scenario
```gherkin
Given [initial state]
When [action that triggers bug]
Then [incorrect behavior observed]
But [expected behavior should be]
```

#### ✅ Fixed Scenario
```gherkin
Given [initial state]
When [same action]
Then [correct expected behavior]
```

---

## 🔍 Root Cause Analysis

<!-- If known, explain why this bug occurs -->

### 🧠 Hypothesis
<!-- What you think is causing the bug -->

### 📁 Suspected Files
| File | Reason |
|------|--------|
| `path/to/file.ts` | Contains the logic for X |

---

## 🔧 Proposed Fix

<!-- If you have a solution in mind -->

### 📝 Changes Required
- [ ] Change 1
- [ ] Change 2

### ⚠️ Risks
<!-- Any risks with the proposed fix -->

---

## 🧪 Test Cases

### ✅ Passing Cases (After Fix)
| Input | Expected Output |
|-------|-----------------|
| Scenario A | Works correctly |

### ❌ Rejecting Cases (Should Still Fail)
| Input | Expected Behavior |
|-------|-------------------|
| Invalid input | Proper error handling |

---

## 🌍 Environment

| Property | Value |
|----------|-------|
| Platform | Android / iOS / Web |
| OS Version | |
| App Version | |
| Device | |

---

## ✅ Acceptance Criteria

- [ ] Bug no longer reproducible
- [ ] Regression test added
- [ ] No new bugs introduced
- [ ] Sentry shows fix working

---

## 🔗 Hierarchy

<!--
REQUIRED: Link to parent Epic and Initiative for navigation
Replace XX with actual issue numbers
-->

| Level | Link |
|-------|------|
| 🚀 Initiative | [#XX - Initiative Name](https://github.com/amehmeto/TiedSiren/issues/XX) |
| 🏔️ Epic | [#XX - Epic Name](https://github.com/amehmeto/TiedSiren/issues/XX) |

## 🔗 Related

<!--
REQUIRED: Link dependencies with full GitHub URLs for cross-repo support
Remove lines that don't apply
-->

| Relation | Link |
|----------|------|
| ⬅️ Depends on | [#XX - Title](https://github.com/amehmeto/TiedSiren/issues/XX) |
| ➡️ Blocks | [#XX - Title](https://github.com/amehmeto/TiedSiren/issues/XX) |
| 🔥 Sentry Issue | [link] |
| 📚 ADR | `/docs/adr/relevant-decision.md` |
