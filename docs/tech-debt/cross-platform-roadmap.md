# Cross-Platform Adapter Roadmap

> Created: December 24, 2024
> Status: Planning
> Priority: 📋 **LOW** - Strategic planning for future expansion
> Effort: High (multi-year initiative)

## Visual Roadmap (Relative Sequencing)

```
Phase       1              2              3              4
            ├──────────────┼──────────────┼──────────────┤

ANDROID     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
            ▲            ▲
            │            └─ v1.0 Stable (baseline effort)
            └─ Current focus

MACOS                    ░░████████░░░░░░░░░░░░░░░░░░░░░░
                           ▲      ▲
                           │      └─ v1.0 (~0.5x Android effort)
                           └─ Start after Android stable

CHROME EXT                   ░░████░░░░░░░░░░░░░░░░░░░░░░
                                ▲  ▲
                                │  └─ v1.0 (~0.25x Android effort)
                                └─ Quick win during macOS dev

WINDOWS                            ░░████████░░░░░░░░░░░░
                                     ▲      ▲
                                     │      └─ v1.0 (~0.5x) - Reuse Electron
                                     └─ After macOS

LINUX                                      ░░██████░░░░░░
                                             ▲    ▲
                                             │    └─ v1.0 (~0.4x)
                                             └─ After Windows

IOS                                               ░░░░████████
                                                      ▲      ▲
                                                      │      └─ v1.0 (~0.8x)
                                                      └─ Last, hardest

████ = Active development
░░░░ = Planning/Learning phase
```

### Relative Effort per Platform

| Platform | Effort | Relative Size | Key Challenges |
|----------|--------|---------------|----------------|
| **Android** | ████████ High | 1.0x (baseline) | AccessibilityService, native modules, anti-bypass |
| **macOS** | ████ Medium | 0.5x | Electron known, native addons for EndpointSecurity |
| **Chrome Ext** | ██ Low | 0.25x | Simple APIs, MV3 limitations |
| **Windows** | ████ Medium | 0.5x | Electron known, native addons for WMI/WFP |
| **Linux** | ███ Medium | 0.4x | Electron known, less anti-bypass needed |
| **iOS** | ██████ High | 0.8x | Severe limitations, workarounds, partner unlock |

### Parallelization Impact

```
Sequential (1 dev):     ~3x Android effort
Parallel (2 devs):      ~2x Android effort
Parallel (3+ devs):     ~1.5x Android effort ← See below
```

### Parallelized Roadmap (3+ devs, sequential start)

```
Phase       1              2              3
            ├──────────────┼──────────────┤

ANDROID     ██████████░░░░░░░░░░░░░░░░░░░░░░  Dev 1 (you)
                      │
                      ▼ Core stable
MACOS                 │ ████████░░░░░░░░░░░░░░░░░░  Dev 2
WINDOWS               │ ████████░░░░░░░░░░░░░░░░░░  Dev 3
LINUX                 │ ██████░░░░░░░░░░░░░░░░░░░░  Dev 2/3
CHROME EXT            │ ████░░░░░░░░░░░░░░░░░░░░░░  Dev 1
IOS                   │     ████████████░░░░░░░░░░  Dev 4

Result: ~2x Android effort total (parallelized)
```

### MAXIMUM Parallelization (5+ devs, start NOW)

**Key insight**: Ports are already designed (ADRs done). Platform work can start with FAKE implementations, then swap in real backends when ready.

