#!/usr/bin/env bash
# sync-project-data.sh — Fetch all project data, parse dependencies, output Kanban board.
# Replaces Phases 1-3 of /sync-project with a single permission-free call.
#
# Usage:
#   ./scripts/sync-project-data.sh           # Full output (Kanban + mismatches + metrics)
#   ./scripts/sync-project-data.sh --json    # Raw JSON (for further processing)
#
# Output goes to stdout (markdown). Progress goes to stderr.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

export SYNC_TMPDIR
SYNC_TMPDIR=$(mktemp -d)
trap 'rm -rf "$SYNC_TMPDIR"' EXIT

JSON_MODE=false
[[ "${1:-}" == "--json" ]] && JSON_MODE=true

# ============================================================================
# Phase 1: Parallel data fetching
# ============================================================================

echo "⏳ Fetching data from GitHub..." >&2

gh issue list --limit 100 --state all \
  --json number,title,body,labels,state,closedAt \
  > "$SYNC_TMPDIR/issues.json" 2>/dev/null &

gh pr list --limit 30 --state all \
  --json number,title,state,mergedAt,headRefName \
  > "$SYNC_TMPDIR/prs.json" 2>/dev/null &

"$SCRIPT_DIR/fetch-project-board.sh" > "$SYNC_TMPDIR/board.json" 2>/dev/null &

# Cross-repo fetches with fallback
for entry in \
  "amehmeto/tied-siren-blocking-overlay:overlay" \
  "amehmeto/expo-foreground-service:fgs" \
  "amehmeto/expo-accessibility-service:eas"; do
  repo="${entry%%:*}"
  tag="${entry##*:}"
  (gh issue list --repo "$repo" --state all \
    --json number,title,body,state --limit 50 \
    > "$SYNC_TMPDIR/${tag}.json" 2>/dev/null \
    || echo "[]" > "$SYNC_TMPDIR/${tag}.json") &
done

wait
echo "✅ Data fetched" >&2

# ============================================================================
# Phase 2-3: Process with Python
# ============================================================================

STDERR_FILE="$SYNC_TMPDIR/stderr.log"
python3 - "$SYNC_TMPDIR" "$JSON_MODE" 2> >(tee "$STDERR_FILE" >&2) << 'PYEOF'
import json, re, sys, os
from datetime import datetime, timedelta

tmpdir = sys.argv[1]
json_mode = sys.argv[2] == "true"

# ---------------------------------------------------------------------------
# Load data
# ---------------------------------------------------------------------------

def load_json(path, default=None):
    try:
        with open(path) as f:
            return json.load(f)
    except Exception:
        return default if default is not None else []

main_issues = load_json(f"{tmpdir}/issues.json", [])
prs = load_json(f"{tmpdir}/prs.json", [])
board_raw = load_json(f"{tmpdir}/board.json", {"items": []})

cross_repo_files = {
    "tied-siren-blocking-overlay": "overlay",
    "expo-foreground-service": "fgs",
    "expo-accessibility-service": "eas",
}

# Tag repos
for issue in main_issues:
    issue["repo"] = "TiedSiren51"

all_issues = list(main_issues)
for repo_name, file_tag in cross_repo_files.items():
    issues = load_json(f"{tmpdir}/{file_tag}.json", [])
    for issue in issues:
        issue["repo"] = repo_name
    all_issues.extend(issues)

print(f"📊 Loaded {len(main_issues)} main + {len(all_issues) - len(main_issues)} cross-repo issues", file=sys.stderr)

# ---------------------------------------------------------------------------
# Build state lookup  (repo#number -> state, and plain number for main repo)
# ---------------------------------------------------------------------------

issue_state = {}
issue_labels = {}
for issue in all_issues:
    key = f"{issue['repo']}#{issue['number']}"
    issue_state[key] = issue["state"]
    issue_labels[key] = [l.get("name", "") for l in issue.get("labels", [])]
    if issue["repo"] == "TiedSiren51":
        issue_state[str(issue["number"])] = issue["state"]

# ---------------------------------------------------------------------------
# Parse dependencies from issue body
# ---------------------------------------------------------------------------

