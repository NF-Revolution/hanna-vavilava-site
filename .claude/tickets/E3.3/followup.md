# E3.3 · Hero player

Open.

## 2026-09-25

- Blockers #26 and #12 are closed. The approach comment was posted on #27 before any code.
- Boards read: Main and MobileHome. They draw a sound toggle, but E3.2 stripped the hero's audio, so this ticket adds the audio back to the encode.
- Built the player, the `hero` keys in `src/media.ts`, `home.soundOff`, and the hero audio in `scripts/video.mjs`. `npm run ci` is green with `hero = null`.
- The encode was checked with `--no-upload` on a synthetic lavfi clip. The MP4 carries h264 + aac, and the WebM carries vp9 + opus.
- No local playback test: serving the test files on localhost was refused by the permission classifier.
- Next: a markup check with a temporary poster, then the artboard sound-on state, README, the reviewer, and the pull request.
