#!/usr/bin/env bash
set -euo pipefail
# ADB-based regression test for blocking overlay service recovery.
# Verifies that the blocking overlay survives service kills and Doze mode.
#
# Prerequisites: device connected via ADB, accessibility enabled, active block session
# Usage: ./scripts/test-blocking-recovery.sh [PACKAGE_NAME]
# Default package: com.tiedsiren51

PACKAGE="${1:-com.tiedsiren51}"
PASS=0
FAIL=0

green() { printf '\033[32m%s\033[0m\n' "$1"; }
red()   { printf '\033[31m%s\033[0m\n' "$1"; }
info()  { printf '\033[36m%s\033[0m\n' "$1"; }

assert_service_running() {
    local service_name="$1"
    local timeout="${2:-30}"
    local elapsed=0

    while [ "$elapsed" -lt "$timeout" ]; do
        if adb shell dumpsys activity services "$PACKAGE" 2>/dev/null | grep -q "$service_name"; then
            return 0
        fi
        sleep 2
        elapsed=$((elapsed + 2))
    done
    return 1
}

# ---------- Test 1: ForegroundService kill & recovery ----------
test_foreground_service_recovery() {
    info "[Test 1] ForegroundService kill & recovery"

    if ! assert_service_running "ForegroundService" 5; then
        red "  SKIP: ForegroundService not running (start a block session first)"
        return 1
    fi
    green "  ForegroundService is running"

    info "  Killing app process..."
    adb shell am kill "$PACKAGE"
    sleep 2

    info "  Waiting for service restart (up to 30s)..."
    if assert_service_running "ForegroundService" 30; then
        green "  PASS: ForegroundService recovered after kill"
        PASS=$((PASS + 1))
    else
        red "  FAIL: ForegroundService did not recover within 30s"
        FAIL=$((FAIL + 1))
    fi
}

# ---------- Test 2: Verify watchdog heartbeat in logcat ----------
test_watchdog_heartbeat() {
    info "[Test 2] Watchdog heartbeat verification"

    adb logcat -c 2>/dev/null || true
    info "  Monitoring logcat for watchdog heartbeat (up to 6 minutes)..."

    if timeout 360 adb logcat -s "BlockingCallback:D" | grep -m 1 -q "Watchdog heartbeat"; then
        green "  PASS: Watchdog heartbeat detected"
        PASS=$((PASS + 1))
    else
        red "  FAIL: No watchdog heartbeat within 6 minutes"
        FAIL=$((FAIL + 1))
    fi
}

# ---------- Test 3: Accessibility service toggle off/on ----------
test_accessibility_toggle() {
    info "[Test 3] Accessibility service toggle recovery"
    info "  NOTE: This test requires manual toggling."
    info "  1. Go to Settings > Accessibility"
    info "  2. Disable the TiedSiren accessibility service"
    info "  3. Wait 3 seconds"
    info "  4. Re-enable it"
    info ""
    read -r -p "  Press Enter after re-enabling... "

    adb logcat -c 2>/dev/null || true
    info "  Checking for re-registration in logcat..."

    if timeout 30 adb logcat -s "BlockingCallback:D" | grep -m 1 -q "re-registering\|Re-registered"; then
        green "  PASS: Listener re-registered after accessibility toggle"
        PASS=$((PASS + 1))
    else
        red "  FAIL: No re-registration detected after toggle"
        FAIL=$((FAIL + 1))
    fi
}

# ---------- Test 4: Doze mode simulation ----------
test_doze_mode() {
    info "[Test 4] Doze mode simulation"

    if ! assert_service_running "ForegroundService" 5; then
        red "  SKIP: ForegroundService not running"
        return 1
    fi

    info "  Entering Doze mode..."
    adb shell dumpsys deviceidle force-idle 2>/dev/null || true
    sleep 5

    info "  Checking if service survived Doze..."
    if assert_service_running "ForegroundService" 10; then
        green "  PASS: ForegroundService survived Doze mode"
        PASS=$((PASS + 1))
    else
        red "  FAIL: ForegroundService killed by Doze mode"
        FAIL=$((FAIL + 1))
    fi

    info "  Exiting Doze mode..."
    adb shell dumpsys deviceidle unforce 2>/dev/null || true
    adb shell dumpsys deviceidle disable 2>/dev/null || true
}

# ---------- Run tests ----------
echo ""
info "=== Blocking Overlay Recovery Tests ==="
info "Package: $PACKAGE"
echo ""

test_foreground_service_recovery
echo ""
test_doze_mode
echo ""

# Summary
echo ""
info "=== Results ==="
green "Passed: $PASS"
if [ "$FAIL" -gt 0 ]; then
    red "Failed: $FAIL"
    exit 1
else
    info "Failed: 0"
    green "All automated tests passed!"
    echo ""
    info "Manual tests available:"
    info "  - test_watchdog_heartbeat (requires 6-min wait)"
    info "  - test_accessibility_toggle (requires manual steps)"
fi
