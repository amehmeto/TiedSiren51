# Custom ESLint Rules

Date: 2025-01-28

## Status

Accepted

## Context

Standard ESLint rules don't catch all project-specific code quality issues. TiedSiren51 has specific patterns to enforce:

**React Native specific**:
- No magic numbers in StyleSheet (use constants)
- No complex JSX in conditional expressions
- Consistent component patterns

**Problems standard ESLint doesn't catch**:
- `StyleSheet.create({ container: { width: 42 } })` - Magic number 42
- `{condition && <ComplexComponent><Child /></ComplexComponent>}` - Complex JSX in conditional
- Domain-specific anti-patterns

**Options**:
- Ignore project-specific issues
- Manual code review only
- Custom ESLint rules
- Different linter

## Decision

Create **custom ESLint rules** in local plugin for project-specific patterns.

### Implementation

**1. Local Rules Plugin** (`/eslint-plugin-local-rules/`)

```javascript
// /eslint-plugin-local-rules/index.js
module.exports = {
  rules: {
    'no-stylesheet-magic-numbers': require('./rules/no-stylesheet-magic-numbers'),
    'no-complex-jsx-in-conditionals': require('./rules/no-complex-jsx-in-conditionals'),
  },
}
```

**2. ESLint Configuration** (`/.eslintrc.cjs`)

```javascript
module.exports = {
  plugins: ['local-rules'],
  rules: {
    'local-rules/no-stylesheet-magic-numbers': 'warn',
    'local-rules/no-complex-jsx-in-conditionals': 'warn',
  },
}
```

## Consequences

### Positive

- **Project-specific enforcement**: Catch patterns unique to our codebase
- **Automated**: No manual code review needed
- **Consistent**: Rules applied uniformly
- **Educate team**: Rules document best practices
- **Fast feedback**: Errors shown in IDE immediately
- **Customizable**: Full control over rule logic
- **Evolvable**: Add new rules as patterns emerge
- **Type-safe**: Can use TypeScript for rule implementation

### Negative

- **Maintenance overhead**: Must maintain custom rules
- **Learning curve**: Writing ESLint rules is complex
- **Documentation needed**: Team must understand custom rules
- **Testing required**: Custom rules need tests
- **Migration**: Existing code may need updates
- **False positives**: Rules might be too aggressive

### Neutral

- **Local plugin**: Not published to npm (project-specific)
- **Convention**: Requires team discipline to follow

## Alternatives Considered

### 1. Manual Code Review Only
**Rejected because**:
- Inconsistent enforcement
- Slow feedback
- Reviewer fatigue
- Easy to miss in large PRs

### 2. Prettier + Standard Rules
**Rejected because**:
- Doesn't catch logic issues
- Not project-specific
- Can't enforce domain patterns

### 3. TypeScript Only
**Rejected because**:
- Can't catch style issues
- No runtime pattern detection
- Not suitable for JSX patterns

### 4. Different Linter (Biome, etc.)
**Rejected because**:
- Less mature ecosystem
- Harder to write custom rules
- Team familiar with ESLint

## Implementation Notes

### Key Files
- `/eslint-plugin-local-rules/` - Custom rules directory
- `/eslint-plugin-local-rules/index.js` - Plugin export
- `/eslint-plugin-local-rules/rules/` - Individual rule implementations
- `/.eslintrc.cjs` - Rule configuration

### Custom Rule 1: No StyleSheet Magic Numbers

**Problem**:
```typescript
// ❌ Bad - Magic numbers
StyleSheet.create({
  container: {
    width: 42,  // What is 42?
    height: 100,  // Why 100?
    margin: 8,  // Magic number
  },
})
```

**Solution**:
```typescript
// ✅ Good - Named constants
const CONTAINER_WIDTH = 42
const CONTAINER_HEIGHT = 100
const SPACING_SMALL = 8

StyleSheet.create({
  container: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    margin: SPACING_SMALL,
  },
})
```

