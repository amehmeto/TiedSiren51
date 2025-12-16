# Expo Module Checklist

Complete checklist for creating, configuring, and publishing a standalone Expo module.

## 1. Create Module

```bash
# Create the module
npx create-expo-module@latest expo-my-module --local

# Or with scoped package name
npx create-expo-module@latest @amehmeto/expo-my-module --local
```

### Initial Structure
After creation, you should have:
```
expo-my-module/
├── android/
│   └── src/main/java/expo/modules/mymodule/
├── example/
├── src/
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## 2. Package Configuration

### package.json
- [ ] Set correct `name` (scoped or unscoped)
- [ ] Set `version` to `0.1.0`
- [ ] Add `description`
- [ ] Add `repository` URL
- [ ] Add `author`
- [ ] Add `license` (MIT recommended)
- [ ] Add `keywords` for npm discovery
- [ ] Add `prepare` script for husky: `"prepare": "husky"`

### .npmignore
- [ ] Create `.npmignore` to exclude dev files from npm package:
```
# Development
example/
.github/
.husky/
docs/

# Tests
**/__tests__/
**/*.spec.ts
**/*.test.ts
android/src/test/

# Config
.eslintrc*
.prettierrc*
tsconfig*.json
jest.config.*
vitest.config.*
```

---

## 3. TypeScript Tests

### Setup
- [ ] Create test directory: `src/__tests__/`
- [ ] Add test file: `src/__tests__/index.spec.ts`

### Test Structure
```typescript
import * as MyModule from '../index'

// Mock the native module
jest.mock('../ExpoMyModuleModule', () => ({
  someMethod: jest.fn(),
}))

describe('ExpoMyModule', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls native method correctly', async () => {
    // Test implementation
  })
})
```

### Verify
```bash
npm test
```

---

## 4. Kotlin Tests

### Setup
- [ ] Create test directory: `android/src/test/java/expo/modules/mymodule/`
- [ ] Add JUnit dependency to `android/build.gradle`:
```gradle
dependencies {
  // ... existing dependencies
  testImplementation 'junit:junit:4.13.2'
}
```

### Test Structure
```kotlin
// android/src/test/java/expo/modules/mymodule/ExpoMyModuleTest.kt
package expo.modules.mymodule

import org.junit.Test
import org.junit.Assert.*

class ExpoMyModuleTest {
    @Test
    fun `module name constant is correct`() {
        assertEquals("ExpoMyModule", "ExpoMyModule")
    }

    // Add more tests for validation logic, constants, etc.
}
```

### Verify
```bash
cd example
npx expo prebuild --platform android --no-install
cd android
./gradlew :expo-my-module:testDebugUnitTest
```

---

## 5. Husky Git Hooks

### Setup
```bash
npm install --save-dev husky
npx husky init
```

### pre-commit
- [ ] Create `.husky/pre-commit`:
```
npm test
```

### pre-push (prevent direct push to main)
- [ ] Create `.husky/scripts/` directory
- [ ] Create `.husky/scripts/no-direct-push-main-master.sh`:
```bash
#!/bin/sh

branch=$(git branch --show-current)

if [ "$branch" = "main" ] || [ "$branch" = "master" ]; then
  printf "\033[0;35mDirect push to %s is not allowed.\033[0m\n" "$branch"
  exit 1
fi
```
- [ ] Make executable: `chmod +x .husky/scripts/no-direct-push-main-master.sh`
- [ ] Create `.husky/pre-push`:
```
sh .husky/scripts/no-direct-push-main-master.sh
```

---

## 6. CI Workflow

- [ ] Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    types: [opened, synchronize, reopened, closed]

permissions:
  contents: write

jobs:
  typescript:
    name: TypeScript & Lint
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Build module
        run: npm run build

      - name: Run tests
        run: npm test

  android:
    name: Android Build
    if: github.event.action != 'closed'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Cache Gradle dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install npm dependencies
        run: npm ci

      - name: Install example dependencies
        working-directory: ./example
        run: npm ci

      - name: Generate Android project (expo prebuild)
        working-directory: ./example
        run: npx expo prebuild --platform android --no-install

      - name: Run Kotlin unit tests
        working-directory: ./example/android
        run: ./gradlew :expo-my-module:testDebugUnitTest

      - name: Build example Android app (release)
        working-directory: ./example/android
        run: ./gradlew assembleRelease

      - name: Rename APK
        run: |
          mv example/android/app/build/outputs/apk/release/app-release.apk \
             example/android/app/build/outputs/apk/release/expo-my-module.apk

      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: expo-my-module
          path: example/android/app/build/outputs/apk/release/expo-my-module.apk
          retention-days: 30

      - name: Create PR release
        if: github.event_name == 'pull_request'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: pr-${{ github.event.pull_request.number }}-${{ github.sha }}
          name: 'Example APK - PR #${{ github.event.pull_request.number }}'
          body: |
            Automated build for PR #${{ github.event.pull_request.number }}.

            **Commit:** ${{ github.sha }}
            **Branch:** ${{ github.head_ref }}

            Download the APK below to test the changes.
          files: example/android/app/build/outputs/apk/release/expo-my-module.apk
          prerelease: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  cleanup-pr-releases:
    name: Cleanup PR Releases
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Cleanup PR build releases
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          PR_NUMBER="${{ github.event.pull_request.number }}"
          echo "Cleaning up releases for PR #${PR_NUMBER}"

          RELEASES=$(gh release list --limit 1000 | grep "pr-${PR_NUMBER}-" | awk '{print $1}' || true)

          if [ -z "$RELEASES" ]; then
            echo "No releases found for PR #${PR_NUMBER}"
            exit 0
          fi

          echo "$RELEASES" | while read -r TAG; do
            if [ -n "$TAG" ]; then
              echo "Deleting release: $TAG"
              gh release delete "$TAG" --yes --cleanup-tag || true
            fi
          done

          echo "Cleanup complete for PR #${PR_NUMBER}"
```

