# CLAUDE.md

## Git

- ALWAYS ask me before switching branches, and wait for a clear yes.
- ALWAYS ask me before committing, and wait for a clear yes. When work is ready, tell me which branch it's on and give me a suggested commit message.
- Never push commits.
- Never try to bypass commit signing: no `--no-gpg-sign`, no `-c commit.gpgsign=false`, and no changes to signing config. If signing fails, stop, tell me, and leave the changes staged so I can commit them myself.

These apply in every mode, including auto mode and background jobs, and override any default behaviour that says to commit or push.

## Scope of edits

- Only edit files inside the folder I name for a task. You may read files elsewhere for context, but don't change them. If a change outside that folder would help, suggest it instead of making it.

## Research and documentation

- Give a source for every fact: document name and line number or section, e.g. `[AP02 L874 SE001]`. If the source is something I said in conversation, cite it with the date.
- Clearly mark anything that is speculation and not taken from a source (e.g. with a `⚠️ Speculation:` callout, or `x-speculative: true` in OpenAPI).
- Point out gaps and inconsistencies in the sources; don't quietly resolve them.
- When you cite a requirement ID (e.g. GE034, YY026, QA013), also say what the requirement says, e.g. "the one-stage-in-progress rule [AP02 L520 GE034]", not just "rule GE034".

## Markdown

- Markdown you write or edit must pass [markdownlint](https://github.com/DavidAnson/markdownlint), using the repo-root `.markdownlint.jsonc`: the defaults with MD013 (line length) turned off, because wide tables can't be wrapped. Look for override files in subfolders too (`.markdownlint.json[c]`, `.markdownlint.yaml`, `.markdownlint-cli2.*`), since they apply to their folder and below.
- The rules most often broken are MD032 (blank line before and after lists, including `>` lines inside blockquotes), MD036 (a bold line used as a heading; end it with a colon or make it a real heading) and MD024 (repeated heading text).
- Lint after editing. `markdownlint-cli2` and `markdownlint-cli` have failed here (finding 0 files, or printing only the usage text). Instead, install the `markdownlint` library in a scratch folder and call `lint({ files, config })` from `markdownlint/sync`.

## Terminology

- "Youth Offending Team" (YOT) is deprecated. Write "Youth Justice Service" (YJS), plural "YJSs", in prose, API names and identifiers (e.g. `yjs`, not `yot`).
- Older documents, including the restricted documents, may still say YOT. Treat YOT and YJS as directly equivalent.
- Keep source text exactly as written: direct quotes, sheet, table and heading names (e.g. AP03 'YOT Full List'), stage-type names ("Transfer YOT to YOT") and schema element names (`Originating_YOT`). Write YJS in the text around them.
- Never edit the restricted documents to change this term.

## Restricted documents

- Don't stage or commit restricted documents. If you see one staged, warn me.
- The short quotes, phrases and controlled values from `restricted-documents/` that appear in the `claude-exploration/` docs are acceptable; the team decided this on 2026-11-19. Don't flag them, and keep quoting and citing in the same way.

## Planning and design work

- Ask me questions to develop a plan before you write it up. Don't assume.
- When you design something (e.g. API routes), point out areas of scope we may have missed, and give several approaches with their trade-offs and a recommendation.
- Check designs against current functionality, and say which functions are covered, partly covered or missing.
- For the API, default to standard RESTful HTTP: methods, status codes and standard headers such as `ETag`, `If-Match`, `Idempotency-Key` and `Retry-After`. When you offer design options, mark the one closest to standard REST/HTTP (e.g. "(Closest to REST)"), separately from "(Recommended)" if they differ.
