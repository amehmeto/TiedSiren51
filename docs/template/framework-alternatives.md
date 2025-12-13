# Framework Alternatives

Options for packaging this codebase as a reusable starter for new projects.

## 1. GitHub Template Repository

**Effort**: Low
**Flexibility**: Medium

### How it works
- Mark repo as "Template" in GitHub settings
- Users click "Use this template" → new repo with full codebase
- Manual find/replace for project-specific names

### Pros
- Zero tooling required
- Users get full code ownership
- Easy to understand

### Cons
- No automated customization
- Manual renaming tedious
- No updates after creation

---

## 2. create-X-app CLI

**Effort**: High
**Flexibility**: High

### How it works
```bash
npx create-tiedsiren-app my-app
# Prompts: Project name? Include auth? Include logger?
```

### Implementation
- Package with `bin` field in package.json
- Prompts using `inquirer` or `prompts`
- Template files with placeholders (e.g., `{{projectName}}`)
- File copying + placeholder replacement

### Pros
- Professional developer experience
- Selective feature inclusion
- Automated naming/configuration

### Cons
- Significant development effort
- Template maintenance overhead
- No updates after generation

---

## 3. Monorepo with Published Packages

**Effort**: Very High
**Flexibility**: Very High

### How it works
```bash
npm install @your-scope/core-auth @your-scope/eslint-config
```

### Package structure
| Package | Contents |
|---------|----------|
| `@scope/core-auth` | Auth domain + ports |
| `@scope/core-redux` | createAppThunk, store factory |
| `@scope/infra-common` | Abstract repository, date provider |
| `@scope/eslint-config` | ESLint rules + config |
| `@scope/testing` | Test store, state builder, data builders |

### Pros
- Versioned, updatable dependencies
- Mix and match components
- True framework experience

### Cons
- Complex to set up and maintain
- Publishing/versioning overhead
- Breaking changes affect all consumers

---

## Recommendation

| Scenario | Recommendation |
|----------|----------------|
| Personal projects | GitHub Template |
| Team/company standardization | create-X-app CLI |
| Open source framework | Monorepo packages |
