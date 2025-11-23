# Path Aliases for Clean Imports

Date: 2025-01-28

## Status

Accepted

## Context

TiedSiren51 has a deep directory structure:

```
/core/block-session/usecases/start-block-session.usecase.ts
/infra/block-session-repository/prisma.block-session.repository.ts
/ui/screens/Home/HomeScreen/home.view-model.ts
```

**Without path aliases**:
```typescript
// Ugly relative imports
import { createStore } from '../../../core/_redux_/createStore'
import { FakeAuthGateway } from '../../../../core/_tests_/fakes/fake.auth-gateway'
import { Button } from '../../../ui/design-system/Button'
```

**Problems**:
- Hard to read
- Easy to break when moving files
- Hard to tell what's being imported from where
- Brittle (../ counts easy to get wrong)
- Poor discoverability

## Decision

Use **path aliases** via TypeScript configuration to enable absolute imports.

### Configuration

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@core/*": ["core/*"],
      "@infra/*": ["infra/*"],
      "@ui/*": ["ui/*"],
      "@app/*": ["app/*"],
      "@assets/*": ["assets/*"]
    }
  }
}
```

**Usage**:
```typescript
// ✅ Clean absolute imports
import { createStore } from '@core/_redux_/createStore'
import { FakeAuthGateway } from '@core/_tests_/fakes/fake.auth-gateway'
import { Button } from '@ui/design-system/Button'
import { HomeScreen } from '@app/(tabs)/home'
```

## Consequences

### Positive

- **Readability**: Clear where imports come from
- **Refactoring-friendly**: Moving files doesn't break imports
- **Discoverability**: IDE autocomplete shows available paths
- **Consistency**: Same import path from any file
- **Layer visibility**: Immediately see which layer is imported
- **No counting**: No need to count ../../../
- **Professional**: Standard pattern in large codebases
- **IDE support**: Full IntelliSense with path aliases

### Negative

- **Initial setup**: Requires tsconfig and bundler configuration
- **Learning curve**: New developers must learn aliases
- **Tooling**: Some tools (older bundlers) may not support
- **Mix with relative**: Can mix with relative imports (confusing)
- **Debugging**: Stack traces may show aliased paths

### Neutral

- **Convention**: Team must agree on alias usage
- **@ prefix**: Standard but not universal

## Alternatives Considered

### 1. Relative Imports Only
**Rejected because**:
```typescript
import { store } from '../../../../../core/_redux_/createStore'
```
- Unreadable
- Brittle
- Hard to maintain

### 2. Different Alias Prefix (~, $)
**Rejected because**:
- `@` is more standard
- Recognized by more tools
- Better IDE support

### 3. Flat Structure
**Rejected because**:
- Doesn't scale
- Loses organization
- Namespace collisions

### 4. Barrel Exports Only
**Rejected because**:
- Still need imports to barrels
- Adds extra layer
- Can cause circular dependencies

## Implementation Notes

### Key Files
- `/tsconfig.json` - TypeScript path configuration
- `/babel.config.js` - May need babel-plugin-module-resolver for React Native
- `/vitest.config.js` - Test path resolution

### Alias Mapping

| Alias | Resolves To | Usage |
|-------|-------------|-------|
| `@/*` | Root directory | Rare, for root files |
| `@core/*` | `/core/` | Business logic imports |
| `@infra/*` | `/infra/` | Infrastructure imports |
| `@ui/*` | `/ui/` | UI component imports |
| `@app/*` | `/app/` | App/routing imports |
| `@assets/*` | `/assets/` | Asset imports |

### Usage Patterns

**Core layer imports**:
```typescript
import { createAppAsyncThunk } from '@core/_redux_/create-app-thunk'
import { selectActiveSession } from '@core/block-session/selectors'
import { FakeAuthGateway } from '@core/_tests_/fakes/fake.auth-gateway'
```

**UI layer imports**:
```typescript
import { Button } from '@ui/design-system/Button'
import { useAppInitialization } from '@ui/hooks/useAppInitialization'
import { HomeScreen } from '@ui/screens/Home/HomeScreen'
```

**Infra layer imports**:
```typescript
import { PrismaBlockSessionRepository } from '@infra/block-session-repository'
import { FirebaseAuthGateway } from '@infra/auth-gateway'
```

**Mixed imports** (same file):
```typescript
// ✅ Good - Absolute for cross-layer
import { createStore } from '@core/_redux_/createStore'

// ✅ Good - Relative for same directory
import { helper } from './helper'
import type { UserType } from './types'
```

### IDE Configuration

**VS Code** (`settings.json`):
```json
{
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

Auto-imports will use aliases by default.

### Vitest Configuration

```javascript
// vitest.config.js
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@core': path.resolve(__dirname, './core'),
      '@infra': path.resolve(__dirname, './infra'),
      '@ui': path.resolve(__dirname, './ui'),
      '@app': path.resolve(__dirname, './app'),
      '@assets': path.resolve(__dirname, './assets'),
    },
  },
})
```

### React Native / Metro Configuration

May need to configure Metro bundler:

```javascript
// metro.config.js (if needed)
module.exports = {
  resolver: {
    extraNodeModules: {
      '@core': path.resolve(__dirname, 'core'),
      '@infra': path.resolve(__dirname, 'infra'),
      // ...etc
    },
  },
}
```

Or use `babel-plugin-module-resolver`:

```javascript
// babel.config.js
module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@core': './core',
          '@infra': './infra',
          '@ui': './ui',
          '@app': './app',
          '@assets': './assets',
        },
      },
    ],
  ],
}
```

### Best Practices

**DO**:
- Use aliases for cross-layer imports
- Use relative imports for same-directory files
- Keep alias usage consistent across codebase

**DON'T**:
- Mix alias styles (don't use both `@core` and `@/core`)
- Over-use aliases for nearby files
- Create too many aliases (keep it simple)

### Migration from Relative Imports

Use IDE refactoring:
1. Enable path alias support
2. Find/replace relative imports
3. Or let IDE auto-import with aliases

### Related ADRs
- [Hexagonal Architecture](../architecture/hexagonal-architecture.md)
- [Feature-Based Domains](../code-organization/feature-based-domains.md)
- [UI-Core-Infra Separation](../code-organization/ui-core-infra-separation.md)

## References

- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [Babel Module Resolver](https://github.com/tleunen/babel-plugin-module-resolver)
- `/tsconfig.json` - Configuration