```
Phase       0         1              2              3
            ├─────────┼──────────────┼──────────────┤

PORTS       ████░░░░░░░░░░░░░░░░░░░░░░░░  Initial design (you)
            ▲  │
            │  └─ All interfaces defined, fake impls ready
            └─ NOW
               │
               ▼ All platforms start simultaneously
               ├─────────────────────────────────────
ANDROID        │ ████████████░░░░░░░░░░░░░░░░░  Dev 1 (you)
               │ ▲          ▲
               │ │          └─ v1.0 (baseline)
               │ └─ Real implementation
               │
MACOS          │ ░░██████████░░░░░░░░░░░░░░░░  Dev 2
               │   ▲   ▲    ▲
               │   │   │    └─ v1.0 (~0.7x baseline)
               │   │   └─ Connect real backend
               │   └─ Electron shell + fake ports
               │
WINDOWS        │ ░░██████████░░░░░░░░░░░░░░░░  Dev 3
               │   ▲   ▲    ▲
               │   │   │    └─ v1.0 (~0.7x baseline)
               │   │   └─ Connect real backend
               │   └─ Electron shell + fake ports
               │
LINUX          │ ░░████████░░░░░░░░░░░░░░░░░░  Dev 2 or 3
               │   ▲      ▲
               │   │      └─ v1.0 (~0.5x baseline)
               │   └─ Simpler, less native code
               │
CHROME EXT     │ ██████░░░░░░░░░░░░░░░░░░░░░░  Dev 4
               │ ▲    ▲
               │ │    └─ v1.0 (~0.3x baseline)
               │ └─ Independent, no native deps
               │
IOS            │ ░░░░██████████░░░░░░░░░░░░░░  Dev 5 (iOS specialist)
               │     ▲        ▲
               │     │        └─ v1.0 (~0.8x baseline)
               │     └─ Screen Time API R&D starts immediately

Result: Full platform coverage in ~1x Android effort (with 5 devs)
```

### How "Fake Ports" Parallelization Works

```typescript
// Phase 1: Desktop dev uses fake SirenTier
class FakeSirenTier implements SirenTier {
  async setBlockingSchedule(schedule: BlockingSchedule) {
    console.log('Would block:', schedule) // Just logs
    this.fakeBlockedApps = schedule.windows.flatMap(w => w.sirens.apps)
  }
}

// Phase 2: Swap to real implementation when native addons ready
class MacOSSirenTier implements SirenTier {
  async setBlockingSchedule(schedule: BlockingSchedule) {
    await this.endpointSecurity.blockProcesses(schedule)  // Real blocking
  }
}
```

**What each dev can build with fake ports:**
- Full UI/UX
- Redux integration
- Firestore sync
- Notification system
- Settings/preferences
- Onboarding flow
- 80% of the app!

**What needs real ports (last 20%):**
- Actual blocking
- Actual detection
- Anti-bypass measures

### Aggressive Team Composition

**Option D: Full parallel team (fastest, highest cost)**
```
Dev 1 (you):     Android real implementation + architecture decisions
Dev 2:           macOS Electron + EndpointSecurity native addon
Dev 3:           Windows Electron + WFP native addon
Dev 4:           Chrome Extension (can also help with Linux)
Dev 5:           iOS Screen Time + VPN specialist
```

**Phases with 5 devs:**
```
Phase 1:    Ports finalized, all devs start with fakes
Phase 2:    UI/sync working on all platforms (fake blocking)
Phase 3:    Real native blocking integrated
Phase 4:    All platforms v1.0 🎉

Result: ~3x faster than sequential development
```

### Risk Mitigation for Aggressive Parallelization

| Risk | Mitigation |
|------|------------|
| Port interface changes mid-development | Freeze port interfaces in Week 2, version them |
| Devs blocked waiting for your decisions | Daily 15-min sync, async decisions in Slack |
| Merge conflicts in shared code | Strict module boundaries, platform-specific folders |
| Quality suffers from speed | Automated tests required before merge |
| One platform falls behind | Cross-train devs, anyone can help anywhere |

### Parallelization Constraints

| Constraint | Why | Mitigation |
|------------|-----|------------|
| **Core must stabilize first** | Ports/interfaces need to be solid before platform work | Wait for Android v1.0 |
| **Shared Electron knowledge** | Desktop devs need to share native addon patterns | Daily syncs, shared repo |
| **iOS specialist needed** | Screen Time API + Swift is specialized | Hire iOS contractor |
| **Code review bottleneck** | You reviewing 3-4 PRs/day | Define standards upfront, trust devs |
| **Sync protocol must be defined** | All platforms sync via Firestore | Design sync schema before parallel work |

