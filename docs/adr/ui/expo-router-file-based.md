# Expo Router for File-Based Routing

Date: 2025-01-28

## Status

Accepted

## Context

React Native navigation traditionally requires manual route configuration. TiedSiren51 needs type-safe, maintainable routing for auth flows, tab navigation, and deep linking.

## Decision

Use **Expo Router** with file-based routing where the file system structure defines routes.

### Structure

```
/app/
  ├── (auth)/        # Auth group
  │   ├── login.tsx
  │   └── signup.tsx
  ├── (tabs)/        # Tab navigation
  │   ├── home/
  │   ├── blocklists/
  │   └── settings/
  └── _layout.tsx    # Root layout
```

## Consequences

**Positive**: Type-safe routes (`typedRoutes: true`), automatic deep linking, simpler than React Navigation, convention-based, less boilerplate

**Negative**: Expo-specific (vendor lock-in), newer than React Navigation (smaller community), file structure constraints

## Related

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- `/app/` - Implementation
- `/app.config.js` - Config with `experiments.typedRoutes`
