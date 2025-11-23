# No Console Log in Production Code

Date: 2025-01-28

## Status

Accepted

## Context

During development, it's common to use `console.log()` for debugging:

```typescript
console.log('User data:', user)
console.log('Session started')
```

**Problems with console.log in production**:
- **Performance**: Console logging is slow, especially on mobile
- **Security**: May leak sensitive data (passwords, tokens)
- **Noise**: Production logs filled with debug messages
- **Bundle size**: Console statements increase bundle size
- **Unprofessional**: Looks sloppy in production
- **Mobile**: React Native console can cause performance issues

**Need**:
- Debugging during development
- Structured logging in production
- Error tracking
- Performance monitoring

## Decision

**Ban `console.log()` in production code** via ESLint, use proper logging instead.

### Implementation

**.eslintrc.cjs**:
```javascript
module.exports = {
  rules: {
    'no-console': ['warn', {
      allow: ['warn', 'error']  // Allow console.warn and console.error
    }],
  },
}
```

**Proper logging**:
```typescript
// ✅ Development
if (__DEV__) {
  console.log('Debug info:', data)
}

// ✅ Production errors
console.error('Failed to load user:', error)

// ✅ Production warnings
console.warn('Deprecated API used')

// ✅ Proper logger (future)
logger.debug('User loaded', { userId: user.id })
logger.error('Session failed', { error, sessionId })
```

## Consequences

### Positive

- **Performance**: No logging overhead in production
- **Security**: No accidental data leakage
- **Clean logs**: Only intentional logs in production
- **Professional**: Production-ready code
- **Intentional**: Forces thinking about what to log
- **Searchable**: Can grep for console.warn/error only
- **ESLint enforcement**: Automated checking

### Negative

- **Less convenient**: Can't quickly add console.log
- **Debug difficulty**: Harder to debug production issues
- **Workaround needed**: Must use __DEV__ guard or disable ESLint
- **Learning curve**: Team must remember no console.log

### Neutral

- **Development**: Console.log still works in dev mode
- **Warnings/errors**: console.warn and console.error still allowed

## Alternatives Considered

### 1. Allow All Console
**Rejected because**:
- Performance impact
- Accidental data leaks
- Unprofessional
- Hard to audit

### 2. Strip in Build Process
**Rejected because**:
- Requires build config
- Console statements still written
- Harder to audit code
- Better to prevent at authoring

### 3. Custom Logger Only
**Rejected because**:
- Overkill for MVP
- Can add later if needed
- Current solution simpler

### 4. No Logging At All
**Rejected because**:
- Need error logging
- Need warnings
- Debugging impossible

## Implementation Notes

### Key Files
- `/.eslintrc.cjs` - ESLint configuration

### ESLint Configuration

```javascript
module.exports = {
  rules: {
    'no-console': ['warn', {
      allow: ['warn', 'error']  // Only warnings and errors allowed
    }],
  },
}
```

**Effect**:
- `console.log('text')` - ⚠️ ESLint warning
- `console.debug('text')` - ⚠️ ESLint warning
- `console.info('text')` - ⚠️ ESLint warning
- `console.warn('text')` - ✅ Allowed
- `console.error('text')` - ✅ Allowed

### Development Debugging

**Option 1: DEV guard**:
```typescript
if (__DEV__) {
  console.log('Debug data:', complexObject)
}
```

**Option 2: ESLint disable (temporary)**:
```typescript
/* eslint-disable no-console */
console.log('Temporary debug')
/* eslint-enable no-console */
```

**Option 3: Debugger**:
```typescript
debugger  // Use browser/React Native debugger
```

### Production Logging Patterns

**Error logging**:
```typescript
try {
  await saveBlockSession(session)
} catch (error) {
  console.error('Failed to save session:', error)
  // Future: Send to error tracking service
}
```

**Warnings**:
```typescript
if (deprecatedFeature) {
  console.warn('Deprecated feature used, migrate to new API')
}
```

**Development-only**:
```typescript
if (__DEV__) {
  console.log('[Redux Action]', action.type, action.payload)
}
```

### Future: Structured Logging

When app scales, consider proper logger:

```typescript
// Future logger implementation
class Logger {
  debug(message: string, context?: object): void {
    if (__DEV__) {
      console.log('[DEBUG]', message, context)
    }
  }

  info(message: string, context?: object): void {
    // Send to logging service (Sentry, LogRocket, etc.)
  }

  error(message: string, error: Error, context?: object): void {
    console.error('[ERROR]', message, error)
    // Send to error tracking (Sentry)
  }

  warn(message: string, context?: object): void {
    console.warn('[WARN]', message, context)
  }
}

export const logger = new Logger()

// Usage
logger.debug('User session started', { userId, sessionId })
logger.error('Failed to load blocklist', error, { blocklistId })
```

### Pre-commit Hook

Husky pre-commit checks for console.log:

```bash
# .husky/pre-commit
yarn lint  # Will catch console.log violations
```

### Common Violations

**❌ Bad**:
```typescript
console.log('User:', user)
console.log('Starting session')
console.debug('Computed value:', value)
```

**✅ Good**:
```typescript
// Development debugging
if (__DEV__) {
  console.log('User:', user)
}

// Production error
console.error('Session failed:', error)

// Production warning
console.warn('Legacy API used')
```

### Fixing Existing Code

Search for violations:
```bash
# Find all console.log
grep -r "console\\.log" --include="*.ts" --include="*.tsx" .

# Fix automatically (remove or wrap in __DEV__)
```

### Related ADRs
- [TypeScript Strict Mode](typescript-strict-mode.md)
- [Custom ESLint Rules](custom-eslint-rules.md)

## References

- [ESLint no-console](https://eslint.org/docs/latest/rules/no-console)
- [React Native Performance](https://reactnative.dev/docs/performance)
- `/.eslintrc.cjs` - Configuration
