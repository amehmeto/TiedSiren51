# Quick Start

From clone to running app in 5 minutes.

## Prerequisites

- Node.js (see `.nvmrc` for version)
- npm
- iOS: Xcode + CocoaPods
- Android: Android Studio + SDK

## Setup

```bash
# Clone
git clone <repo-url> my-app
cd my-app

# Install dependencies
npm ci

# Set up environment
cp .env.example .env
# Edit .env with your values
```

## Run

```bash
# Start Metro bundler
npm start

# iOS (separate terminal)
npm run ios

# Android (separate terminal)
npm run android
```

## Verify

```bash
# Run tests
npm test

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Project Structure

```
src/
├── core/           # Business logic (framework-agnostic)
│   ├── _ports_/    # Interfaces for external dependencies
│   ├── _redux_/    # Store setup, thunk factory
│   ├── _tests_/    # Test utilities
│   └── <domain>/   # Feature modules
├── infra/          # External implementations
│   └── <service>/  # Real + fake implementations
└── ui/             # React Native screens
    ├── design-system/
    ├── hooks/
    └── screens/
```

## Common Tasks

### Add a feature

```bash
# Create domain files
mkdir -p src/core/my-feature
touch src/core/my-feature/my-feature.slice.ts
touch src/core/my-feature/my-feature.selectors.ts
touch src/core/my-feature/my-feature.usecases.ts
touch src/core/my-feature/my-feature.test.ts
```

### Run specific tests

```bash
# Single file
npm test -- src/core/auth/auth.test.ts

# Watch mode
npm test -- --watch

# With coverage
npm run test:cov
```

### Check before committing

```bash
npm run test:prepush
```

## Next Steps

1. Read [architecture rationale](./architecture-rationale.md)
2. Review [anti-patterns](./anti-patterns.md)
3. Check [reusable components](./reusable-components.md)
