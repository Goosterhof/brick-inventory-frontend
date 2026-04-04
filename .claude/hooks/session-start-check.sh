#!/bin/bash
# SessionStart hook: Verify the build environment is healthy.
# Checks node version, npm dependencies, and key tool availability.
# Returns context to Claude so it knows the state of the workspace.

ISSUES=""
CWD="${CWD:-$(pwd)}"

# Check Node.js version (require 24+)
if command -v node &>/dev/null; then
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 24 ] 2>/dev/null; then
        ISSUES="${ISSUES}\n- Node.js version is $(node -v) but 24+ is required"
    fi
else
    ISSUES="${ISSUES}\n- Node.js is not installed"
fi

# Check if node_modules exists
if [ ! -d "$CWD/node_modules" ]; then
    ISSUES="${ISSUES}\n- node_modules missing — run npm install before starting work"
fi

# Check if key tools are available
if ! command -v npx &>/dev/null; then
    ISSUES="${ISSUES}\n- npx not found"
fi

# Check for package-lock freshness (package.json newer than node_modules)
if [ -d "$CWD/node_modules" ] && [ -f "$CWD/package.json" ]; then
    if [ "$CWD/package.json" -nt "$CWD/node_modules" ]; then
        ISSUES="${ISSUES}\n- package.json is newer than node_modules — run npm install to sync dependencies"
    fi
fi

if [ -n "$ISSUES" ]; then
    cat <<EOF
{
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": "ENVIRONMENT ISSUES DETECTED:$(echo -e "$ISSUES")\n\nResolve these before starting work. The pre-push gauntlet will fail if the environment is broken."
    }
}
EOF
else
    cat <<EOF
{
    "hookSpecificOutput": {
        "hookEventName": "SessionStart",
        "additionalContext": "Environment check passed: Node $(node -v), dependencies installed, tools available."
    }
}
EOF
fi

exit 0
