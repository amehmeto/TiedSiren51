# Custom Hooks Should Encapsulate Their Dependencies

Date: 2025-12-08

## Status

Accepted

## Context

When creating custom React hooks, there's a design decision about how they should access their dependencies:

1. **Pass dependencies as parameters**: The caller provides dependencies to the hook
2. **Encapsulate dependencies internally**: The hook accesses dependencies directly

In TiedSiren51, we have a central `dependencies` object that provides access to infrastructure services (repositories, gateways, providers). Custom hooks often need these dependencies to perform their work.

**Example of the problematic pattern:**

```typescript
// Hook requires sirenLookout as parameter
export function useAccessibilityPermission(sirenLookout: SirenLookout) {
  const [hasPermission, setHasPermission] = useState(true)

  const checkPermission = useCallback(async () => {
    if (isAndroidSirenLookout(sirenLookout)) {
      const isEnabled = await sirenLookout.isEnabled()
      setHasPermission(isEnabled)
    } else setHasPermission(true)
  }, [sirenLookout])

  useAppForeground(() => {
    void checkPermission()
  })

  return hasPermission
}

// Component must know about and pass the dependency
function HomeScreen() {
  const { sirenLookout } = dependencies
  const hasAccessibilityPermission = useAccessibilityPermission(sirenLookout)
  // ...
}
```

Issues with this approach:
- **Leaky abstraction**: Components must know which dependencies hooks need
- **Boilerplate**: Same dependency extraction repeated across components
- **Coupling**: If hook's dependencies change, all callers must update
- **Reduced encapsulation**: Implementation detail (which service is used) exposed to caller

## Decision

**Custom hooks should encapsulate their dependencies** by accessing them directly from the `dependencies` object, rather than requiring callers to pass them.

### Pattern

```typescript
// ui/hooks/useAccessibilityPermission.ts
import { dependencies } from '@/ui/dependencies'

export function useAccessibilityPermission() {
  const { sirenLookout } = dependencies  // Hook gets its own dependencies
  const [hasPermission, setHasPermission] = useState(true)

  const checkPermission = useCallback(async () => {
    if (isAndroidSirenLookout(sirenLookout)) {
      const isEnabled = await sirenLookout.isEnabled()
      setHasPermission(isEnabled)
    } else setHasPermission(true)
  }, [sirenLookout])

  useAppForeground(() => {
    void checkPermission()
  })

  return hasPermission
}

// Component has cleaner API
function HomeScreen() {
  const hasAccessibilityPermission = useAccessibilityPermission()
  // ...
}
```

### Guidelines

1. **Access dependencies internally**: Hooks import and use `dependencies` directly
2. **Keep API minimal**: Only expose what callers need (return values, optional config)
3. **Hide implementation details**: Callers shouldn't know which services the hook uses
4. **Single responsibility**: Each hook should have a clear, focused purpose

### When to Pass Parameters

Parameters should only be passed when they represent:
- **Configuration options**: Values that legitimately vary per call site
- **User input**: Data from the component's context (e.g., form values)
- **Callback functions**: Event handlers the caller wants to hook into

```typescript
// Good: config parameter that varies per use
export function usePolling(intervalMs: number) { ... }

// Good: callback for caller customization
export function useAsyncOperation(onError?: (e: Error) => void) { ... }

// Bad: passing infrastructure dependency
export function useTimer(dateProvider: DateProvider) { ... }  // Should get from dependencies
```

## Consequences

### Positive

- **Cleaner API**: Hooks are simpler to use - just call them
- **Better encapsulation**: Implementation details stay hidden
- **Reduced coupling**: Changing hook's dependencies doesn't affect callers
- **Less boilerplate**: No repeated dependency extraction in components
- **Consistency**: All hooks follow the same pattern
- **Discoverability**: Hook's purpose is clear from name, not obscured by parameters

### Negative

- **Implicit dependencies**: Not immediately obvious what a hook depends on
- **Testing consideration**: Tests must ensure `dependencies` is properly configured
- **Less flexibility**: Can't easily swap dependencies per call site (rarely needed)

### Neutral

- **Aligns with DI pattern**: Hooks become like services that receive dependencies via DI container
- **Convention-based**: Team must follow pattern consistently

## Alternatives Considered

### 1. Always Pass Dependencies as Parameters

```typescript
const hasPermission = useAccessibilityPermission(sirenLookout)
```

**Rejected because**:
- Creates boilerplate in every component
- Leaks implementation details to callers
- Makes hook API unnecessarily complex
- Violates encapsulation principles

### 2. React Context for Dependencies

```typescript
const { sirenLookout } = useDependencies()  // Custom context hook
```

**Rejected because**:
- Adds indirection without benefit over direct import
- Requires Provider setup
- Our dependencies are static (set at app startup), not dynamic
- Current `dependencies` object approach works well

### 3. Higher-Order Hook Factory

```typescript
const useAccessibilityPermission = createHook(dependencies)
```

**Rejected because**:
- Over-engineering for our use case
- Adds complexity without clear benefit
- Dependencies don't change at runtime

## Implementation Notes

### Existing Hooks to Reference

- `ui/hooks/useAppForeground.ts` - Uses no external dependencies (pure React)
- `ui/hooks/useTick.ts` - Gets `dateProvider` from dependencies internally
- `ui/hooks/useAccessibilityPermission.ts` - Gets `sirenLookout` from dependencies internally

### Testing Custom Hooks

When testing hooks that use `dependencies`:

```typescript
// Test setup can mock dependencies
vi.mock('@/ui/dependencies', () => ({
  dependencies: {
    sirenLookout: mockSirenLookout,
  },
}))
```

### Related ADRs

- [Dependency Injection Pattern](../core/dependency-injection-pattern.md)
- [Minimize useEffect Usage](minimize-useeffect-usage.md)
- [View Model Pattern](view-model-pattern.md)

## References

- [PR #139](https://github.com/amehmeto/TiedSiren51/pull/139) - Pattern emerged from code review
- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- `ui/dependencies.ts` - Central dependencies object
