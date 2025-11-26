# Functional Overview: Siren Blocking on Android

**Feature**: Display Blocking Overlay When Sirens Are Detected
**Date**: 2025-01-24
**Audience**: Product, Design, Non-Technical Stakeholders

## What is a "Siren"?

A **siren** is any distracting app that the user wants to avoid during focused work sessions (like social media, games, news apps).

Examples:
- Instagram
- TikTok
- Facebook
- Twitter/X
- YouTube

## What This Feature Does

When a user tries to open a siren app during a block session, TiedSiren **immediately shows a fullscreen blocking screen** that:

1. **Prevents access** to the distracting app
2. **Shows a message** explaining the app is blocked
3. **Provides a "Close" button** that sends the user to their phone's home screen

The user **cannot dismiss the blocking screen** and continue using the app - they must press "Close" which takes them away from the distracting app.

## User Journey

### Before: Without This Feature

```
User creates block session for Instagram
↓
User opens Instagram
↓
❌ Instagram opens normally (blocking doesn't work)
```

### After: With This Feature

```
User creates block session for Instagram
↓
User tries to open Instagram
↓
⚡ Fullscreen blocking screen appears instantly (<200ms)
↓
Screen shows: "This app is blocked"
              [Close Button]
↓
User clicks "Close"
↓
✅ User is taken to Android home screen (away from Instagram)
```

## Why This Matters

### Problem Without Blocking
- Users can still access distracting apps during focus sessions
- No enforcement mechanism for self-imposed limits
- Easy to give in to temptation

### Solution With Blocking
- **Physical barrier**: Can't access the app without seeing the reminder
- **Intentional friction**: Have to actively decide to end the session early
- **Escape path**: "Close" button prevents users from getting completely stuck

## Platform-Specific Behavior

### Android (What We're Building)
- Uses fullscreen Activity (native Android screen)
- "Close" button launches home screen Intent
- Works on Android 8.0+ (API 26+)

### iOS (Future)
- Might use ScreenTime API or similar mechanism
- Would follow iOS design patterns
- Different technical implementation, same user experience

### Web (Future)
- Could use browser extension or modal overlay
- Platform-specific approach needed

**Key Point**: The user experience is the same across platforms, but HOW we block is different on each platform.

## Comparison with Competitors

### AppBlock (Android)
- Shows fullscreen overlay: ✅ Same
- "Close" button goes to home: ✅ Same approach we're taking
- Cannot dismiss to return to app: ✅ Same

### Freedom
- Blocks at network level (different approach)
- Harder to bypass but more complex setup

### Forest
- Gamifies focus time instead of blocking
- Different philosophy - encouragement vs enforcement

## Success Criteria (Non-Technical)

### User Can Tell:
1. **App is blocked**: Clear message, no confusion
2. **How to exit**: "Close" button is obvious
3. **Cannot bypass**: Pressing back or switching apps doesn't work

### System Performs:
1. **Fast**: Blocking screen appears instantly (user shouldn't see the app underneath)
2. **Reliable**: Works 95%+ of the time across different Android phones
3. **Safe**: User always has escape path (never completely stuck)

## What This Feature Does NOT Do

❌ **Does NOT auto-dismiss** when block time expires
   - Why: Users don't stare at blocking screens - they'll close it and move on

❌ **Does NOT allow "temporary unlock"** or "5 more minutes" options (yet)
   - Scope: That's a future feature - this is pure blocking

❌ **Does NOT work on iOS or Web** (yet)
   - Scope: Android-first, other platforms later

## User Experience Details

### Visual Design
- **Fullscreen**: Covers entire screen, can't see app underneath
- **Simple**: Static text + one button (no complex UI)
- **Clear message**: "This app is blocked" (future: customizable messages)

### Interaction
- **Back button**: Does nothing (cannot dismiss)
- **Home button**: Works (user can leave the blocking screen and go elsewhere)
- **App switcher**: Blocking screen stays active
- **"Close" button**: Only way to dismiss → sends to home screen

### Timing
- **Appears**: Within 200 milliseconds of opening siren
- **Stays**: Until user clicks "Close"
- **Doesn't auto-expire**: Stays on screen even if block session ends

## Edge Cases & Safety

### What if user gets stuck?
- "Close" button always works
- Can force-quit the app from Android settings
- Can restart phone as last resort

### What if overlay doesn't appear?
- User can use the app (fail-safe behavior)
- Error is logged for debugging
- App doesn't crash

### What if user tries to uninstall TiedSiren?
- Out of scope for this feature
- Separate concern: app protection/device admin

## Accessibility

### Screen Readers
- "Close" button must have proper content description
- Blocking message must be readable by TalkBack

### Motor Impairments
- "Close" button large enough to tap easily
- No time-based actions required

### Visual Impairments
- High contrast text
- Large, clear fonts

## Privacy & Security

### Data Collection
- **Does NOT collect** which apps user tries to access
- **Does NOT send** blocking events to server
- **Does NOT track** user behavior

### Permissions
- Uses existing AccessibilityService permission (no new permissions)
- Overlay doesn't require SYSTEM_ALERT_WINDOW permission

## Technical Constraints (Simplified)

### Works On
- ✅ Android 8.0 through Android 14
- ✅ All major brands (Samsung, Google, OnePlus, Xiaomi)
- ✅ Physical devices

### Doesn't Work On
- ❌ Android emulators (AccessibilityService limitation)
- ❌ iOS devices (different feature needed)
- ❌ Web browsers (different feature needed)

## Release Strategy

### Phase 1: Basic Blocking (This Feature)
- Show fullscreen overlay
- "Close" button to home screen
- Static message

### Phase 2: Enhanced UX (Future)
- Custom messages per app
- Session end time countdown
- "Take a break" suggestions

### Phase 3: Advanced Options (Future)
- Temporary unlock (5 more minutes)
- Challenge questions before unblock
- Motivational quotes

## Questions & Answers

**Q: Can users bypass this?**
A: Not easily. They'd have to end the block session or force-quit TiedSiren from Android settings.

**Q: What if I need to access a blocked app urgently?**
A: End your block session from TiedSiren's interface, then you can access all apps.

**Q: Will this drain my battery?**
A: No - the overlay only appears when you try to open a blocked app. No background processing.

**Q: Does this work in split-screen mode?**
A: Blocking screen takes over the full screen, preventing split-screen usage of blocked apps.

**Q: Can I customize the blocking message?**
A: Not in Phase 1. Future enhancement will add custom messages.

---

**Summary**: This feature physically blocks access to distracting apps during focus sessions by showing a fullscreen blocking screen that cannot be dismissed without leaving the app. It's the core enforcement mechanism that makes TiedSiren effective.
