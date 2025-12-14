# FAQ

Common questions when using this template.

## Architecture

### Why so many files?

Clean Architecture trades fewer files for:
- Testability without mocks
- Swappable implementations
- Framework independence
- Clear boundaries

For simple apps, this is overkill. For apps that grow, it pays off.

---

### Can I skip the ports/adapters pattern?

Yes, for simple services. But you lose:
- Easy testing (must mock or use real implementations)
- Swappability (locked to one implementation)

Keep it for: repositories, external APIs, device features.
Skip it for: simple utilities, pure functions.

---

### Why Redux over simpler alternatives?

Redux provides:
- Predictable updates
- Excellent DevTools
- Middleware ecosystem
- Proven at scale

If your app is simple, Zustand or Jotai work fine. See [customization guide](./customization-guide.md).

---

## Testing

### Why fakes instead of mocks?

| Fakes | Mocks |
|-------|-------|
| Reusable across tests | Created per test |
| Simpler setup | Complex setup |
| Test behavior | Test implementation |
| Survive refactors | Break on refactors |

---

### How do I test async thunks?

```ts
test('fetches user', async () => {
  // Arrange
  const userRepo = new FakeUserRepo()
  userRepo.users = [{ id: '1', name: 'John' }]
  const store = createTestStore({ userRepo })

  // Act
  await store.dispatch(fetchUser('1'))

  // Assert
  expect(selectUser(store.getState())).toEqual({ id: '1', name: 'John' })
})
```

---

### How do I test listeners?

```ts
test('logs out on token expiry', async () => {
  // Arrange
  const store = createTestStore()
  store.dispatch(loginSuccess({ token: 'abc' }))

  // Act
  store.dispatch(tokenExpired())
  await store.dispatch(waitForListeners())

  // Assert
  expect(selectIsLoggedIn(store.getState())).toBe(false)
})
```

---

## Development

### How do I add a new feature/domain?

1. Create `core/<domain>/` with slice, selectors, thunks
2. Create `core/_ports_/<domain>.repository.ts` if needed
3. Create `infra/<domain>/` with real + fake implementations
4. Create `ui/screens/<Domain>/` with screens
5. Add tests next to each file

---

### How do I add a new screen?

1. Create `ui/screens/<ScreenName>/<ScreenName>.tsx`
2. Create `ui/screens/<ScreenName>/<ScreenName>.view-model.ts`
3. Add to navigation
4. Add tests

---

### Why are my tests slow?

Common causes:
- Real timers instead of fake timers
- Real network calls instead of fakes
- Missing `await` on async operations
- Large test fixtures

---

## Deployment

### How do I set up CI/CD?

Copy `.github/workflows/`:
- `cerberus.yml` - PR checks (lint, test, build)
- `hades.yml` - Releases (semantic-release)

Update:
- Build commands for your platform
- Environment secrets
- Deployment targets

---

### How do I handle environment variables?

1. Copy `.env.example` to `.env`
2. Fill in values
3. Access via `process.env.VAR_NAME` or Expo constants
4. Never commit `.env`
