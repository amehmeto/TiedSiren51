# Design System Principles

Date: 2025-11-23

## Status

Accepted

## Context

The TiedSiren51 mobile application requires a consistent, maintainable approach to UI component development. Without clear design system guidelines, we face:

- Code duplication across screens and features
- Inconsistent styling and user experience
- Difficulty maintaining visual consistency
- Longer development cycles for UI changes
- Coupling between UI components and business logic

We need a design system that promotes reusability, maintainability, and consistency while remaining pragmatic for a small team.

## Decision

We adopt a design system approach with the following principles:

### 1. Centralized Design Tokens

All design constants (colors, spacing, typography, shadows, etc.) live in `ui/design-system/theme.ts` as the single source of truth exported as the `T` object.

```typescript
// ✅ Good: Using design tokens
backgroundColor: T.color.lightBlue
padding: T.spacing.medium
borderRadius: T.border.radius.roundedSmall

// ❌ Bad: Hardcoded values
backgroundColor: 'rgba(0, 212, 255, 1)'
padding: 16
borderRadius: 5
```

### 2. Reusable Components Directory

Shared UI components live in `ui/design-system/components/shared/` and are prefixed with `TiedS` (e.g., `TiedSButton`, `TiedSModal`, `TiedSCard`).

### 3. Dumb, Presentation-Only Components

Design system components should be:
- **Stateless**: Accept props, render UI
- **Agnostic**: No business logic, no direct API calls, no Redux dependencies
- **Composable**: Small, focused responsibilities
- **Accessible**: Include proper accessibility props

```typescript
// ✅ Good: Dumb, reusable component
export function TiedSButton({ onPress, text, disabled }: Props) {
  return <Pressable onPress={onPress} disabled={disabled}>...</Pressable>
}

// ❌ Bad: Business logic in component
export function TiedSButton({ userId }: Props) {
  const dispatch = useDispatch()
  const handlePress = () => dispatch(updateUser(userId))
  return <Pressable onPress={handlePress}>...</Pressable>
}
```

### 4. Extract, Don't Duplicate

When a UI pattern appears in multiple places, extract it into the design system rather than duplicating code.

```typescript
// ✅ Good: Enhance existing component
<TiedSCloseButton onPress={handleClose} style={customStyle} />

// ❌ Bad: Duplicate the close button logic in every screen
<Pressable onPress={handleClose}>
  <Icon name="close" size={20} color={T.color.text} />
</Pressable>
```

### 5. Atomic Design Inspiration (Non-Strict)

Components are implicitly organized by complexity, inspired by Atomic Design:

- **Atoms** (implicit): Basic building blocks like `TiedSButton`, `TiedSTextInput`
- **Molecules** (implicit): Simple combinations like `TiedSCard`, `TiedSModal`
- **Organisms** (implicit): Complex components like `BlockingConditionModal`

However, we **do not** enforce strict directory segregation (no `/atoms`, `/molecules`, `/organisms` folders). All shared components live in `components/shared/` for simplicity.

### 6. Component Improvement Over Creation

Before creating a new component variant, first consider if an existing component can be enhanced with additional props to support the use case.

```typescript
// ✅ Good: Make component flexible
<TiedSModal
  animationEnabled={true}
  backdropColor={T.color.modalBackgroundColor}
/>

// ❌ Bad: Create AnimatedTiedSModal, CustomBackdropTiedSModal, etc.
```

## Consequences

### Positive

- **Consistency**: All UI follows the same visual language via design tokens
- **Maintainability**: Changes to theme propagate automatically to all components
- **Reusability**: Dumb components can be used anywhere without side effects
- **Developer velocity**: Pre-built components accelerate feature development
- **Easier testing**: Presentation components are simple to test in isolation
- **Reduced bundle size**: Less code duplication

### Negative

- **Initial overhead**: Extracting and generalizing components takes more time upfront
- **Abstraction complexity**: Overly flexible components can become hard to understand
- **Learning curve**: New developers must learn the design system conventions
- **Refactoring burden**: Existing screens may need refactoring to use design system

### Neutral

- Components may need more props to support different use cases
- Some duplication is acceptable for truly unique, one-off UI patterns

## Alternatives Considered

### Strict Atomic Design with Directory Segregation

Create separate directories: `/atoms`, `/molecules`, `/organisms`, `/templates`.

**Why rejected**:
- Adds unnecessary complexity for a small team
- Ambiguity in categorization (is X a molecule or organism?)
- Doesn't provide clear practical benefits over flat structure

### Inline Styling Everywhere

Allow components to define styles inline without the design system.

**Why rejected**:
- Leads to inconsistency
- Makes global style changes nearly impossible
- Harder to maintain and audit visual design

### Component Library (e.g., React Native Paper, NativeBase)

Use a third-party component library instead of building our own.

**Why rejected**:
- External dependencies add bundle size and upgrade risks
- Limited customization and brand identity
- We already have established patterns and components

## Implementation Notes

### Key Files

- `ui/design-system/theme.ts` - Design tokens (T object)
- `ui/design-system/components/shared/` - Reusable components

### Migration Strategy

When refactoring existing code:
1. Identify duplicated UI patterns
2. Extract to design system if used in 2+ places
3. Make component props flexible for different contexts
4. Update all usage sites to use the new component
5. Remove old duplicated code

### Naming Convention

- Prefix: `TiedS` (TiedSiren)
- Descriptive: `TiedSButton`, `TiedSModal`, `TiedSCard`
- Avoid: `Button1`, `ButtonV2`, `NewButton`

### Review Checklist

Before merging UI code, verify:
- [ ] Uses `T` object for all styling constants
- [ ] No duplicated component logic
- [ ] Design system components are enhanced, not duplicated
- [ ] Components are stateless and presentational
- [ ] Proper accessibility props included

## References

- PR #121: Example of design system violations (code duplication, hardcoded styles)
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Design Tokens - W3C Community Group](https://design-tokens.github.io/community-group/)
