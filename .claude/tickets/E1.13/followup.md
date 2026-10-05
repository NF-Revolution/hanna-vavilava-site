# E1.13 — followup

Shipped 2026-10-05 — see the last `## Outcome` at the bottom.

Issue [#167](https://github.com/NF-Revolution/hanna-vavilava-site/issues/167) ·
PR [#169](https://github.com/NF-Revolution/hanna-vavilava-site/pull/169) ·
branch `167-e113-close-the-menu-drawer-by-clicking-outside-it` · no canvas change

## 2026-10-05

- planned, built and verified in one session. No board read, because nothing visible changes.
- the `close` event on Escape and on the cross's `<form method="dialog">` fires a task
  later, not at once. A browser check that reads `body.style.overflow` straight after the
  key press sees `hidden` and looks like a bug. Wait a tick before reading it.

## What was built — 2026-10-05

`src/components/MenuDrawer.astro`, inside the existing `if (dialog?.showModal)` guard, has
two listeners. `pointerdown` records whether the press began on the `<dialog>` itself.
`click` calls `dialog.close()` only when the press began there and the click also lands
there. The existing `close` handler then removes `overflow: hidden`, the same as for the
cross and Escape.

Rejected:

- `closedby="any"`: light dismiss fires only for clicks outside the dialog's box. This
  dialog is `100% × 100%`, so it would never fire, whatever Safari supports.
- Shrinking the dialog to the panel's width: that changes the backdrop and the layout for
  nothing.

## Outcome — 2026-10-05

Checked in headless Chrome at 1280×800 against `astro preview`:

- a click on the dim area closes the drawer and restores scrolling
- a click on the panel's padding or on the nav padding above the links leaves it open
- a drag that starts on a link and ends on the dim area leaves it open
- Escape and the cross still close it and restore scrolling

The largest inline JavaScript on any public page is 1673 B
(`/en/horses/cascada/`), well under the 4 KB budget. On mobile the panel is 100% wide,
so there is no area outside it to click. Traps for next time:

- a press that starts on the dim area and ends in the panel still closes the drawer,
  because the click then targets the dialog, their common ancestor. Nobody does that
  on purpose, so it was left as it is.
- the press-start check is what stops a text selection dragged out of the panel from
  closing the drawer. Do not drop it in favour of the click target alone.
