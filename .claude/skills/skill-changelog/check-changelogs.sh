#!/usr/bin/env bash
# Reports, for each skill in .claude/skills/, whether it has changed since this branch diverged from main
# and whether its changelog.md records that change.
#
# A skill passes when, compared with the merge-base:
#   - it hasn't changed, or
#   - its changelog.md has an entry naming this branch, whose `<!-- skill-hash: ... -->` stamp matches the
#     skill folder's current contents (so the entry was written after the latest change), and the `version:`
#     in its SKILL.md frontmatter is higher than at the merge-base (or the skill is new)
# and every changelog entry that already existed at the merge-base is still there, word for word.
#
# Usage: check-changelogs.sh [--strict]
#        check-changelogs.sh --hash <skill folder>   print the stamp value for a skill's current contents
#   --strict  exit 1 if any skill fails (used by CI)
# Env: BASE_REF  the branch to compare with (default origin/main, falling back to main)
#      BRANCH    this branch's name (default GITHUB_HEAD_REF, then the current git branch)
set -euo pipefail
# byte-order sorting and matching, whatever the machine's locale: skill_hash sorts file names, and a
# locale-dependent order (e.g. en_GB ignores case, CI's C locale doesn't) gives a different hash in CI
export LC_ALL=C

STRICT=false
[ "${1:-}" = "--strict" ] && STRICT=true
HASH_DIR=""
if [ "${1:-}" = "--hash" ]; then
  HASH_DIR="${2:?Usage: check-changelogs.sh --hash <skill folder>}"
  # the folder relative to the repo root, as git sees it (immune to symlinks such as /tmp -> /private/tmp)
  HASH_DIR=$(git -C "$HASH_DIR" rev-parse --show-prefix)
  HASH_DIR=${HASH_DIR%/}
fi

cd "$(git rev-parse --show-toplevel)"

# a hash of every file in a skill folder except changelog.md, as it is on disk: committed, uncommitted and
# untracked (but not git-ignored) files. Paths are relative to the folder, so the hash depends only on content.
skill_hash() {
  local dir=$1 file
  { git ls-files --cached --others --exclude-standard -- "$dir"; } | sort -u |
    while IFS= read -r file; do
      [ -f "$file" ] && [ "$file" != "$dir/changelog.md" ] && printf '%s %s\n' "$(git hash-object -- "$file")" "${file#"$dir"/}"
    done | git hash-object --stdin
}

if [ -n "$HASH_DIR" ]; then
  skill_hash "$HASH_DIR"
  exit 0
fi

BASE_REF="${BASE_REF:-origin/main}"
git rev-parse --verify --quiet "$BASE_REF" >/dev/null || BASE_REF=main
BASE=$(git merge-base HEAD "$BASE_REF")
BRANCH="${BRANCH:-${GITHUB_HEAD_REF:-$(git rev-parse --abbrev-ref HEAD)}}"
if [ "$BRANCH" = "HEAD" ]; then
  echo "Can't tell which branch this is (detached HEAD). Set BRANCH=<branch name> and run again." >&2
  exit 1
fi

echo "Comparing with $BASE_REF at merge-base $(git rev-parse --short "$BASE"), branch $BRANCH"

# prints the version: value from a SKILL.md's frontmatter, read from stdin
frontmatter_version() {
  awk 'NR==1 && $0!="---" {exit} NR>1 && $0=="---" {exit} /^version:/ {sub(/^version:[ \t]*/, ""); gsub(/["\x27]/, ""); print; exit}'
}

# versions are plain MAJOR.MINOR.PATCH: no "v" prefix, no pre-release or build suffix
is_version() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

