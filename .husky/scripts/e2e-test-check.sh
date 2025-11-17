#!/bin/sh
# Check if developer has verified e2e tests

exec < /dev/tty  # Redirect input to terminal

echo ""
echo "⚠️  Warning: E2E tests are not part of CI pipeline yet."
echo "👉 It's your responsibility to ensure e2e tests pass before final merge."
echo "🛑 Please run 'npm run test:e2e' to verify your changes."
read -p "❓ Have you manually verified that e2e tests pass? (y/n): " answer
echo ""

if [ "$answer" != "y" ]; then
    echo "🛑 Please run 'npm run test:e2e' to verify your changes."
    echo "   You can run the tests with: npm run test:e2e"
    exec <&- # Close terminal input
    exit 1
fi

exec <&- # Close terminal input