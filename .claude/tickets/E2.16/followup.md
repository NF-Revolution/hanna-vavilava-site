# E2.16 · Preview button in the horse editor — #185

Shipped 2026-10-09.

## 2026-10-09

- Branch `185-e216-preview-button-in-the-horse-editor`. The approach comment is on #185.
- Blocker #184 closed. The admin panel has no artboard, by decision, so no canvas change.
- `npm run ci` green. ticket-reviewer: clear, every AC met.

## What was built — 2026-10-09

- `src/pages/admin.astro`: the Preview button and its `role=status` line moved from the list
  view into the editor's action row: Save · Preview · Cancel. The hint sits under the row.
- The submit handler's body is now `saveHorse()`. It runs `reportValidity()`, the schema and
  half-pair checks, the X-ray deletes and the `set()`. It returns the saved slug, or nothing with
  the errors shown. After a write the editor stays on that slug: `editing`, a read-only slug,
  an empty `uploaded` set, and the title. A new horse becomes an existing one, so Cancel no
  longer deletes its X-rays. Submit is `saveHorse()` and then `close()`.
- Preview runs `saveHorse()`, the `preview` callable, `deployed('draft.yml', at)` and
  `draftUrl()`. The status line then shows two new-tab links, built as
  `new URL(path('pl', 'horse', slug), base)` and `new URL(path('pl', 'horses'), base)`, and a
  sentence that the preview is not public and Publish is still needed.
- `open()` clears the preview line only when no build is running. A running build's link names
  its horse, so the line stays true if Hanna opens another horse.
- i18n: `previewHint` rewritten. `previewHorse`, `previewList` and `previewReady` added in
  both files. `previewDone` removed.

## Outcome — 2026-10-09

- Chosen: always save before the preview. Saving an unchanged horse writes the same record.
- Rejected:
  - Dirty-tracking to skip the save: more code, with its own bugs.
  - Warning that unsaved changes will not appear: the AC allows it, but the preview could still
    show stale data.
  - Keeping the list-view Preview too: two handlers for one job. The horses-list link covers it.
- Traps:
  - A form button with `type=button` skips the browser's constraint check. `saveHorse()` calls
    `reportValidity()` itself, or Preview would write a horse with an empty required field.
  - `repository_dispatch` runs `main`'s `draft.yml`, so a real preview only works after merge.
  - A Preview on a sold horse with X-rays asks the sold confirm, because it saves.
