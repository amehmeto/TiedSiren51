# GitHub Workflows

All workflows are named after Greek divinities, each chosen for their mythological role that mirrors the workflow's function.

## The Pantheon

| Workflow | Deity | Role | Trigger |
|----------|-------|------|---------|
| [cerberus.yml](./cerberus.yml) | [Cerberus](https://www.wikiwand.com/en/articles/Cerberus) | Three-headed guardian of the underworld | PR events |
| [hades.yml](./hades.yml) | [Hades](https://www.wikiwand.com/en/articles/Hades) | Ruler who judges souls in the underworld | Push to main, scheduled |
| [hecate.yml](./hecate.yml) | [Hecate](https://www.wikiwand.com/en/articles/Hecate) | Goddess of crossroads with three faces | Called by other workflows |
| [hephaestus.yml](./hephaestus.yml) | [Hephaestus](https://www.wikiwand.com/en/articles/Hephaestus) | Divine blacksmith who forges for the gods | Issue labeled 'ready' |
| [moirai.yml](./moirai.yml) | [Moirai](https://www.wikiwand.com/en/articles/Moirai) | The three Fates who weave destiny's tapestry | Manual trigger |

## Workflow Details

### Cerberus - The Guardian

Like the three-headed hound guarding the gates of the underworld, Cerberus ensures code quality through multiple checks (tests, lint, build) before allowing passage to the next stage.

- **Triggers**: Pull request events
- **Jobs**: Runs tests, linting, type checking, and builds
- **Purpose**: Gate PRs - nothing enters without passing inspection

### Hades - The Judge

Once code passes Cerberus's inspection, it enters Hades's domain for internal testing and review. Not yet ready for public release, but under careful scrutiny in this preview/testing realm.

- **Triggers**: Push to main, weekly schedule
- **Jobs**: Preview builds, EAS builds, release management
- **Purpose**: Post-merge validation and deployment

### Hecate - The Crossroads

Depicted with three faces looking in three directions, Hecate presides over choices of paths. She observes file changes and routes them to the right destination: shell scripts, source code, tests, or config.

- **Triggers**: Called by Cerberus and Hades
- **Jobs**: Path filtering and change detection
- **Purpose**: Optimize CI by skipping unnecessary jobs

### Hephaestus - The Forge

The divine blacksmith who crafts weapons and tools for the gods. He receives orders (issues) and transforms raw material into finished work (PRs).

- **Triggers**: Issue labeled 'ready'
- **Jobs**: SSH to VPS, create worktree, launch Claude Code
- **Purpose**: Automated issue-to-PR pipeline via AI

### Moirai - The Fates

Clotho spins the thread of life, Lachesis measures it, Atropos cuts it. Together they weave the tapestry of destiny, knowing all connections between lives (issues).

- **Triggers**: Manual (workflow_dispatch)
- **Jobs**: Generate ticket dependency graph
- **Purpose**: Visualize issue relationships and dependencies

## Adding New Workflows

When creating a new workflow, choose a Greek deity whose mythological role matches the workflow's function. Add a comment block at the top explaining the connection, and include a Wikiwand link.
