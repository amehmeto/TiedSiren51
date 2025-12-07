#!/usr/bin/env bash
# Check if developer has verified e2e tests
# Set SKIP_E2E_CHECK=true to bypass this check in non-interactive environments

if [ "$SKIP_E2E_CHECK" = "true" ]; then
    echo "⚠️  Skipping e2e test check (SKIP_E2E_CHECK=true)"
    exit 0
fi

if [ "$SKIP_E2E_CHECK" = "1" ]; then
    echo "⏭️  Skipping e2e check (SKIP_E2E_CHECK=1)"
    exit 0
fi

exec < /dev/tty  # Redirect input to terminal

echo ""
echo "⚠️  Warning: E2E tests are not part of CI pipeline yet."
echo "👉 It's your responsibility to ensure e2e tests pass before final merge."
echo "🛑 Please run 'npm run test:e2e' to verify your changes."
read -rp "❓ Have you manually verified that e2e tests pass? (y/n): " answer
echo ""

if [ "$answer" != "y" ]; then
    echo "🛑 Please run 'npm run test:e2e' to verify your changes."
    echo "   You can run the tests with: npm run test:e2e"
    exec <&- # Close terminal input
    exit 1
fi

exec <&- # Close terminal input