def parse_deps(body):
    if not body:
        return [], []

    depends_on = []
    blocks = []

    # YAML block
    yaml_match = re.search(r"```yaml\s*\n([\s\S]*?)```", body)
    if yaml_match:
        yaml_text = yaml_match.group(1)
        dep_m = re.search(r"depends_on:\s*\[([^\]]*)\]", yaml_text)
        if dep_m:
            depends_on.extend(
                d.strip().lstrip("#") for d in dep_m.group(1).split(",") if d.strip()
            )
        blk_m = re.search(r"blocks:\s*\[([^\]]*)\]", yaml_text)
        if blk_m:
            blocks.extend(
                b.strip().lstrip("#") for b in blk_m.group(1).split(",") if b.strip()
            )

    # Inline: "Depends on #123", "Blocked by #123, #124", "After #123", "Requires #123"
    for pat in [
        r"[Dd]epends?\s+on\s+#(\d+)",
        r"[Bb]locked\s+by\s+#(\d+)",
        r"[Aa]fter\s+#(\d+)",
        r"[Rr]equires?\s+#(\d+)",
    ]:
        depends_on.extend(m.group(1) for m in re.finditer(pat, body))

    # Inline blocks: "Blocks #123" or "**Blocks**: #168"
    for m in re.finditer(r"[Bb]locks[:\s*]+#(\d+)", body):
        blocks.append(m.group(1))

    return list(set(depends_on)), list(set(blocks))

# ---------------------------------------------------------------------------
# Map open PRs to issue numbers (via branch name pattern TS<number>)
# ---------------------------------------------------------------------------

open_prs = [pr for pr in prs if pr.get("state") == "OPEN"]
pr_by_issue = {}
for pr in open_prs:
    branch = pr.get("headRefName", "")
    m = re.search(r"TS(\d+)", branch)
    if m:
        pr_by_issue[m.group(1)] = pr

# ---------------------------------------------------------------------------
# Compute statuses for OPEN issues
# ---------------------------------------------------------------------------

in_progress = []
ready = []
blocked = []
recently_done = []

cutoff = datetime.now(tz=None) - timedelta(days=14)

for issue in main_issues:
    if issue["state"] == "CLOSED":
        closed_at_str = issue.get("closedAt", "")
        if closed_at_str:
            try:
                closed_at = datetime.fromisoformat(closed_at_str.replace("Z", "+00:00"))
                if closed_at.replace(tzinfo=None) > cutoff:
                    recently_done.append({
                        "number": issue["number"],
                        "title": issue["title"],
                        "closed": closed_at.strftime("%Y-%m-%d"),
                    })
            except ValueError:
                pass
        continue

    num = str(issue["number"])
    title = issue["title"]
    labels = [l.get("name", "") for l in issue.get("labels", [])]
    depends_on, blocks_list = parse_deps(issue.get("body", ""))

    # Check for open PR
    has_pr = num in pr_by_issue

    if has_pr:
        in_progress.append({
            "number": issue["number"],
            "title": title,
            "pr": pr_by_issue[num]["number"],
        })
        continue

    # Check if blocked (any dependency still OPEN)
    open_deps = []
    for dep in depends_on:
        dep_state = issue_state.get(dep, "UNKNOWN")
        if dep_state in ("OPEN", "UNKNOWN"):
            open_deps.append(f"#{dep}")

    if open_deps:
        blocked.append({
            "number": issue["number"],
            "title": title,
            "blocked_by": open_deps,
        })
    else:
        ready.append({
            "number": issue["number"],
            "title": title,
            "labels": labels,
        })

recently_done.sort(key=lambda x: x["closed"], reverse=True)

# ---------------------------------------------------------------------------
# Parse project board items
# ---------------------------------------------------------------------------

board_items = board_raw.get("items", [])
board_status_by_issue = {}
board_item_id_by_issue = {}
for item in board_items:
    content = item.get("content", {})
    num = content.get("number")
    repo = content.get("repository", "")
    status = item.get("status", "")
    item_id = item.get("id", "")
    if num and "TiedSiren51" in repo:
        board_status_by_issue[num] = status
        board_item_id_by_issue[num] = item_id

# ---------------------------------------------------------------------------
# Detect board mismatches
# ---------------------------------------------------------------------------

