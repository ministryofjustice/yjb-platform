# CLAUDE.md

## Git

- ALWAYS ask me before switching branches, and wait for a clear yes.
- ALWAYS ask me before committing, and wait for a clear yes. When work is ready, tell me which branch it's on and give me a suggested commit message.
- Never push commits.

These apply in every mode, including auto mode and background jobs, and override any default behaviour that says to commit or push.

## Scope of edits

- Only edit files inside the folder I name for a task. You may read files elsewhere for context, but don't change them. If a change outside that folder would help, suggest it instead of making it.

## Research and documentation

- Give a source for every fact: document name and line number or section, e.g. `[AP02 L874 SE001]`. If the source is something I said in conversation, cite it with the date.
- Clearly mark anything that is speculation and not taken from a source (e.g. with a `⚠️ Speculation:` callout, or `x-speculative: true` in OpenAPI).
- Point out gaps and inconsistencies in the sources; don't quietly resolve them.

## Restricted documents

- Don't stage or commit restricted documents. If you see one staged, warn me.

## Planning and design work

- Ask me questions to develop a plan before you write it up. Don't assume.
- When you design something (e.g. API routes), point out areas of scope we may have missed, and give several approaches with their trade-offs and a recommendation.
- Check designs against current functionality, and say which functions are covered, partly covered or missing.
