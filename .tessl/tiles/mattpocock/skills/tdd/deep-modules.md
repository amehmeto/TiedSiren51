# Deep Modules

From "A Philosophy of Software Design":

**Deep module** = small interface + lots of implementation

```
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
│                     │
└─────────────────────┘
```

**Shallow module** = large interface + little implementation (avoid)

```
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

When designing interfaces, ask:

- Can I reduce the number of methods?
- Can I simplify the parameters?
- Can I hide more complexity inside?

## Deep Modules in TDD

Deep modules emerge naturally from TDD when you follow the **absolute minimum** principle:

1. First test → simple constant return (shallow)
2. More tests → complexity grows inside, interface stays small (deepening)
3. Refactor → extract internals, keep public surface minimal

Don't prematurely create deep modules. Let the depth emerge from test pressure. If your interface grows too large, that's a signal to split — but only when tests force it.

## In This Project

Ports (`core/_ports_/`) are the public interface. They should be **deep**: few methods, domain-specific names, complex logic hidden in the adapter implementations (`infra/`). The test suite exercises behavior through the port interface — it doesn't care about adapter internals.
