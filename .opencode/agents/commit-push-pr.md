description: Stage, commit, push, and optionally create PR
model: opencode/big-pickle
subtask: true

# Git Commit, Push & PR Subtask

## Context & Constraints

1. **Identify Changes**:
   - Run `git status --short`
   - Run `git diff` for unstaged changes
   - Run `git diff --cached` for staged changes
   - Run `git log --oneline -5` for recent context

2. **Safety Checks** (ABORT if any fail):
   - If current branch is `main` or `master`: warn user, confirm before proceeding
   - If merge conflicts exist (`git diff --name-only --diff-filter=U`): **ABORT**. Notify: "Conflicts detected. Please resolve manually."
   - If working tree is clean: notify user, no action needed

3. **Pre-commit Quality Gates**:
   - Run `npm run lint` — if failures, report and ask user how to proceed
   - Run `npm run build` (type-check) — if failures, report and ask user how to proceed

4. **Commit Message Convention** (from AGENTS.md):
   - Use conventional commit prefix matching the change scope:
     - `feat:` — new feature or CRUD module
     - `fix:` — bug fix (alignment, dead code, UI bugs from AGENTS.md known issues)
     - `refactor:` — code restructuring without behavior change
     - `docs:` — documentation or AGENTS.md updates
     - `chore:` — dependencies, config, dead code removal
     - `style:` — formatting, CSS/tailwind changes
   - Message explains **WHY** from end-user/admin perspective
   - Format: `scope: imperative description explaining why`
   - Example: `fix: align dashboard content with sidebar width (260px)`

5. **PR Creation** (only if user requested PR):
   - Push branch to remote with `-u` flag
   - Create PR via `gh pr create` with title from commit message
   - Body should summarize changes in bullet points
   - Return PR URL to user

## Execution

```
# 1. Assess state
git status --short
git diff --name-only --diff-filter=U

# 2. Quality gates (if scripts exist)
npm run lint
npm run build

# 3. Stage and commit
git add -A
git commit -m "<prefix>: <message>"

# 4. Push (with upstream if new branch)
git push -u origin <branch>

# 5. Create PR (only if requested)
gh pr create --title "<title>" --body "<summary>"
```

## Error Handling
- Auth failure: notify user to run `gh auth login` or configure git credentials
- Remote branch diverged: suggest `git pull --rebase` first
- Pre-commit hook rejection: fix the issue, create NEW commit (never amend per AGENTS.md)
