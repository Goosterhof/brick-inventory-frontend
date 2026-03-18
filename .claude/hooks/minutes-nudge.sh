#!/bin/bash
# Stop hook: nudge the CFO to suggest /minutes if the session has been
# running for a while without logging minutes.
#
# Logic:
#   - If MINUTES.md doesn't exist, this is a fresh project — nudge after
#     a few exchanges so the CEO knows the feature exists.
#   - If MINUTES.md exists and was updated recently (last 10 min), stay quiet.
#   - If MINUTES.md exists but is stale (>10 min since last write), nudge.
#
# Output: JSON that either does nothing (continue: true) or blocks with
# a reason that gets injected into Claude's context.

MINUTES_FILE="${CWD:-$(pwd)}/MINUTES.md"
NUDGE_INTERVAL=600  # 10 minutes in seconds

now=$(date +%s)

if [ ! -f "$MINUTES_FILE" ]; then
    # No minutes file yet — only nudge occasionally by checking a sentinel
    sentinel="/tmp/.claude-minutes-nudge-$$"
    if [ ! -f "$sentinel" ]; then
        touch "$sentinel"
        echo '{"continue": true}'
        exit 0
    fi
    last_nudge=$(stat -c %Y "$sentinel" 2>/dev/null || echo 0)
    elapsed=$((now - last_nudge))
    if [ "$elapsed" -lt "$NUDGE_INTERVAL" ]; then
        echo '{"continue": true}'
        exit 0
    fi
    touch "$sentinel"
    echo '{"decision": "block", "reason": "If substantive decisions, architecture choices, or action items were discussed in the last exchange, suggest running /minutes to the CEO. If nothing notable happened, do not mention minutes — just continue normally."}'
    exit 0
fi

# MINUTES.md exists — check staleness
last_modified=$(stat -c %Y "$MINUTES_FILE" 2>/dev/null || echo 0)
elapsed=$((now - last_modified))

if [ "$elapsed" -lt "$NUDGE_INTERVAL" ]; then
    # Recently updated, stay quiet
    echo '{"continue": true}'
    exit 0
fi

# Stale — nudge
echo '{"decision": "block", "reason": "If substantive decisions, architecture choices, or action items were discussed in the last exchange, suggest running /minutes to the CEO. If nothing notable happened, do not mention minutes — just continue normally."}'
exit 0
