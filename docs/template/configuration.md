# Configuration Files

## Prettier (.prettierrc.json)

Copy directly - 100% reusable:

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "semi": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true
}
```

## npm Configuration (.npmrc)

Copy directly - enforces version compliance:

```
engine-strict=true
```

## Node Version (.nvmrc)

```
18.18.2
```

Update version as needed for your project.

## TypeScript (tsconfig.json)

Strict configuration with path aliases:

```jsonc
{
  "compilerOptions": {
    // Strict mode - all flags enabled
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    // Code quality
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,

    // Path aliases - customize for your project
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@core/*": ["core/*"],
      "@infra/*": ["infra/*"],
      "@ui/*": ["ui/*"]
    }
  }
}
```

### What to Customize

- `paths` - Update aliases to match your folder structure
- `extends` - Remove `expo/tsconfig.base` if not using Expo

## Package.json Scripts

### Reusable Script Patterns

```json
{
  "scripts": {
    // Linting
    "lint": "tsc --noEmit && eslint \"**/*.{js,ts,tsx}\" && prettier --check \"**/*.{js,ts,tsx}\"",
    "lint:fix": "eslint --fix \"**/*.{js,ts,tsx}\" && prettier --write \"**/*.{js,ts,tsx}\"",
    "lint:sh": "shellcheck scripts/*.sh",

    // Testing
    "test": "vitest",
    "test:prepush": "vitest --run",
    "test:cov": "c8 --all --reporter=text --reporter=json-summary vitest --run",
    "test:cov:track": "c8 --reporter=json vitest --run && node scripts/track-coverage.js",

    // Version enforcement
    "preinstall": "npx only-allow npm",

    // Git hooks
    "prepare": "is-ci || husky"
  }
}
```

### Lint-staged Configuration

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": "npm run lint:fix",
    "*.sh": "shellcheck"
  }
}
```

## Semantic Release (.releaserc.json)

Automated versioning and changelog:

```json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", { "npmPublish": false }],
    [
      "@semantic-release/git",
      {
        "assets": ["package.json", "package-lock.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ],
    "@semantic-release/github"
  ]
}
```

Set `npmPublish: true` if publishing to npm.

## Required Dependencies

```bash
# Dev dependencies for configuration
npm install -D \
  typescript \
  prettier \
  eslint \
  husky \
  lint-staged \
  is-ci \
  shellcheck \
  @semantic-release/changelog \
  @semantic-release/git \
  semantic-release
```
