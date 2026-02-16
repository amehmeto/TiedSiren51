Implement the following GitHub issue in this worktree.

PR: none (create one after first commit using `gh pr create --draft --title "feat(auth): Google re-authentication for sensitive operations" --body "Implements #298"`)

## Context

Users who signed up with Google have no password and cannot use the password-only `ReauthenticationModal`. This blocks the delete account flow (and any future sensitive operations) for Google users. The modal needs to detect the user's auth provider and show the appropriate re-auth method.

## Acceptance Criteria

- [ ] `AuthUser` type includes an `authProvider` field (`'email' | 'google' | 'apple'`)
- [ ] `authProvider` is populated from Firebase `user.providerData[0]?.providerId` in all auth flows
- [ ] `AuthGateway` port exposes `reauthenticateWithGoogle(): Promise<void>`
- [ ] Firebase gateway implements `reauthenticateWithGoogle()` using `reauthenticateWithCredential`
- [ ] Fake gateway implements `reauthenticateWithGoogle()` with configurable stub
- [ ] `reauthenticateWithGoogle` usecase exists with same pattern as `reauthenticate.usecase.ts`
- [ ] Auth reducer handles `reauthenticateWithGoogle.pending/fulfilled/rejected`
- [ ] `ReauthenticationModal` is provider-aware:
  - `authProvider === 'google'` → shows Google sign-in button
  - `authProvider === 'email'` or undefined → shows existing password input (backward-compatible)
- [ ] `delete-account.tsx` passes `authProvider` to `ReauthenticationModal`
- [ ] Unit tests cover Google re-auth success and failure paths
- [ ] All existing tests still pass

## Implementation Notes

### Files to create
- `core/auth/usecases/reauthenticate-with-google.usecase.ts`

### Files to modify
1. `core/auth/auth-user.ts` — add `authProvider` field (optional for backward compat)
2. `core/_ports_/auth.gateway.ts` — add `reauthenticateWithGoogle()`
3. `core/auth/reducer.ts` — add cases for new usecase
4. `core/auth/authentification.fixture.ts` — add Google reauth given/when helpers
5. `infra/auth-gateway/firebase.auth.gateway.ts` — implement `reauthenticateWithGoogle()`, populate `authProvider` in all sign-in/sign-up flows and `setupAuthStateListener`
6. `infra/auth-gateway/fake.auth.gateway.ts` — implement `reauthenticateWithGoogle()`
7. `ui/design-system/components/shared/ReauthenticationModal.tsx` — provider-aware UI
8. `app/(tabs)/settings/delete-account.tsx` — pass `authProvider` prop

### Key technical details
- Firebase: map `providerId` → `authProvider` (`'google.com'` → `'google'`, `'password'` → `'email'`, `'apple.com'` → `'apple'`)
- Google reauth uses `GoogleSignin.signIn()` → `GoogleAuthProvider.credential(idToken)` → `reauthenticateWithCredential(user, credential)` (same credential flow as `signInWithGoogle`, different final call)
- Reuse existing state fields: `isReauthenticating`, `lastReauthenticatedAt`, `reauthError`

## Dependencies

- Depends on #163 (account deletion) being merged first ✅ (already merged)
- Builds on the `ReauthenticationModal` and reauth infrastructure from #283

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
