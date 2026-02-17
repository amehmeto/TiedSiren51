Implement the following GitHub issue in this worktree.

PR: none (create one after first commit with `gh pr create --draft --title "feat(auth): custom in-app password reset confirmation flow" --body "Implements #160"`)

## 📝 Summary

Implement a custom in-app flow where users can reset their password directly within the app, instead of being redirected to Firebase's hosted password reset page.

---

## 🎯 Context

Currently, clicking the password reset email link redirects users to Firebase's hosted password reset page. This is a jarring experience. A custom in-app flow provides a seamless, branded experience.

**Current flow:**
1. User requests password reset → ✅ (PR #149)
2. User receives email with reset link → ✅
3. User clicks link → **Opens Firebase hosted page** ❌
4. User enters new password on Firebase page
5. User manually returns to app

**Desired flow:**
1. User requests password reset → ✅
2. User receives email with reset link → ✅
3. User clicks link → **App opens with reset confirmation screen** ✅
4. User enters new password in-app
5. User is redirected to login screen

---

## ✅ Acceptance Criteria

### Deep Linking Setup
- [ ] Configure Expo deep linking with custom scheme (`tiedsiren://`)
- [ ] Set up Universal Links (iOS) for `https://tiedsiren.app/reset-password`
- [ ] Set up App Links (Android) for the same domain
- [ ] Handle deep link params extraction (`oobCode`, `mode`)

### Firebase Configuration
- [ ] Update Firebase Console → Authentication → Templates → Password Reset
- [ ] Set action URL to app's deep link endpoint

### New Screen: `app/(auth)/reset-password-confirm.tsx`
- [ ] Parse `oobCode` from deep link URL params
- [ ] New password input field
- [ ] Confirm password input field
- [ ] Submit button with loading state
- [ ] Error display for invalid/expired codes
- [ ] Success state with redirect to login

### Core Layer
- [ ] Add `confirmPasswordReset(oobCode: string, newPassword: string)` to `AuthGateway` port
- [ ] Create `confirm-password-reset.usecase.ts`
- [ ] Add reducer state for confirmation flow
- [ ] Unit tests for usecase

### Infra Layer
- [ ] Implement `confirmPasswordReset` in `FirebaseAuthGateway`
- [ ] Handle error codes: `auth/expired-action-code`, `auth/invalid-action-code`, `auth/weak-password`
- [ ] Implement in `FakeAuthGateway` for testing

---

## 🎭 Scenarios (Given/When/Then)

### ✅ Scenario 1: Successful password reset
```gherkin
Given a user has requested a password reset
And they received the reset email
When they click the reset link
Then the app opens to the password confirmation screen
And they can enter a new password
And they are redirected to login on success
```

### ❌ Scenario 2: Expired link
```gherkin
Given a user has a password reset link older than 24 hours
When they click the link
Then they see an error message about the expired link
And can request a new reset email
```

### ❌ Scenario 3: Mismatched passwords
```gherkin
Given a user is on the password reset confirmation screen
When they enter mismatched passwords
Then they see a validation error
And cannot submit the form
```

---

## 🚫 Out of Scope

- Email link customization (branding)
- "Verify email" deep link handling
- Password strength meter

---

## 🔗 Related

- 📌 Parent Epic: #54
- 📚 Firebase confirmPasswordReset docs
- 📚 Expo Deep Linking docs

---

Before making structural changes, read /docs/adr/README.md for architectural decisions that must be followed.

Completion checklist:
- ALL acceptance criteria from the issue are met
- All unit tests pass (npm test)
- Lint passes (npm run lint)
- Changes committed and pushed with /commit-push
- CI passes on the PR
- No merge conflicts with main
- PR description updated to reflect ALL changes made

When ALL criteria are met, output: <promise>COMPLETE</promise>
