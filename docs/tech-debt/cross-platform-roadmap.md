# Cross-Platform Adapter Roadmap

> Created: December 24, 2025
> Status: Planning
> Priority: 📋 **LOW** - Strategic planning for future expansion
> Effort: High (multi-year initiative)

## Visual Roadmap (Gross Estimate)

```
2025                          2026                              2027
Q1    Q2    Q3    Q4    Q1    Q2    Q3    Q4    Q1    Q2
├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤

ANDROID ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
        ▲         ▲
        │         └─ v1.0 Stable (6 months)
        └─ Current

MACOS             ░░░░████████████████░░░░░░░░░░░░░░░░░░░░░░░░
                      ▲              ▲
                      │              └─ v1.0 (5 months)
                      └─ Start after Android stable

CHROME EXT                    ░░████░░░░░░░░░░░░░░░░░░░░░░░░░░
                                 ▲  ▲
                                 │  └─ v1.0 (1.5 months)
                                 └─ Quick win during desktop dev

WINDOWS                           ░░░░████████████░░░░░░░░░░░░
                                      ▲          ▲
                                      │          └─ v1.0 (4 months)
                                      └─ Reuse Tauri patterns from macOS

LINUX                                         ░░░░████████░░░░
                                                  ▲      ▲
                                                  │      └─ v1.0 (3 months)
                                                  └─ After Windows

IOS                                                   ░░░░████████
                                                          ▲      ▲
                                                          │      └─ v1.0 (5 months)
                                                          └─ Last, set expectations

████ = Active development
░░░░ = Planning/Learning phase
```

### Time Estimates per Platform

| Platform | Effort | Duration | Key Challenges |
|----------|--------|----------|----------------|
| **Android** | ████████ High | 6 months | AccessibilityService, native modules, anti-bypass |
| **macOS** | ██████ High | 5 months | Learn Swift/Tauri, EndpointSecurity, code signing |
| **Chrome Ext** | ██ Low | 1.5 months | Simple APIs, MV3 limitations |
| **Windows** | █████ Medium-High | 4 months | WMI/WFP, service installation, admin rights |
| **Linux** | ████ Medium | 3 months | Fragmentation (X11/Wayland, distros) |
| **iOS** | ██████ High | 5 months | Severe limitations, workarounds, partner unlock |

### Total Timeline

```
Optimistic (1 dev, full-time):  ~24 months (2 years)
Realistic (1 dev, part-time):   ~36 months (3 years)
With 2 devs parallel:           ~15-18 months
```

### Milestone Summary

| Milestone | Target | Platforms | Market Coverage |
|-----------|--------|-----------|-----------------|
| **M1: Mobile First** | Q3 2025 | Android | 40% mobile |
| **M2: Desktop Beta** | Q2 2026 | + macOS, Chrome | + 10% desktop |
| **M3: Full Desktop** | Q4 2026 | + Windows | + 75% desktop |
| **M4: Complete** | Q2 2027 | + Linux, iOS | ~95% coverage |

### Revenue Unlock Points

```
Android v1.0  ───────────────────────────►  First paying users
                                            Target: $1k MRR

macOS + Chrome ──────────────────────────►  Cross-platform premium
                                            Target: $5k MRR

Windows ─────────────────────────────────►  Enterprise potential
                                            Target: $15k MRR

Full platform ───────────────────────────►  Market leader positioning
                                            Target: $50k MRR
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
| **macOS** | Swift + Rust | Tauri | Direct + App Store |
| **Windows** | Rust + C++ | Tauri | Direct + MS Store |
| **Linux** | Rust | Tauri | Flatpak/AppImage |
| **Web Ext** | TypeScript | Plasmo or WXT | Chrome/Firefox stores |

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

- [ ] Tauri vs Electron for desktop? (Tauri preferred for size/perf)
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
- [Tauri](https://tauri.app/) - Rust-based desktop framework
- [Apple Screen Time API](https://developer.apple.com/documentation/familycontrols)
- [Android AccessibilityService](https://developer.android.com/reference/android/accessibilityservice/AccessibilityService)