### Team Composition Options

**Option A: Hire contractors (moderate cost)**
```
You:           Android → Chrome Extension → Code review
Contractor 1:  macOS → Linux (Electron expert)
Contractor 2:  Windows (Electron + C++ for WFP)
Contractor 3:  iOS (Swift specialist, short-term contract)
```

**Option B: Outsource desktop to agency (higher cost)**
```
You:           Android → Chrome → iOS oversight
Agency:        macOS + Windows + Linux (packaged deal)
```

**Option C: Open source core, community ports (no cost, unpredictable)**
```
You:           Android + Core architecture
Community:     Desktop ports (community-driven timeline)
```

### Critical Path

```
                           ┌─────────────────┐
                           │  Android v1.0   │
                           │   (baseline)    │
                           └────────┬────────┘
                                    │
            ┌───────────────────────┼───────────────────────┐
            ▼                       ▼                       ▼
    ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
    │    Desktop    │       │    Chrome     │       │   iOS R&D     │
    │  (parallel)   │       │  Extension    │       │  (parallel)   │
    │   ~0.5x each  │       │    ~0.25x     │       │    ~0.8x      │
    └───────┬───────┘       └───────┬───────┘       └───────┬───────┘
            │                       │                       │
            └───────────────────────┼───────────────────────┘
                                    ▼
                           ┌─────────────────┐
                           │  Full Platform  │
                           │   Coverage      │
                           └─────────────────┘

Critical path: Android → iOS (longest sequential chain)
Desktop is NOT on critical path (can finish faster than iOS)
```

### Milestone Summary

| Milestone | Sequence | Platforms | Market Coverage |
|-----------|----------|-----------|-----------------|
| **M1: Mobile First** | First | Android | 40% mobile |
| **M2: Desktop Beta** | After M1 | + macOS, Chrome | + 10% desktop |
| **M3: Full Desktop** | After M2 | + Windows | + 75% desktop |
| **M4: Complete** | After M3 | + Linux, iOS | ~95% coverage |

### Revenue Unlock Points

```
Android v1.0  ───────────────────────────►  First paying users
                                            Unlock: Mobile market

macOS + Chrome ──────────────────────────►  Cross-platform premium
                                            Unlock: Power users

Windows ─────────────────────────────────►  Enterprise potential
                                            Unlock: B2B market

Full platform ───────────────────────────►  Market leader positioning
                                            Unlock: Full TAM
```

## Context

TiedSiren51 is currently Android-only. The long-term vision is a cross-platform app blocker with device sync across Android, iOS, macOS, Windows, Linux, and Web (browser extension).

Each platform requires platform-specific adapters for:

- **SirenTier**: Blocking mechanism (apps, websites, keywords)
- **SirenLookout**: Detection mechanism
- **ForegroundService**: Background execution
- **BlockingScheduler**: Precise timing
- **Notifications**: User alerts
- **InstalledApps**: App discovery

## Competitive Landscape

