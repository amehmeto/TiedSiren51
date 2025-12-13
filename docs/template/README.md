# Reusable Project Template

This documentation captures reusable components from the TiedSiren51 codebase that can be extracted for bootstrapping new TypeScript/React projects.

## Quick Reference

| Component | Reusability | Documentation |
|-----------|-------------|---------------|
| Prettier/ESLint | 100% | [Configuration](./configuration.md) |
| TypeScript Config | 90% | [Configuration](./configuration.md) |
| Vitest Setup | 80% | [Testing](./testing.md) |
| GitHub Actions | 75% | [CI/CD](./ci-cd.md) |
| Custom ESLint Rules | 60% | [ESLint Setup](./eslint-setup.md) |
| Architecture Patterns | 95% | [Architecture](./architecture.md) |

## Files to Copy Directly (100% Reusable)

```bash
# Copy these files as-is to any new project
.prettierrc.json      # Prettier configuration
.npmrc                # npm strict mode
.nvmrc                # Node version lock
.releaserc.json       # Semantic release config
.husky/               # Git hooks directory
scripts/              # Coverage tracking scripts
```

## Getting Started

1. **Configuration Files** - Start with [configuration.md](./configuration.md)
2. **Linting Setup** - See [eslint-setup.md](./eslint-setup.md)
3. **Testing Infrastructure** - See [testing.md](./testing.md)
4. **CI/CD Pipelines** - See [ci-cd.md](./ci-cd.md)
5. **Architecture Patterns** - See [architecture.md](./architecture.md)

## What's Project-Specific (Skip)

- `app.config.js` - Expo/React Native configuration
- `eas.json` - EAS build configuration
- Android/iOS native code
- Domain-specific ESLint rules (icon sizes, stylesheets)
- Firebase configuration