**Note:** Replace `expo-my-module` with your actual module name (the gradle module name format, e.g., `amehmeto-expo-my-module`).

---

## 7. Release Workflow

- [ ] Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main  # or master

jobs:
  build-apk:
    name: Build Example APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Cache Gradle dependencies
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install npm dependencies
        run: npm ci

      - name: Install example dependencies
        working-directory: ./example
        run: npm ci

      - name: Generate Android project (expo prebuild)
        working-directory: ./example
        run: npx expo prebuild --platform android --no-install

      - name: Build example Android app (release)
        working-directory: ./example/android
        run: ./gradlew assembleRelease

      - name: Rename APK
        run: |
          mv example/android/app/build/outputs/apk/release/app-release.apk \
             example/android/app/build/outputs/apk/release/expo-my-module.apk

      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: expo-my-module-release
          path: example/android/app/build/outputs/apk/release/expo-my-module.apk
          retention-days: 90

  release:
    name: Semantic Release
    needs: build-apk
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: TypeScript check
        run: npx tsc --noEmit

      - name: Build module
        run: npm run build

      - name: Run tests
        run: npm test

      - name: Download APK artifact
        uses: actions/download-artifact@v4
        with:
          name: expo-my-module-release
          path: ./release-assets

      - name: Semantic Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npx semantic-release
```

---

## 8. Semantic Release Configuration

- [ ] Install dependencies:
```bash
npm install --save-dev semantic-release @semantic-release/changelog @semantic-release/git
```

- [ ] Create `.releaserc.json`:
```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    [
      "@semantic-release/github",
      {
        "assets": [
          {
            "path": "release-assets/expo-my-module.apk",
            "label": "Example App (Android APK)"
          }
        ]
      }
    ],
    "@semantic-release/git"
  ]
}
```

---

## 9. Branch Protection

After pushing to GitHub, protect the main branch:

### Via GitHub UI
1. Go to Settings > Branches > Add rule
2. Branch name pattern: `main`
3. Enable:
   - [x] Require a pull request before merging
   - [x] Require status checks to pass before merging
   - [x] Require branches to be up to date before merging
   - [x] Status checks: `TypeScript & Lint`, `Android Build`
   - [x] Do not allow bypassing the above settings

### Via GitHub CLI
```bash
gh api repos/{owner}/{repo}/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["TypeScript & Lint","Android Build"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews=null \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false
```

---

## 10. Example App Configuration

### metro.config.js (for local development)
- [ ] Create `example/metro.config.js` if module resolution issues:
```javascript
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

config.resolver.extraNodeModules = {
  'expo-my-module': path.resolve(__dirname, '..'),
}

config.watchFolders = [path.resolve(__dirname, '..')]

module.exports = config
```

---

## Final Validation

- [ ] `npm install` succeeds
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Example app builds: `cd example && npx expo prebuild --platform android`
- [ ] Example app runs: `cd example && npx expo run:android`
- [ ] CI workflow passes on PR
- [ ] Release workflow triggers on merge to main
- [ ] APK attached to GitHub release
- [ ] npm package published (if public)

---

## Quick Reference

| Task | Command |
|------|---------|
| Create module | `npx create-expo-module@latest expo-my-module --local` |
| Run tests | `npm test` |
| Run Kotlin tests | `./gradlew :module-name:testDebugUnitTest` |
| Build example APK | `cd example/android && ./gradlew assembleRelease` |
| Prebuild Android | `cd example && npx expo prebuild --platform android` |
| Run on device | `cd example && npx expo run:android` |