mismatches = []
board_updates = []

# Issues that are CLOSED but board says Todo/In Progress
for issue in main_issues:
    num = issue["number"]
    board_status = board_status_by_issue.get(num)
    if not board_status:
        continue

    if issue["state"] == "CLOSED" and board_status in ("Todo", "In Progress"):
        mismatches.append(f"#{num} — board says **{board_status}** but issue is **Closed**. Move to Done.")
        board_updates.append({"action": "move_done", "number": num, "item_id": board_item_id_by_issue.get(num, "")})

# Issues in-progress but board says Todo
for item in in_progress:
    board_status = board_status_by_issue.get(item["number"])
    if board_status == "Todo":
        mismatches.append(f"#{item['number']} — board says **Todo** but has open PR #{item['pr']}. Move to In Progress.")
        board_updates.append({"action": "move_in_progress", "number": item["number"], "item_id": board_item_id_by_issue.get(item["number"], "")})

# Open issues not on the board
for item in ready + blocked:
    if item["number"] not in board_status_by_issue:
        mismatches.append(f"#{item['number']} — not on project board. Add as Todo.")
        board_updates.append({"action": "add_todo", "number": item["number"]})

# ---------------------------------------------------------------------------
# JSON mode: output raw data
# ---------------------------------------------------------------------------

if json_mode:
    output = {
        "in_progress": in_progress,
        "ready": ready,
        "blocked": blocked,
        "recently_done": recently_done[:10],
        "mismatches": mismatches,
        "board_updates": board_updates,
        "stats": {
            "total_issues": len(main_issues),
            "open": sum(1 for i in main_issues if i["state"] == "OPEN"),
            "closed": sum(1 for i in main_issues if i["state"] == "CLOSED"),
            "in_progress": len(in_progress),
            "ready": len(ready),
            "blocked": len(blocked),
            "board_items": len(board_items),
        },
    }
    print(json.dumps(output, indent=2))
    sys.exit(0)

# ---------------------------------------------------------------------------
# Markdown output
# ---------------------------------------------------------------------------

lines = []

lines.append("# Kanban Board")
lines.append("")

# In Progress
lines.append("## 🔵 In Progress")
if in_progress:
    lines.append("| # | Title | PR |")
    lines.append("|---|-------|----|")
    for item in sorted(in_progress, key=lambda x: x["number"]):
        lines.append(f"| #{item['number']} | {item['title']} | #{item['pr']} |")
else:
    lines.append("*None*")
lines.append("")

# Ready to Start
lines.append("## 🟢 Ready to Start")
if ready:
    lines.append("| # | Title | Labels |")
    lines.append("|---|-------|--------|")
    for item in sorted(ready, key=lambda x: x["number"]):
        labels_str = ", ".join(item.get("labels", [])) or "—"
        lines.append(f"| #{item['number']} | {item['title']} | {labels_str} |")
else:
    lines.append("*None*")
lines.append("")

# Blocked
lines.append("## 🟡 Blocked")
if blocked:
    lines.append("| # | Title | Blocked By |")
    lines.append("|---|-------|------------|")
    for item in sorted(blocked, key=lambda x: x["number"]):
        deps = ", ".join(item["blocked_by"])
        lines.append(f"| #{item['number']} | {item['title']} | {deps} |")
else:
    lines.append("*None*")
lines.append("")

# Recently Done
lines.append("## ✅ Recently Done (14 days)")
if recently_done:
    lines.append("| # | Title | Closed |")
    lines.append("|---|-------|--------|")
    for item in recently_done[:10]:
        lines.append(f"| #{item['number']} | {item['title']} | {item['closed']} |")
else:
    lines.append("*None*")
lines.append("")

# Board Mismatches
if mismatches:
    lines.append("---")
    lines.append("")
    lines.append("## ⚠️ Board Mismatches")
    for m in mismatches:
        lines.append(f"- {m}")
    lines.append("")

# Health metrics
total = len(main_issues)
open_count = sum(1 for i in main_issues if i["state"] == "OPEN")
closed_count = total - open_count

