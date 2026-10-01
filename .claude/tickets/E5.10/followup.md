# E5.10 — followup

Shipped 2026-09-30. See the last `## Outcome` at the bottom.

Issue [#49](https://github.com/NF-Revolution/hanna-vavilava-site/issues/49) ·
branch `49-e510-monitor-the-enquiry-endpoint`

## 2026-09-30

- Plan 01 is approved. The only blocker, #42, is closed. Nothing here is visible to a visitor, so no board was read.
- Owner decisions:
  - Alerts go to the developer's email. The address is never committed.
  - The owner runs the prod commands by hand.
- Built as planned. `npm run ci` is green, and `npm test` passes 53/53. `ticket-reviewer`: clear.
- A surprise in the test run: the emulator's always-pass Turnstile secret accepts **any**
  non-empty token, not only the dummy one that E5.6's note says. So in the emulator, a
  post with a wrong `X-Probe` meets the full cap (429), not a 403.
- The test proves the Turnstile skip with an empty token instead: a buyer is refused for an
  empty token, and the probe still gets its 303.
- `gcloud` 586 has no `monitoring channels` in GA. The channel command needs `beta`, which
  gcloud offers to install on first use.

## What was built — 2026-09-30

- **Test flag.** `submitEnquiry` takes `X-Probe`, which must equal the `PROBE_TOKEN` secret
  (`isProbe`, `timingSafeEqual`). The probe runs the same handler:
  - It still meets the 405 check, the per-IP limit, the traps and the parse.
  - It skips the Turnstile verdict and the global 20/h cap.
  - Its sinks go to throwaway targets: `set` on `/monitor/enquiry`, Resend's
    `delivered@resend.dev`, and Telegram's `getChat`.
- **Turnstile secret.** `human()` logs siteverify's `*-input-secret` error codes as
  errors. The probe posts the token `probe`, so a bad secret shows up every day.
- **`enquiryProbe`.** A scheduled Function at 07:00 Europe/Warsaw, in `europe-central2`. It
  POSTs a fixed urlencoded enquiry to `https://hanna-vavilava-site.web.app/api/enquiry`,
  and logs an error on anything but a 303.
- **Monitoring.** `monitoring/uptime.policy.json` alerts when more than one region fails.
  `monitoring/errors.policy.json` is a log-match on `severity>=ERROR` from `submitenquiry`
  or `enquiryprobe`. The `functions/index.js` header has the commands for the secret, the
  email channel, the uptime check (GET, 405, every 15 min), the policies, and a manual run.
- **Tests.** `functions/.secret.local` has an emulator `PROBE_TOKEN`. A new test covers:
  - a wrong secret meets the cap;
  - the right secret gets a 303 with or without a token;
  - `/monitor/enquiry` is written and `/enquiries` is not.

## Outcome — 2026-09-30

- **Approach:** a secret-gated test flag on the real handler, a daily probe from Cloud
  Scheduler through the Hosting rewrite, and Cloud Monitoring for the uptime check and for
  mailing every error to the developer.
- **Rejected:**
  - A GitHub Actions cron: GitHub disables it after 60 quiet days on a public repo.
  - A POST from the uptime check: about 300 a day, over the Resend quota.
  - Test messages in Hanna's Telegram.
  - A separate code path for the probe.
- **Traps for next time:**
  - Set `PROBE_TOKEN` before `submitEnquiry` or `enquiryProbe` deploys.
  - The probe cannot pass a real Turnstile challenge, so a sitekey or hostname mismatch
    (E5.6) stays invisible. Only a bad secret is caught.
  - Every logged error from the two services now sends mail. A new `logger.error` in
    `submitEnquiry` is an alert, so keep it for real failures.
  - Nothing is live until the owner runs the header commands.
  - The Cloud Scheduler job is `firebase-schedule-enquiryProbe-europe-central2`.
  - Since E5.7 (#133), every refusal is a 303 to the not-sent page, so the status code
    proves nothing. The probe passes only on a `Location` of `/zapytanie/wyslane#…`.
    A trap's 303 carries no `#`, so it fails too.
