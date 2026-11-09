---
name: skill-changelog
description: Record what this branch changed in each Claude skill under .claude/skills/, compared with main, as an approved entry in that skill's changelog.md, and bump the skill's version.
disable-model-invocation: true
version: 1.0.0
---

# Update skill changelogs

Every skill in `.claude/skills/<name>/` keeps a `changelog.md` and a semver `version:` in its SKILL.md frontmatter. Each branch gets **one entry per skill it changes**. The entry describes everything the branch changed compared with the point where it diverged from main, so each squash-merged PR reads as one entry.

## Step 1: find what changed

Run `.claude/skills/skill-changelog/check-changelogs.sh` from the repo root. For each skill, it reports:
- the merge-base and branch name
- whether the skill is new, changed or unchanged since the merge-base, including uncommitted and untracked files
- its version on main and now
- any problems:
  - a missing entry for this branch
  - an entry whose `skill-hash` stamp is missing or out of date, meaning the skill changed after the entry was written
  - a version that hasn't been bumped
  - an altered entry from main

If no skill needs an entry or a stamp update, say so in one line and stop.

## Step 2: propose an entry for each skill that needs one

For each new or changed skill that has a problem:

1. **Read the change.**
   - **New skill:** read its whole SKILL.md and supporting files.
   - **Existing skill:** read `git diff <merge-base> -- .claude/skills/<name>/`, which covers committed and uncommitted work, plus any untracked files.
   - Ignore `changelog.md` itself.
   - If `changelog.md` already has an entry for this branch, use it as the starting point and revise it to cover the whole branch.
2. **Choose the version**, always bumping from the version on main (not from this branch's earlier entry). Versions are plain `MAJOR.MINOR.PATCH`, e.g. `1.2.0`: no `v` prefix, and no pre-release or build suffix. The check script rejects anything else.
   - **New skill:** `1.0.0`.
   - **Major:** the workflow or rules changed in a way that changes what the skill produces, or removed something users relied on.
   - **Minor:** added a capability or step.
   - **Patch:** wording, clarification or a fix that doesn't change behaviour.
3. **Draft the entry**, written for someone who uses the skill, not as a commit log:

   ```markdown
   ## <version> · <YYYY-MM-DD> · <branch>
   <!-- skill-hash: <hash> -->

   ### Added
   - ...

   ### Changed
   - ...

   ### Removed
   - ...
   ```

   - Use today's date and the branch name exactly as the script printed it.
   - Leave out empty sections.
   - The `skill-hash` stamp is filled in when the entry is written (Step 3). Don't show it in the proposal.
   - For a new skill, use a single `### Added` section summarising what the skill does: its main steps, its inputs and outputs, and any hard rules.
4. **Ask for approval.** Show the drafted entry and the version change (e.g. `1.2.0 → 1.3.0`). Then ask with one `AskUserQuestion` call, with one question per skill:
   - **Approve**
   - **Amend:** the user describes the changes in "Other" or the notes, and you redraft and ask again
   - **Skip:** no entry for now

   If the branch already has an entry and only its stamp is out of date, check whether the later changes alter what the entry should say. A typo fix usually doesn't. If they don't, show the existing entry unchanged and offer **Keep entry, update stamp** as the first option.

## Step 3: write approved entries

For each approved skill:

1. **If `changelog.md` doesn't exist, create it:**

   ```markdown
   # Changelog: <skill name>

   Newest first. Each branch adds one entry covering its changes compared with main. Entries are never edited once they reach main.
   ```

2. **Put the entry first**, directly below that header. If this branch already has an entry, replace that one block in place.
3. **Set `version:`** in the skill's SKILL.md frontmatter to the new version. Add the field after `description` if it's missing.
4. **Stamp the entry last**, after the SKILL.md edit, because the stamp covers it. Run `check-changelogs.sh --hash .claude/skills/<name>`, and put its output on the line straight after the entry's heading as `<!-- skill-hash: <output> -->`, replacing any existing stamp in this branch's entry. The stamp is a hash of every file in the skill folder except `changelog.md`. Any later edit to the skill, including uncommitted ones, makes it stale, and the check then asks for `/skill-changelog` to be re-run.
5. When every skill is done, run `check-changelogs.sh --strict` and report the result. Don't commit; the user commits.

## Rules

- **Never edit any entry except this branch's own.** Entries that came from main are frozen, and CI fails if one changes.
- Describe the branch as a whole compared with the merge-base, not just the latest commit.
- Never write an entry, update a stamp, or bump a version without the user's approval.
- Never write a stamp by hand or copy one from elsewhere. Always use `--hash` output for the skill's current contents.
- The CI workflow `.github/workflows/skill-changelogs.yml` runs `check-changelogs.sh --strict` on pull requests that touch `.claude/skills/`.