lines.append("---")
lines.append("")
lines.append("## 📈 Health Metrics")
lines.append("| Metric | Value |")
lines.append("|--------|-------|")
lines.append(f"| Total Issues | {total} |")
lines.append(f"| Open | {open_count} |")
lines.append(f"| Closed | {closed_count} |")
lines.append(f"| In Progress | {len(in_progress)} |")
lines.append(f"| Ready to Start | {len(ready)} |")
lines.append(f"| Blocked | {len(blocked)} |")
lines.append(f"| Board Items | {len(board_items)} |")

# ---------------------------------------------------------------------------
# Orphan ticket detection (open non-epic/non-initiative without parent epic)
# ---------------------------------------------------------------------------

epic_labels = {"epic", "initiative"}
epics = [
    i for i in main_issues
    if i["state"] == "OPEN"
    and any(l.get("name") in epic_labels for l in i.get("labels", []))
]

# Build epic keyword map
epic_keywords = {}
stop_words = {"the", "a", "an", "on", "in", "of", "and", "for", "to", "with", "is", "at"}
for epic in epics:
    title = epic["title"]
    # Remove common prefixes
    clean = re.sub(r"^\[?(Epic|Initiative)\]?\s*:?\s*", "", title, flags=re.IGNORECASE)
    words = set(w.lower() for w in re.findall(r"[a-zA-Z]+", clean) if len(w) > 2)
    words -= stop_words
    # Add domain synonyms
    expanded = set(words)
    if "auth" in words or "authentication" in words or "authentification" in words:
        expanded.update(["auth", "authentication", "login", "password", "sign"])
    if "blocking" in words or "block" in words:
        expanded.update(["blocking", "block", "siren", "overlay"])
    if "strict" in words or "mode" in words:
        expanded.update(["strict", "mode", "lock"])
    if "design" in words or "polish" in words:
        expanded.update(["design", "polish", "ui", "style", "theme"])
    if "schedule" in words or "recurring" in words:
        expanded.update(["schedule", "recurring", "recurrence", "weekly", "daily"])
    if "android" in words:
        expanded.add("android")
    if "ios" in words:
        expanded.add("ios")
    if "website" in words or "websites" in words:
        expanded.update(["website", "websites", "web", "domain", "url"])
    if "keyword" in words or "keywords" in words:
        expanded.update(["keyword", "keywords"])
    epic_keywords[epic["number"]] = {
        "title": epic["title"],
        "url": f"https://github.com/amehmeto/TiedSiren51/issues/{epic['number']}",
        "keywords": expanded,
    }

# Detect orphans (across all repos, including closed issues)
orphans = []
for issue in all_issues:
    labels = [l.get("name", "") for l in issue.get("labels", [])]
    if "epic" in labels or "initiative" in labels:
        continue
    body = issue.get("body", "") or ""
    if re.search(r"🏔️\s*Epic\s*\|", body):
        continue
    orphans.append(issue)

# Infer a label for orphans that don't match any epic
def infer_label(issue):
    title = issue["title"].lower()
    labels = [l.get("name", "") for l in issue.get("labels", [])]
    # Return existing non-generic label if present
    for l in labels:
        if l and l not in ("enhancement", "bug", "good first issue", "help wanted"):
            return l
    label_rules = {
        "tooling": ["lint", "eslint", "oxlint", "ci", "hook", "script", "husky", "prettier"],
        "auth": ["auth", "login", "password", "sign", "credential", "session"],
        "blocking": ["block", "siren", "overlay", "accessibility"],
        "android": ["android", "kotlin", "apk", "gradle"],
        "enhancement": ["refactor", "perf", "cache", "improve", "polish", "redesign"],
    }
    for label, keywords in label_rules.items():
        if any(kw in title for kw in keywords):
            return label
    if "bug" in labels:
        return "bug"
    return "enhancement"

# Match orphans to epics
auto_matched = []
needs_user = []

