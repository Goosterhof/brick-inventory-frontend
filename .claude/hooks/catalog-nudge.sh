#!/usr/bin/env bash
# PostToolUse hook: Reminds to update brick catalog when shared components change.
# Receives tool info on stdin, outputs JSON with optional message.

input=$(cat)
tool_name=$(echo "$input" | jq -r '.tool_name // empty')
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Only trigger on Edit/Write targeting shared components
if [[ "$tool_name" == "Edit" || "$tool_name" == "Write" ]] && [[ "$file_path" == *"src/shared/components/"* ]]; then
    component=$(basename "$file_path" .vue)
    echo '{"message": "Shared component '"$component"' was modified. Remember to update .claude/docs/brick-catalog.md if props, emits, or slots changed."}'
else
    echo '{}'
fi