| Competitor | Platforms | Sync | Strictness | Weakness |
|------------|-----------|------|------------|----------|
| [Freedom](https://freedom.to/) | Android, iOS, Mac, Win, Chrome | Yes | Medium | VPN-based, easily bypassed |
| [Cold Turkey](https://getcoldturkey.com/) | Mac, Windows only | No | High | No mobile, no sync |
| [AppBlock](https://appblock.app/) | Android, iOS, Chrome | Yes | Medium | No desktop |

**Gap in market**: No solution offers Cold Turkey-level strictness with Freedom's cross-platform reach and proper sync.

## Platform Priority Order

| Priority | Platform | Rationale | Effort |
|----------|----------|-----------|--------|
| 1 | **Android** | Current focus, highest blocking effectiveness | Done |
| 2 | **macOS** | Test desktop patterns, dev audience, similar to iOS | High |
| 3 | **Chrome Extension** | Quick win, supplements desktop, low effort | Low |
| 4 | **Windows** | Largest desktop market share | High |
| 5 | **Linux** | Niche but loyal tech users | Medium |
| 6 | **iOS** | Last due to severe limitations | High |

## Platform-Specific Adapter Matrix

### SirenTier (Blocking)

| Platform | Apps | Websites | Keywords | Strictness |
|----------|------|----------|----------|------------|
| **Android** | AccessibilityService + Overlay | Local VPN or DNS | Accessibility text scan | High |
| **iOS** | Screen Time API (FamilyControls) | NEPacketTunnelProvider (local VPN) | Not possible | Low |
| **macOS** | EndpointSecurity + process kill | Network Extension + /etc/hosts | Accessibility API | Medium |
| **Windows** | WMI + Process termination + WFP | hosts file + WFP | UI Automation API | High |
| **Linux** | cgroups freezer + SIGSTOP | nftables + /etc/hosts | eBPF + X11/Wayland | Medium |
| **Web Ext** | N/A | webRequest/declarativeNetRequest | content scripts | Low |

### SirenLookout (Detection)

| Platform | Apps | Websites | Real-time? |
|----------|------|----------|------------|
| **Android** | AccessibilityService | VPN packet inspection | Yes |
| **iOS** | DeviceActivityMonitor | VPN packet inspection | No (delayed) |
| **macOS** | NSWorkspace notifications | Network Extension | Yes |
| **Windows** | WMI/ETW events | WFP callouts | Yes |
| **Linux** | audit/eBPF on execve() | nftables logging | Yes |
| **Web Ext** | N/A | webNavigation API | Yes |

### Background Services

| Platform | Approach | Survives Reboot? | Survives Kill? |
|----------|----------|------------------|----------------|
| **Android** | ForegroundService + BOOT_COMPLETED | Yes | Yes |
| **iOS** | BGTaskScheduler + Silent push | Limited | No |
| **macOS** | LaunchAgent/LaunchDaemon | Yes | Yes |
| **Windows** | Windows Service | Yes | Yes |
| **Linux** | systemd user service | Yes | Yes |
| **Web Ext** | Service Worker (MV3) | Yes | Suspended |

### Blocking Scheduler

| Platform | Approach | Precision |
|----------|----------|-----------|
| **Android** | AlarmManager.setExactAndAllowWhileIdle | ~1 sec |
| **iOS** | UNNotificationTrigger + BGTaskScheduler | ~15 min (unreliable) |
| **macOS** | launchd StartCalendarInterval | ~1 min |
| **Windows** | Task Scheduler API | ~1 sec |
| **Linux** | systemd timer (OnCalendar) | ~1 sec |
| **Web Ext** | chrome.alarms API | ~1 min |

### Anti-Bypass Measures

| Platform | Prevent Uninstall | Block Settings | Partner Unlock |
|----------|-------------------|----------------|----------------|
| **Android** | Device Admin API | Accessibility | Firebase |
| **iOS** | Not possible | Not possible | Firebase (key differentiator) |
| **macOS** | LaunchDaemon + hide | Block System Prefs | Firebase |
| **Windows** | Registry + service | Block Task Manager | Firebase |
| **Linux** | Package hold + immutable | PolicyKit rules | Firebase |
| **Web Ext** | Not possible | Not possible | Firebase |

## Tech Stack by Platform

| Platform | Language | Framework | Distribution |
|----------|----------|-----------|--------------|
| **Android** | Kotlin | Expo Module + React Native | Play Store |
| **iOS** | Swift | Expo Module + React Native | App Store |
| **macOS** | TypeScript + Swift | Electron + native addons | Direct + App Store |
| **Windows** | TypeScript + C++ | Electron + native addons | Direct + MS Store |
| **Linux** | TypeScript | Electron + native addons | Flatpak/AppImage |
| **Web Ext** | TypeScript | Plasmo or WXT | Chrome/Firefox stores |

### Desktop Framework Decision

**Decision: Electron** (existing experience, faster time-to-market)

| Factor | Electron | Tauri |
|--------|----------|-------|
| Learning curve | ✅ Already known | ❌ New (Rust) |
| Bundle size | ❌ ~150MB | ✅ ~10MB |
| Memory usage | ❌ Higher | ✅ Lower |
| Native addons | ✅ node-ffi, N-API | ⚠️ Rust FFI |
| React reuse | ✅ Same codebase | ✅ Same codebase |
| Time to market | ✅ Faster | ❌ Slower |

**Rationale**: While Tauri offers better performance characteristics, Electron's familiarity and mature ecosystem for native addons outweigh the bundle size trade-off. Anti-bypass features (block Task Manager, etc.) require native addons regardless of framework choice.

## iOS Strategy (Hardest Platform)

iOS has severe technical limitations. Compensate with **social accountability**:

```
Layer 1: Screen Time API (FamilyControls)
         - Official API, blocks app launches
         - Weakness: User can disable

Layer 2: Local VPN (NEPacketTunnelProvider)
         - Blocks website connections
         - Weakness: Only one VPN at a time

Layer 3: Partner Accountability (Differentiator)
         - Unlock requires partner email approval
         - 24-hour cooldown after denial
         - Social pressure > technical restriction
```

**Key insight**: When you can't win technically (iOS), win socially. AppBlock's partner approval is unique - implement and improve it.

## Shared Infrastructure

These components are platform-agnostic and shared:

- **Firebase Auth**: User authentication (all platforms)
- **Firestore**: Device sync and schedule storage
- **Redux state shape**: Same domain model everywhere
- **Selector logic**: selectBlockingSchedule works on any platform
- **Partner unlock logic**: Firebase Functions for approval flow

## Trigger Points

When to start each platform:

| Platform | Trigger |
|----------|---------|
| macOS | After Android v1.0 stable release |
| Chrome Extension | When desktop development starts |
| Windows | After macOS patterns validated |
| Linux | When requested by >100 users |
| iOS | After all other platforms, with clear limitation messaging |

## Implementation Approach

For each new platform:

1. **Create platform adapter module** (e.g., `infra/siren-tier/macos.siren-tier.ts`)
2. **Implement core ports** using platform-specific APIs
3. **Reuse business logic** (selectors, listeners, Redux slices)
4. **Add platform to device sync** in Firestore schema
5. **Test cross-device scenarios** (block on phone, syncs to desktop)

## Open Questions

- [ ] Single codebase or separate repos per platform?
- [ ] Pricing model for cross-platform? (per-device vs unlimited)
- [ ] How to handle platform-specific features in UI?

## Related Files

- `docs/adr/infrastructure/siren-tier-orchestrator.md` - Orchestrator pattern
- `docs/adr/infrastructure/native-blocking-scheduler.md` - Scheduling approach
- `core/_ports_/siren.tier.ts` - Platform-agnostic port definition
- `core/_ports_/siren.lookout.ts` - Detection port definition

## References

- [Freedom.to](https://freedom.to/) - Cross-platform competitor
- [Cold Turkey](https://getcoldturkey.com/) - Strictest desktop blocker
- [AppBlock](https://appblock.app/) - Mobile-focused competitor
- [Electron](https://www.electronjs.org/) - Desktop framework (chosen)
- [Apple Screen Time API](https://developer.apple.com/documentation/familycontrols)
- [Android AccessibilityService](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService)
- [Windows WFP](https://docs.microsoft.com/en-us/windows/win32/fwp/windows-filtering-platform-start-page) - Windows Filtering Platform
- [macOS EndpointSecurity](https://developer.apple.com/documentation/endpointsecurity) - System extension for monitoring