for orphan in orphans:
    title_lower = orphan["title"].lower()
    body_lower = (orphan.get("body", "") or "").lower()
    text = title_lower + " " + body_lower

    scores = {}
    for epic_num, info in epic_keywords.items():
        matches = [kw for kw in info["keywords"] if kw in text]
        if matches:
            scores[epic_num] = matches

    BLOCKING_REPOS = [
        "tied-siren-blocking-overlay",
        "expo-accessibility-service",
        "expo-foreground-service",
    ]

    if not scores:
        # Cross-repo blocking fallback: if orphan is from a blocking repo,
        # auto-assign to the best blocking epic
        if orphan["repo"] in BLOCKING_REPOS:
            blocking_epics = [
                (num, info) for num, info in epic_keywords.items()
                if any(kw in info["keywords"] for kw in ["native", "blocking", "overlay", "accessibility"])
            ]
            if blocking_epics:
                best_num, best_info = max(blocking_epics, key=lambda x: len(x[1]["keywords"]))
                auto_matched.append({
                    "number": orphan["number"],
                    "title": orphan["title"],
                    "repo": orphan["repo"],
                    "epic": best_num,
                    "epic_title": best_info["title"],
                    "keywords": ["cross-repo-blocking"],
                })
                continue

        needs_user.append({
            "number": orphan["number"],
            "title": orphan["title"],
            "repo": orphan["repo"],
            "label": infer_label(orphan),
            "reason": "no epic match",
        })
    else:
        best_epic = max(scores, key=lambda k: len(scores[k]))
        best_matches = scores[best_epic]
        if len(best_matches) >= 2:
            auto_matched.append({
                "number": orphan["number"],
                "title": orphan["title"],
                "repo": orphan["repo"],
                "epic": best_epic,
                "epic_title": epic_keywords[best_epic]["title"],
                "keywords": best_matches,
            })
        else:
            needs_user.append({
                "number": orphan["number"],
                "title": orphan["title"],
                "repo": orphan["repo"],
                "label": infer_label(orphan),
                "reason": f"low confidence: #{best_epic} ({', '.join(best_matches)})",
            })

if orphans:
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## 🏷️ Orphan Tickets")
    lines.append("")

    if auto_matched:
        lines.append("### Auto-Categorized (High Confidence)")
        lines.append("| Ticket | Assigned To | Matched Keywords |")
        lines.append("|--------|-------------|------------------|")
        for m in auto_matched:
            lines.append(f"| #{m['number']} | #{m['epic']} {m['epic_title']} | {', '.join(m['keywords'])} |")
        lines.append("")

    if needs_user:
        lines.append("### Needs Label (no epic match)")
        lines.append("| Ticket | Title | Suggested Label |")
        lines.append("|--------|-------|-----------------|")
        for m in needs_user:
            lines.append(f"| #{m['number']} | {m['title']} | {m.get('label', '?')} |")
        lines.append("")

# Output structured data on stderr for the shell wrapper to pick up
if board_updates:
    print("BOARD_UPDATES:" + json.dumps(board_updates), file=sys.stderr)
if auto_matched:
    print("ORPHAN_MATCHES:" + json.dumps(auto_matched), file=sys.stderr)
if needs_user:
    print("ORPHAN_LABELS:" + json.dumps(needs_user), file=sys.stderr)

print("\n".join(lines))

PYEOF

# ============================================================================
# Phase 4: Sync project board (add missing issues, fix status mismatches)
# ============================================================================

