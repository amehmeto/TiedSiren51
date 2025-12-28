---
name: 🐛 Bug Report
about: Something isn't working as expected
title: 'fix(scope): '
labels: bug
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

## 🔗 Related

- 🔥 Sentry Issue: [link]
- 📌 Related Ticket: #XX
- 📚 Relevant ADR: `/docs/adr/`
