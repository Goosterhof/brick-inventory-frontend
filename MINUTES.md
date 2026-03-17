# Brick & Mortar Associates — Meeting Minutes

_Board meeting notes between the CEO and the executive team._
_Captured by the Meeting Minutes Secretary (1x1 translucent-clear brick, with clipboard)._

---

## 2026-03-17 — Meeting Minutes Secretary Setup

### Decisions
- **Stop hook uses command type, not prompt**: Prompt-type hooks are only available for tool events (PreToolUse, PostToolUse, PermissionRequest) — not Stop. Used a command hook that outputs JSON with `decision: "block"` to conditionally inject a nudge into the CFO's context.
- **10-minute staleness window for nudges**: The Stop hook stays silent if MINUTES.md was updated in the last 10 minutes, preventing nagging during active documentation. Uses file mtime for simplicity.
- **SessionEnd hook for auto-commit**: MINUTES.md is automatically committed (if changed) when a session ends, so minutes are never lost even if the CEO forgets to commit.

### Notes
- The `/minutes` skill, Stop hook, and SessionEnd hook are all shipped as project-level config (`.claude/settings.json`, `.claude/skills/`, `.claude/hooks/`) — committed to the repo, shared across team.
- The settings file watcher may not detect a newly created `.claude/settings.json` mid-session — hooks activate on next session start or after visiting `/hooks`.

---
