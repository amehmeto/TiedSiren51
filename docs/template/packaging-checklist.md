# Packaging Checklist

Considerations before releasing this codebase as a reusable template.

## Before Packaging

### Strip Project-Specific Code
- [ ] Remove siren detection domain (`core/siren/`, `infra/siren/`)
- [ ] Remove project-specific screens
- [ ] Remove project-specific assets (icons, splash)
- [ ] Clear hardcoded app names/identifiers

### Environment Variables
- [ ] Create `.env.example` with all required vars
- [ ] Document each variable's purpose
- [ ] Identify secrets vs configuration
- [ ] Add env validation on startup

### Dependencies Audit
| Keep | Review | Remove |
|------|--------|--------|
| Redux Toolkit | Sentry (if logger abstracted) | Project-specific native modules |
| Zod | Expo modules | Domain-specific packages |
| React Navigation | Push notification libs | |

---

## For Consumers

### Naming Checklist
Things to rename when starting a new project:
- [ ] `app.json` - name, slug, scheme, bundleIdentifier, package
- [ ] `package.json` - name, description, repository
- [ ] Android package name in `android/`
- [ ] iOS bundle identifier in `ios/`
- [ ] Design system prefix (TiedS → YourPrefix)

### Onboarding Guide
Document for new developers:
- [ ] Prerequisites (Node version, tools)
- [ ] Setup steps
- [ ] Project structure explanation
- [ ] Common tasks (add feature, add screen, run tests)

### Example Project
- [ ] Create minimal working example
- [ ] Show one complete feature flow
- [ ] Demonstrate testing patterns

---

## Maintenance

### License
| License | Use Case |
|---------|----------|
| MIT | Maximum adoption, no restrictions |
| Apache 2.0 | Patent protection, attribution required |
| Proprietary | Internal company use only |

### Versioning
- Follow SemVer for published packages
- Document breaking changes in CHANGELOG
- Tag releases in git

### Migration Guides
For each major version:
- [ ] List breaking changes
- [ ] Provide upgrade steps
- [ ] Include codemods if possible

---

## Validation

### Test the Template
- [ ] Generate fresh project from template
- [ ] Verify `npm install` succeeds
- [ ] Verify `npm test` passes
- [ ] Verify `npm run lint` passes
- [ ] Verify app builds (iOS + Android)
- [ ] Verify app runs on simulator/device

### CI for Template
- [ ] Scheduled workflow to test template generation
- [ ] Test against multiple Node versions
- [ ] Test on multiple OS (macOS, Ubuntu, Windows)
