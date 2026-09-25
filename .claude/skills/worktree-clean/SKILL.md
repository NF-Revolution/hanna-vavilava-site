---
name: worktree-clean
description: >
  Remove the worktrees, background sessions and local branches of tickets whose pull
  request has merged. Use whenever the user asks to clean, clear, tidy or remove
  worktrees, finished tickets or background sessions — "clean the worktrees", "clear
  finished tickets", "tidy up after the merges", "/worktree-clean". Also use after a
  batch of parallel tickets from `ticket-implement` §0 has landed. This skill owns what
  counts as finished and what may be deleted.
---

# Cleaning finished worktrees

Repo: `NF-Revolution/hanna-vavilava-site`. Parallel tickets run as
`claude --bg -w <name>` sessions, each in `.claude/worktrees/<name>`. Finished means the
worktree's branch has a **merged** pull request. Merges are squashes, so `git branch --merged`
knows nothing — ask GitHub.

## 1. List the worktrees

    git worktree list --porcelain

Keep the entries whose path is under `<repo root>/.claude/worktrees/`. Note each one's
`branch refs/heads/<branch>`; a detached worktree has no branch — keep it and report it.

## 2. Map worktrees to sessions

    claude agents --json --all

Match each session's `cwd` to a worktree path. The session `id` is what `claude rm` takes.
A worktree with no session is fine — its session already went.

## 3. Ask GitHub about each branch

    gh pr list --repo NF-Revolution/hanna-vavilava-site --head <branch> --state all --json number,state

- `MERGED` → clean it (§4).
- `OPEN`, no pull request, or `CLOSED` without merge → keep it and report why. A closed,
  unmerged one may be abandoned work: ask before touching it.

## 4. Clean a merged one

    claude rm <id>                  # session known: removes session and worktree
    git worktree remove <path>      # no session

Then delete what is left of the branches:

    git branch -D <branch>
    git branch -D worktree-<name>   # the -w placeholder, if it still exists

`-D`, not `-d`, because a squash merge leaves the local branch looking unmerged. The pull
request says `MERGED`, so nothing is lost.

## 5. Tidy

    git worktree prune

## Rules

- Never pass `--discard-unpushed` or `--force-remove-worktree` to `claude rm`, and never
  `git worktree remove --force`. A refusal means unpushed or uncommitted work: report its
  message verbatim and keep the worktree.
- Never touch the main checkout or a worktree outside `.claude/worktrees/`.

## Return

Two short lists: cleaned (name, pull-request number) and kept (name, reason). Nothing else.