# true if version $1 is higher than version $2; both must pass is_version
version_gt() {
  local IFS=.
  local -a a=($1) b=($2)
  local i
  for i in 0 1 2; do
    if ((10#${a[i]} > 10#${b[i]})); then return 0; fi
    if ((10#${a[i]} < 10#${b[i]})); then return 1; fi
  done
  return 1
}

# for this branch's entry in changelog $1 (heading ending in " · <branch>", matched exactly, no regex),
# prints its skill-hash stamp, or nothing if it has none. Fails if there's no entry for this branch.
branch_entry_stamp() {
  [ -f "$1" ] && SUFFIX=" · $BRANCH" awk '
    index($0, "## ") == 1 {
      s = ENVIRON["SUFFIX"]
      in_entry = length($0) >= length(s) && substr($0, length($0) - length(s) + 1) == s
      if (in_entry) found = 1
      next
    }
    in_entry && match($0, /^<!-- skill-hash: [0-9a-f]+ -->$/) && !stamp {
      stamp = $0; sub(/^<!-- skill-hash: /, "", stamp); sub(/ -->$/, "", stamp)
    }
    END { if (stamp) print stamp; exit !found }' "$1"
}

# prints each "## " entry of a changelog as one line, with newlines escaped, so entries compare as whole blocks
entries() {
  awk '/^## /{if (e) print e; e=$0; next} e{e=e "\\n" $0} END{if (e) print e}'
}

failures=0
# with no skill folders, the loop below runs zero times instead of once with a literal "*/"
shopt -s nullglob

for dir in .claude/skills/*/; do
  dir=${dir%/}
  name=$(basename "$dir")
  if [ ! -f "$dir/SKILL.md" ]; then
    echo "- $name: no SKILL.md, skipped"
    continue
  fi
  changelog="$dir/changelog.md"
  problems=()

  changed_files=$( { git diff --name-only "$BASE" -- "$dir"; git ls-files --others --exclude-standard -- "$dir"; } |
    grep -v "^$changelog\$" | sort -u || true)

  is_new=false
  git cat-file -e "$BASE:$dir/SKILL.md" 2>/dev/null || is_new=true

  base_version=""
  $is_new || base_version=$(git show "$BASE:$dir/SKILL.md" | frontmatter_version)
  version=$(frontmatter_version < "$dir/SKILL.md")

  # entries from main are frozen
  if git cat-file -e "$BASE:$changelog" 2>/dev/null; then
    current_entries=$( [ -f "$changelog" ] && entries < "$changelog" || true)
    while IFS= read -r entry; do
      [ -z "$entry" ] && continue
      if ! grep -qxF -- "$entry" <<< "$current_entries"; then
        problems+=("an entry from main was altered or removed: ${entry%%\\n*}")
      fi
    done < <(git show "$BASE:$changelog" | entries)
  fi

  if [ -z "$changed_files" ]; then
    status="unchanged"
  else
    $is_new && status="new skill" || status="changed"
    if ! stamp=$(branch_entry_stamp "$changelog"); then
      problems+=("no changelog entry for branch $BRANCH")
    elif [ -z "$stamp" ]; then
      problems+=("the entry for branch $BRANCH has no skill-hash stamp")
    elif [ "$stamp" != "$(skill_hash "$dir")" ]; then
      problems+=("the skill has changed since its changelog entry for $BRANCH was written")
    fi
    if [ -z "$version" ]; then
      problems+=("SKILL.md frontmatter has no version")
    elif ! is_version "$version"; then
      problems+=("version $version must be MAJOR.MINOR.PATCH, e.g. 1.2.0 (no v prefix or pre-release suffix)")
    elif ! $is_new && is_version "$base_version" && ! version_gt "$version" "$base_version"; then
      problems+=("version $version is not higher than $base_version on main")
    fi
  fi

  echo "- $name: $status (version on main: ${base_version:-none}, now: ${version:-none})"
  if [ -n "$changed_files" ]; then
    sed 's/^/    changed: /' <<< "$changed_files"
  fi
  for problem in "${problems[@]+"${problems[@]}"}"; do
    echo "    ✗ $problem"
    failures=$((failures + 1))
  done
done

if [ "$failures" -gt 0 ]; then
  echo "$failures problem(s). Run /skill-changelog on this branch to record skill changes."
  $STRICT && exit 1
else
  echo "✓ skill changelogs are up to date"
fi
