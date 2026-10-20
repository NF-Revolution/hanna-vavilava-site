# E4.21 — followup

In progress since 2026-10-20.

Issue [#190](https://github.com/NF-Revolution/hanna-vavilava-site/issues/190) ·
branch `190-e421-last-competition-on-the-horse-page-every-round-stacked` · canvas `F7qeoBwkyu2Dau5p1iLg2n`

## 2026-10-20

- probed livejumping for Lotus Blue 2026. `id_zawodow` is a real competition id, so rounds
  group on it, not on name + dates. Show: `zawody.nazwa`, `zawody.miejsce`, `data_od`/`data_do`.
  Round: `konkurs.nazwa`, `wyniki` (JSON, `Wartosc` per column), `nagroda` + `waluta`.
- owner rule: last competition = newest show with at least one finished round; ELI/REZ
  rounds inside it are still listed.
- board sub-bar on `HorseDetail` still draws "Ostatni start"; code shows price only since E4.20.
- next: three variant boards on the canvas, then stop for the owner's pick.
- canvas version 73: variant boards `LastShowA/B/C.dc.html` at x 6080–11970, y 9900, title note `t4`.
  Pick requested on #190. Build waits for it. After the pick: chosen variant into
  `HorseDetail` + `MobileDetail` (drop sub-bar "Ostatni start"), delete the other boards and `t4`.
