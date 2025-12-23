#!/usr/bin/env bash
# Prepare base coverage for PR comparison
# Copies cached coverage to base-coverage.json, or creates empty baseline if not found

CACHED_COVERAGE="/tmp/coverage-summary.json"
OUTPUT_FILE="base-coverage.json"

if [ -f "$CACHED_COVERAGE" ]; then
  cp "$CACHED_COVERAGE" "$OUTPUT_FILE"
  echo "✅ Base coverage restored from cache"
else
  echo "⚠️ No cached coverage found, using empty baseline"
  echo '{"total":{"statements":{"pct":0},"functions":{"pct":0},"branches":{"pct":0},"lines":{"pct":0}}}' > "$OUTPUT_FILE"
fi