BOARD_LINE=$(grep "^BOARD_UPDATES:" "$STDERR_FILE" 2>/dev/null || true)
if [ -n "$BOARD_LINE" ]; then
  BOARD_JSON="${BOARD_LINE#BOARD_UPDATES:}"

  # Resolve repo identity once
  REPO_NWO=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || echo "")
  OWNER="${REPO_NWO%%/*}"

  if [ -n "$OWNER" ] && [ -n "$REPO_NWO" ]; then
    # Fetch project metadata (IDs) once via GraphQL
    PROJECT_META=$(gh api graphql -f query="
    {
      user(login: \"$OWNER\") {
        projectV2(number: 1) {
          id
          field(name: \"Status\") {
            ... on ProjectV2SingleSelectField {
              id
              options { id name }
            }
          }
        }
      }
    }" 2>/dev/null || echo "")

    # Parse all IDs in a single Python call
    if [ -n "$PROJECT_META" ]; then
      eval "$(echo "$PROJECT_META" | python3 -c "
import json, sys
try:
    d = json.load(sys.stdin)['data']['user']['projectV2']
    f = d['field']
    opts = {o['name']: o['id'] for o in f['options']}
    print(f'PROJECT_ID={d[\"id\"]}')
    print(f'FIELD_ID={f[\"id\"]}')
    print(f'TODO_OPT={opts[\"Todo\"]}')
    print(f'IN_PROGRESS_OPT={opts[\"In Progress\"]}')
    print(f'DONE_OPT={opts[\"Done\"]}')
except (KeyError, TypeError):
    pass
" 2>/dev/null)"
    fi

    if [ -n "${PROJECT_ID:-}" ] && [ -n "${FIELD_ID:-}" ]; then
      echo "📋 Syncing project board..." >&2
      # Pass config via env vars to avoid shell injection in Python source
      export SYNC_PROJECT_ID="$PROJECT_ID"
      export SYNC_FIELD_ID="$FIELD_ID"
      export SYNC_TODO_OPT="$TODO_OPT"
      export SYNC_IN_PROGRESS_OPT="$IN_PROGRESS_OPT"
      export SYNC_DONE_OPT="$DONE_OPT"
      export SYNC_OWNER="$OWNER"
      export SYNC_REPO_NWO="$REPO_NWO"
      echo "$BOARD_JSON" | python3 -c "
import json, os, sys, subprocess

updates = json.load(sys.stdin)
project_id = os.environ['SYNC_PROJECT_ID']
field_id = os.environ['SYNC_FIELD_ID']
todo_opt = os.environ['SYNC_TODO_OPT']
in_progress_opt = os.environ['SYNC_IN_PROGRESS_OPT']
done_opt = os.environ['SYNC_DONE_OPT']
owner = os.environ['SYNC_OWNER']
repo_nwo = os.environ['SYNC_REPO_NWO']

for u in updates:
    num = u['number']
    action = u['action']

    if action == 'add_todo':
        result = subprocess.run(
            ['gh', 'project', 'item-add', '1', '--owner', owner,
             '--url', f'https://github.com/{repo_nwo}/issues/{num}',
             '--format', 'json'],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            print(f'  ❌ #{num}: failed to add to project', file=sys.stderr)
            continue
        item_id = json.loads(result.stdout).get('id', '')
        if not item_id:
            print(f'  ❌ #{num}: no item ID returned', file=sys.stderr)
            continue
        subprocess.run(
            ['gh', 'project', 'item-edit', '--project-id', project_id,
             '--id', item_id, '--field-id', field_id,
             '--single-select-option-id', todo_opt],
            capture_output=True, text=True
        )
        print(f'  ✅ #{num} → added as Todo', file=sys.stderr)

    elif action == 'move_in_progress':
        item_id = u.get('item_id', '')
        if not item_id:
            print(f'  ❌ #{num}: no item ID for status update', file=sys.stderr)
            continue
        subprocess.run(
            ['gh', 'project', 'item-edit', '--project-id', project_id,
             '--id', item_id, '--field-id', field_id,
             '--single-select-option-id', in_progress_opt],
            capture_output=True, text=True
        )
        print(f'  ✅ #{num} → In Progress', file=sys.stderr)

    elif action == 'move_done':
        item_id = u.get('item_id', '')
        if not item_id:
            print(f'  ❌ #{num}: no item ID for status update', file=sys.stderr)
            continue
        subprocess.run(
            ['gh', 'project', 'item-edit', '--project-id', project_id,
             '--id', item_id, '--field-id', field_id,
             '--single-select-option-id', done_opt],
            capture_output=True, text=True
        )
        print(f'  ✅ #{num} → Done', file=sys.stderr)
"
    else
      echo "⚠️  Could not fetch project metadata — board sync skipped" >&2
    fi
  else
    echo "⚠️  Could not determine repo owner — board sync skipped" >&2
  fi
fi

# ============================================================================
# Phase 5.5: Auto-update orphan tickets with hierarchy sections
# ============================================================================

ORPHAN_LINE=$(grep "^ORPHAN_MATCHES:" "$STDERR_FILE" 2>/dev/null || true)
if [ -n "$ORPHAN_LINE" ]; then
  ORPHAN_JSON="${ORPHAN_LINE#ORPHAN_MATCHES:}"
  echo "🏷️  Updating orphan tickets with hierarchy..." >&2

  echo "$ORPHAN_JSON" | python3 -c "
import json, sys, subprocess, tempfile, os

REPO_TO_FULL = {
    'TiedSiren51': 'amehmeto/TiedSiren51',
    'tied-siren-blocking-overlay': 'amehmeto/tied-siren-blocking-overlay',
    'expo-accessibility-service': 'amehmeto/expo-accessibility-service',
    'expo-foreground-service': 'amehmeto/expo-foreground-service',
    'expo-list-installed-apps': 'amehmeto/expo-list-installed-apps',
}

matches = json.load(sys.stdin)
for m in matches:
    num = m['number']
    epic_num = m['epic']
    epic_title = m['epic_title']
    repo = m.get('repo', 'TiedSiren51')
    epic_url = f'https://github.com/amehmeto/TiedSiren51/issues/{epic_num}'

    # Build --repo args for cross-repo issues
    full_repo = REPO_TO_FULL.get(repo, '')
    repo_args = ['--repo', full_repo] if repo != 'TiedSiren51' and full_repo else []

    result = subprocess.run(
        ['gh', 'issue', 'view', str(num), '--json', 'body', '-q', '.body'] + repo_args,
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print(f'  ❌ {repo}#{num}: failed to fetch body', file=sys.stderr)
        continue

    body = result.stdout.strip()
    hierarchy = (
        '\n\n## Hierarchy\n'
        '| Level | Link |\n'
        '|-------|------|\n'
        f'| 🏔️ Epic | [#{epic_num} - {epic_title}]({epic_url}) |'
    )
    new_body = body + hierarchy

    fd, tmppath = tempfile.mkstemp(suffix='.md')
    try:
        with os.fdopen(fd, 'w') as f:
            f.write(new_body)
        result = subprocess.run(
            ['gh', 'issue', 'edit', str(num), '--body-file', tmppath] + repo_args,
            capture_output=True, text=True
        )
        if result.returncode == 0:
            print(f'  ✅ {repo}#{num} → Epic #{epic_num}', file=sys.stderr)
        else:
            print(f'  ❌ {repo}#{num}: {result.stderr[:100]}', file=sys.stderr)
    finally:
        os.unlink(tmppath)
"
fi

# Apply labels to unmatched orphans
LABEL_LINE=$(grep "^ORPHAN_LABELS:" "$STDERR_FILE" 2>/dev/null || true)
if [ -n "$LABEL_LINE" ]; then
  LABEL_JSON="${LABEL_LINE#ORPHAN_LABELS:}"
  echo "🏷️  Adding labels to unmatched orphans..." >&2

  echo "$LABEL_JSON" | python3 -c "
import json, sys, subprocess

REPO_TO_FULL = {
    'TiedSiren51': 'amehmeto/TiedSiren51',
    'tied-siren-blocking-overlay': 'amehmeto/tied-siren-blocking-overlay',
    'expo-accessibility-service': 'amehmeto/expo-accessibility-service',
    'expo-foreground-service': 'amehmeto/expo-foreground-service',
    'expo-list-installed-apps': 'amehmeto/expo-list-installed-apps',
}

orphans = json.load(sys.stdin)
for o in orphans:
    num = o['number']
    label = o.get('label', 'enhancement')
    repo = o.get('repo', 'TiedSiren51')

    # Build --repo args for cross-repo issues
    full_repo = REPO_TO_FULL.get(repo, '')
    repo_args = ['--repo', full_repo] if repo != 'TiedSiren51' and full_repo else []

    # Ensure label exists (create if needed)
    subprocess.run(
        ['gh', 'label', 'create', label, '--force', '--description', ''] + repo_args,
        capture_output=True, text=True
    )

    result = subprocess.run(
        ['gh', 'issue', 'edit', str(num), '--add-label', label] + repo_args,
        capture_output=True, text=True
    )
    if result.returncode == 0:
        print(f'  ✅ {repo}#{num} → label \"{label}\"', file=sys.stderr)
    else:
        print(f'  ❌ {repo}#{num}: {result.stderr[:100]}', file=sys.stderr)
"
fi
