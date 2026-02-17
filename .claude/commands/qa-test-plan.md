---
description: Generate a comprehensive QA test plan for the current PR and post it as a comment.
---

Generate a comprehensive QA test plan for PR #$ARGUMENTS and post it as a comment on the PR.

## Steps

### Step 1: Detect PR number

**If $ARGUMENTS is a number**, use that as the PR number.

**If $ARGUMENTS is empty**, detect from the current branch:
```bash
gh pr view --json number --jq '.number'
```

If no PR is found, stop and tell the user to provide a PR number.

### Step 2: Gather context

Run these commands to collect all relevant information:

1. **PR details:**
   ```bash
   gh pr view <PR_NUMBER> --json title,body,headRefName
   ```

2. **GitHub issue** (extract issue number from PR body `Closes #NNN` or branch name `TS<NNN>`):
   ```bash
   gh issue view <ISSUE_NUMBER>
   ```

3. **Full PR diff:**
   ```bash
   gh pr diff <PR_NUMBER>
   ```

4. **List of changed files:**
   ```bash
   gh pr view <PR_NUMBER> --json files --jq '.files[].path'
   ```

### Step 3: Analyze changes

From the diff and issue, identify:
- **User-facing changes**: new screens, buttons, flows, error messages, validation rules
- **State changes**: new Redux state, reducers, thunk lifecycle (pending/fulfilled/rejected)
- **Edge cases**: error handling, boundary conditions, race conditions
- **Integration points**: external services (Firebase, APIs), navigation, deep links
- **Platform specifics**: Android/iOS differences, native modules involved

### Step 4: Generate the test plan

Create a structured QA test plan using this template:

```markdown
## QA Test Plan for PR #<number>

**Feature:** <PR title>
**Issue:** #<issue_number>
**Branch:** `<branch_name>`

---

### Prerequisites
- [ ] <Any setup needed before testing: accounts, data, feature flags, etc.>

### Happy Path
<Numbered test cases for the main flow, each with clear steps and expected results>

1. **<Test case title>**
   - **Steps:**
     1. <Step 1>
     2. <Step 2>
   - **Expected:** <What should happen>

### Validation & Error Cases
<Test cases for input validation, error states, edge cases>

### State Management
<Test cases for Redux state transitions: loading states, success/error feedback, state clearing>

### Navigation & Lifecycle
<Test cases for screen transitions, tab switching, back navigation, app backgrounding>

### Regression
<Areas that could break due to these changes — test existing functionality>

### Platform-Specific
<Android/iOS differences if applicable>

---

**Automated coverage:** <Summary of what's covered by unit tests vs what needs manual QA>
```

### Step 5: Post to PR

Post the test plan as a PR comment:
```bash
gh pr comment <PR_NUMBER> --body "<test_plan_content>"
```

## Guidelines

- **Be specific** — each test case should have concrete steps a QA tester can follow without reading the code
- **Include both positive and negative cases** — happy path AND error scenarios
- **Consider real device behavior** — keyboards, network failures, screen rotation, background/foreground
- **Reference the issue acceptance criteria** — map test cases back to requirements
- **Note what's already covered by automated tests** — so QA can focus on manual-only scenarios
- **Keep it practical** — prioritize high-risk scenarios over exhaustive coverage