**Rule implementation**:
```javascript
// /eslint-plugin-local-rules/rules/no-stylesheet-magic-numbers.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow magic numbers in StyleSheet.create',
      category: 'Best Practices',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (isStyleSheetCreate(node)) {
          // Check for numeric literals in style object
          findMagicNumbers(node).forEach(magicNumber => {
            context.report({
              node: magicNumber,
              message: 'Avoid magic numbers in styles, use named constants',
            })
          })
        }
      },
    }
  },
}
```

### Custom Rule 2: No Complex JSX in Conditionals

**Problem**:
```typescript
// ❌ Bad - Complex JSX in conditional
{hasSession && (
  <View>
    <Text>Active Session</Text>
    <Button onPress={stopSession}>Stop</Button>
  </View>
)}
```

**Solution**:
```typescript
// ✅ Good - Extract to component or use ternary with null
const SessionDisplay = () => (
  <View>
    <Text>Active Session</Text>
    <Button onPress={stopSession}>Stop</Button>
  </View>
)

{hasSession && <SessionDisplay />}

// Or
{hasSession ? <SessionDisplay /> : null}
```

**Rule implementation**:
```javascript
// /eslint-plugin-local-rules/rules/no-complex-jsx-in-conditionals.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow complex JSX in conditional expressions',
      category: 'Best Practices',
    },
  },
  create(context) {
    return {
      LogicalExpression(node) {
        if (node.operator === '&&' && isComplexJSX(node.right)) {
          context.report({
            node: node.right,
            message: 'Extract complex JSX to a component',
          })
        }
      },
    }
  },
}

function isComplexJSX(node) {
  // Complex if:
  // - Has children
  // - Multiple props
  // - Nested elements
  return (
    node.type === 'JSXElement' &&
    (node.children.length > 1 || hasMultipleProps(node))
  )
}
```

### Adding New Custom Rules

**Steps**:
1. Identify pattern to enforce
2. Create rule file in `/eslint-plugin-local-rules/rules/`
3. Export rule in `/eslint-plugin-local-rules/index.js`
4. Add to ESLint config in `/.eslintrc.cjs`
5. Test rule
6. Document in this ADR or separate doc

**Rule template**:
```javascript
module.exports = {
  meta: {
    type: 'problem' | 'suggestion' | 'layout',
    docs: {
      description: 'Rule description',
      category: 'Best Practices',
    },
    fixable: 'code' | 'whitespace', // Optional
  },
  create(context) {
    return {
      // AST node visitors
      Identifier(node) {
        // Check and report issues
        if (isViolation(node)) {
          context.report({
            node,
            message: 'Error message',
            fix(fixer) {  // Optional auto-fix
              return fixer.replaceText(node, 'fixed')
            },
          })
        }
      },
    }
  },
}
```

### Testing Custom Rules

```javascript
// /eslint-plugin-local-rules/tests/no-stylesheet-magic-numbers.test.js
const { RuleTester } = require('eslint')
const rule = require('../rules/no-stylesheet-magic-numbers')

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
})

ruleTester.run('no-stylesheet-magic-numbers', rule, {
  valid: [
    {
      code: `
        const WIDTH = 100
        StyleSheet.create({ container: { width: WIDTH } })
      `,
    },
  ],
  invalid: [
    {
      code: `
        StyleSheet.create({ container: { width: 100 } })
      `,
      errors: [{ message: 'Avoid magic numbers in styles' }],
    },
  ],
})
```

### Future Custom Rules (Ideas)

- **No direct Prisma in Core**: Enforce repository pattern
- **Domain imports**: Prevent cross-domain imports (auth importing siren)
- **Test coverage requirements**: Warn if file lacks test
- **Naming conventions**: Enforce naming patterns
- **Redux patterns**: Enforce slice structure

### Related ADRs
- [No Switch Statements](no-switch-statements.md)
- [Complexity Limits](complexity-limits.md)
- [TypeScript Strict Mode](typescript-strict-mode.md)

## References

- [ESLint Custom Rules](https://eslint.org/docs/latest/extend/custom-rules)
- [ESLint Rule Tester](https://eslint.org/docs/latest/integrate/nodejs-api#ruletester)
- [AST Explorer](https://astexplorer.net/) - For rule development
- `/eslint-plugin-local-rules/` - Implementation
