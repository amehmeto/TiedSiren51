Upgrade all 4 custom Expo native modules from SDK 51/53 to SDK 55.

The modules are sibling repos cloned at `/Users/arthurmehmetoglu/Development/`.

## IMPORTANT: Work on feature branches

Each module must be upgraded on a **feature branch**, NOT on main.
The main app (`tied-siren-project`) references these modules via
`github:amehmeto/<module>` which resolves to the main branch.
We must NOT break main until the main app is also upgraded to SDK 55.

For each module:

1. `cd` into the module directory
2. `git checkout -b feat/expo-sdk-55`
3. Make the changes
4. `npm install` to verify
5. `git add -A && git commit` with message `chore: bump to Expo SDK 55`
6. `git push -u origin feat/expo-sdk-55`

## Upgrade Order (strict --- each depends on the previous)

### 1. expo-list-installed-apps (most outdated)

Path: `/Users/arthurmehmetoglu/Development/expo-list-installed-apps`

- `package.json`: bump `expo-module-scripts` ^3.5.1 to ^5.0.0, add `expo: ~55.0.0` peer dep, update `expo-modules-core` to match SDK 55
- `android/build.gradle`: `compileSdk` 34 to 35, `targetSdk` 34 to 35
- `expo-module.config.json`: remove `ios`, `tvos`, `web` platform entries (no implementation exists, Android-only)
- Run `npm install` and verify no errors

### 2. expo-accessibility-service

Path: `/Users/arthurmehmetoglu/Development/expo-accessibility-service`

- `package.json`: bump `expo` ~53.0.0 to ~55.0.0, `expo-module-scripts` ^4.1.9 to ^5.0.0
- `android/build.gradle`: `compileSdk` 34 to 35, `targetSdk` 34 to 35, `minSdk` 16 to 24
- `ios/*.podspec`: iOS deployment target to 16.0, Swift version to 5.9
- Run `npm install` and verify no errors

### 3. expo-foreground-service

Path: `/Users/arthurmehmetoglu/Development/expo-foreground-service`

- `package.json`: bump `expo` ~53.0.0 to ~55.0.0, `expo-module-scripts` ^4.1.9 to ^5.0.0
- `android/build.gradle`: `compileSdk` 34 to 35, `targetSdk` 34 to 35
- Run `npm install` and verify no errors

### 4. tied-siren-blocking-overlay (depends on all above)

Path: `/Users/arthurmehmetoglu/Development/tied-siren-blocking-overlay`

- `package.json`: bump `expo-module-scripts` ^4.0.0 to ^5.0.0, add `expo: ~55.0.0` peer dep if missing
- `android/build.gradle`: `compileSdk` 34 to 35, `targetSdk` 34 to 35
- Optionally bump `androidx.constraintlayout` 2.1.4 to 2.2.0, `androidx.appcompat` 1.6.1 to 1.7.0
- Run `npm install` and verify no errors

## Rules

- Work through modules IN ORDER. Do not skip ahead.
- For each module: checkout feature branch, read the files first, make changes, run `npm install`, then commit and push.
- Use conventional commits: `chore: bump to Expo SDK 55`
- Do NOT modify Kotlin or Swift source code unless there is a compilation error.
- Do NOT change any business logic.
- If `expo-module-scripts` v5 does not exist yet, use the latest available version (check npm).
- If a `build.gradle` uses `def expoModulesCoreVersion` or similar variables, update those too.
- Check each `build.gradle` for kotlin version declarations and update if needed for SDK 55 compatibility.

## Verification

After all 4 modules are pushed:

- Each repo has a clean commit on `feat/expo-sdk-55` branch with the SDK 55 bumps
- `npm install` succeeded in each repo without errors
- No source code logic was changed (only versions and config)
- Main branch is untouched on all 4 repos

When ALL 4 modules are committed and pushed on their feature branches, output: `<promise>COMPLETE</promise>`
