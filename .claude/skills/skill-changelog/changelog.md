# Changelog: skill-changelog

Newest first. Each branch adds one entry covering its changes compared with main. Entries are never edited once they reach main.

## 1.0.0 · 2026-11-09 · prototypes/e2e_workflow
<!-- skill-hash: a8580ce425cc414ed5d52210541da8d5f0f92afe -->

### Added
- `/skill-changelog` proposes one changelog entry per changed skill, covering everything the branch changed since it diverged from main, and writes it only after approval.
- Creates `changelog.md` in a skill's folder if it doesn't exist, and bumps the `version:` (plain MAJOR.MINOR.PATCH) in the skill's SKILL.md frontmatter.
- Each branch entry carries a hidden `skill-hash` stamp of the skill folder's contents, so any later edit to the skill marks the entry out of date until `/skill-changelog` is re-run. Re-running can keep the entry text and just refresh the stamp.
- `check-changelogs.sh` reports which skills are new or changed, and checks for a branch entry with a current stamp, a version bump, and entries from main left untouched. `--hash <skill folder>` prints the stamp value.
- CI workflow `skill-changelogs.yml` runs that check on pull requests that touch `.claude/skills/`.
- Rules: only this branch's entry may be rewritten, entries from main are frozen, and stamps are only ever written from `--hash` output.
