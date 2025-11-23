# Maestro for End-to-End Testing

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 needs end-to-end testing to verify complete user workflows:

- User registration and login
- Creating blocklists
- Starting block sessions
- App blocking behavior
- Navigation flows

**Requirements**:
- **Cross-platform**: Test on iOS and Android
- **Real devices/simulators**: Test on actual platforms
- **Easy to write**: Non-developers can contribute tests
- **Fast feedback**: Quick test execution
- **CI/CD integration**: Run in GitHub Actions
- **Maintainable**: Tests shouldn't break with minor UI changes

**E2E testing challenges**:
- Complex setup (Appium, Detox)
- Flaky tests (timing issues)
- Slow test execution
- Hard to debug failures
- Platform-specific quirks

## Decision

Use **Maestro** for end-to-end testing.

### Implementation

**1. Test Files** (`/maestro/`)

```yaml
# /maestro/flows/user-registration.yaml
appId: com.tiedsiren51
---
- launchApp
- tapOn: "Sign Up"
- inputText: "test@example.com"
- tapOn: "Password"
- inputText: "password123"
- tapOn: "Create Account"
- assertVisible: "Welcome"
```

**2. Test Command**

```bash
# Run single flow
maestro test maestro/flows/user-registration.yaml

# Run all flows
maestro test maestro/flows/

# Run on specific device
maestro --device iPhone-14 test maestro/flows/
```

**3. CI Integration** (`/.github/workflows/`)

```yaml
- name: Run E2E Tests
  run: |
    maestro test maestro/flows/
```

## Consequences

### Positive

- **Simple syntax**: YAML-based, human-readable
- **Fast**: Faster than Appium/Detox
- **Cross-platform**: Same tests run on iOS and Android
- **No native code**: No Swift/Kotlin required
- **Visual feedback**: Can record test runs
- **Easy debugging**: Clear error messages
- **Low maintenance**: Tests resilient to minor UI changes
- **CI-friendly**: Easy to run in GitHub Actions
- **No app recompilation**: Tests existing build
- **Interactive mode**: Can run tests step-by-step
- **Screenshot support**: Captures screenshots on failure

### Negative

- **Newer tool**: Smaller community than Detox/Appium
- **Limited API**: Fewer features than mature tools
- **No unit test integration**: Separate from Vitest
- **Requires running app**: Can't mock backend easily
- **Platform dependencies**: Needs Xcode/Android SDK installed

### Neutral

- **YAML format**: Simple but less flexible than code
- **External tool**: Not React Native native

## Alternatives Considered

### 1. Detox
**Rejected because**:
- Complex setup (native modules, manual linking)
- Slower than Maestro
- More maintenance overhead
- Requires recompiling app with Detox
- More flaky tests

### 2. Appium
**Rejected because**:
- Heavy setup (Appium server, drivers)
- Slower test execution
- More complex test syntax
- Harder to debug
- Overkill for React Native

### 3. Expo testing library + Jest
**Rejected because**:
- Not true E2E (doesn't test on real devices)
- Can't test native behavior
- Limited to component testing
- Different from production environment

### 4. Manual testing only
**Rejected because**:
- Time-consuming
- Error-prone
- Can't run in CI
- Doesn't scale
- No regression testing

## Implementation Notes

### Key Files
- `/maestro/flows/` - Test flow definitions
- `/.maestro/` - Maestro configuration (if needed)
- Package scripts for running tests

### Test Flow Structure

```yaml
appId: com.tiedsiren51
---
# Test steps
- launchApp
- tapOn: "Element text or testID"
- inputText: "text to input"
- assertVisible: "Expected text"
- takeScreenshot: "step-name"
```

### Common Commands

**Navigation**:
```yaml
- tapOn: "Home"
- swipe:
    direction: LEFT
- scroll:
    until:
      visible: "Target Element"
```

**Assertions**:
```yaml
- assertVisible: "Success Message"
- assertNotVisible: "Error"
```

**Input**:
```yaml
- inputText: "user input"
- tapOn:
    id: "submit-button"  # React Native testID
```

### Test Organization

```
/maestro/flows/
  ├── auth/
  │   ├── login.yaml
  │   ├── signup.yaml
  │   └── logout.yaml
  ├── blocklists/
  │   ├── create-blocklist.yaml
  │   └── delete-blocklist.yaml
  ├── sessions/
  │   ├── start-session.yaml
  │   └── stop-session.yaml
  └── smoke.yaml  # Critical path
```

### Test ID Pattern

Add testID to components for reliable selectors:

```typescript
<Button testID="submit-button">Submit</Button>
<TextInput testID="email-input" />
```

### Running Tests Locally

```bash
# Install Maestro
brew tap mobile-dev-inc/tap
brew install maestro

# Run all tests
yarn test:e2e

# Run specific flow
maestro test maestro/flows/auth/login.yaml

# Interactive mode (step through)
maestro studio maestro/flows/auth/login.yaml

# Record video
maestro --record test maestro/flows/smoke.yaml
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [pull_request]

jobs:
  e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Maestro
        run: |
          brew tap mobile-dev-inc/tap
          brew install maestro

      - name: Build App
        run: |
          yarn install
          yarn prebuild
          yarn build:ios:simulator

      - name: Run E2E Tests
        run: |
          maestro test maestro/flows/
```

### E2E Test Strategy

**Smoke tests** (critical path):
- User registration
- Login
- Create blocklist
- Start session
- Stop session

**Feature tests** (comprehensive):
- All CRUD operations
- Navigation flows
- Error scenarios
- Edge cases

**Run frequency**:
- Smoke: Every PR
- Full suite: Daily/weekly
- Manual: Before releases

### Debugging Failed Tests

**Local debugging**:
```bash
# Run with verbose output
maestro --verbose test flow.yaml

# Interactive mode
maestro studio flow.yaml

# Screenshots on each step
maestro --screenshot test flow.yaml
```

**CI debugging**:
- Review Maestro logs
- Check uploaded screenshots
- Reproduce locally with same build

### Environment Switching

Use environment variables for E2E:

```typescript
// App code
const authGateway = process.env.EXPO_PUBLIC_E2E === 'true'
  ? new FakeAuthGateway()  // For E2E tests
  : new FirebaseAuthGateway()  // For production
```

Build E2E version:
```bash
EXPO_PUBLIC_E2E=true yarn build:e2e
```

### Related ADRs
- [Vitest Over Jest](vitest-over-jest.md)
- [Test Store Factory](test-store-factory.md)

## References

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Best Practices](https://maestro.mobile.dev/best-practices)
- `/maestro/flows/` - Test implementations
