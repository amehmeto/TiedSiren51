#!/bin/bash
# Hook: PreToolUse for Edit tool
# Shows relevant ADRs based on the file being edited

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[[ -z "$FILE_PATH" ]] && exit 0

ADR_DIRS=()

# Test files → testing ADRs
if [[ "$FILE_PATH" =~ \.(test|spec)\.(ts|tsx)$ ]]; then
  ADR_DIRS+=("docs/adr/testing")
fi

# Core layer files → core ADRs
if [[ "$FILE_PATH" =~ ^core/ ]] || [[ "$FILE_PATH" =~ /core/ ]]; then
  ADR_DIRS+=("docs/adr/core")
fi

# Infra layer files → infrastructure ADRs
if [[ "$FILE_PATH" =~ ^infra/ ]] || [[ "$FILE_PATH" =~ /infra/ ]]; then
  ADR_DIRS+=("docs/adr/infrastructure")
fi

# UI layer files → ui ADRs
if [[ "$FILE_PATH" =~ ^ui/ ]] || [[ "$FILE_PATH" =~ /ui/ ]]; then
  ADR_DIRS+=("docs/adr/ui")
fi

# TypeScript files → conventions ADRs
if [[ "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  ADR_DIRS+=("docs/adr/conventions")
fi

# Exit if no relevant ADRs
[[ ${#ADR_DIRS[@]} -eq 0 ]] && exit 0

echo "=========================================="
echo "⚠️  REVIEW RELEVANT ADRs BEFORE EDITING"
echo "   File: $FILE_PATH"
echo "=========================================="
echo ""

show_adrs() {
  local dir="$1"
  local label="$2"

  [[ ! -d "$dir" ]] && return

  local has_files=false
  for adr in "$dir"/*.md; do
    [[ -f "$adr" ]] && has_files=true && break
  done

  [[ "$has_files" == "false" ]] && return

  echo "╔══════════════════════════════════════╗"
  echo "║ $label"
  echo "╚══════════════════════════════════════╝"
  echo ""

  for adr in "$dir"/*.md; do
    if [[ -f "$adr" ]]; then
      filename=$(basename "$adr")
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo "📄 $filename"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      cat "$adr"
      echo ""
    fi
  done
}

for dir in "${ADR_DIRS[@]}"; do
  case "$dir" in
    *testing*) show_adrs "$dir" "TESTING ADRs" ;;
    *core*) show_adrs "$dir" "CORE LAYER ADRs" ;;
    *infrastructure*) show_adrs "$dir" "INFRASTRUCTURE ADRs" ;;
    *ui*) show_adrs "$dir" "UI LAYER ADRs" ;;
    *conventions*) show_adrs "$dir" "CONVENTIONS ADRs" ;;
  esac
done

echo "=========================================="
echo "END OF RELEVANT ADRs"
echo "=========================================="
