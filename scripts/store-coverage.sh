#!/usr/bin/env bash
# Store coverage summary to a specified output file

OUTPUT_FILE=$1

if [ -f coverage/coverage-summary.json ]; then
  cp coverage/coverage-summary.json "$OUTPUT_FILE"
else
  echo '{"total":{"statements":{"pct":0},"functions":{"pct":0},"branches":{"pct":0},"lines":{"pct":0}}}' > "$OUTPUT_FILE"
fi

echo "Coverage stored to $OUTPUT_FILE"
