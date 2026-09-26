---
name: spike
description: >
  Investigate whether something is possible and how, then file the findings as a spike
  issue so the approach can be chosen later. Use whenever the user asks to investigate,
  spike, research or check feasibility — "can we pull X from Y", "is it possible to
  automate Z", "investigate how we could...", "spike this", "what are our options for...".
  Also use when a build ticket turns out to have no chosen approach. This skill owns how
  the options are probed and how the spike issue is shaped; the `ticket` skill still owns
  title, milestone and label conventions.
---

# Spikes

A spike answers "can we, and how?" with evidence, and ends as an E0 decision ticket. It
writes no code, opens no branch and no pull request, and keeps no `.claude/tickets/` folder —
the issue is the record. The build ticket comes after the decision, not before.

## Steps

1. **Search for a duplicate** — `ticket` skill, "Creating one" step 1.
2. **Frame it from the repo.** Find the real fields, files and pipeline the answer touches
   (grep for them, cite `path:line`) and the constraints from `AGENTS.md` it has to live with —
   static build, no client JavaScript, bilingual text, what already runs where.
3. **Probe for real**, read-only, in the scratchpad: `curl` the page, read the JS bundle for
   API endpoints, call the API, count the rows. An option is "verified" only when a probe
   returned real data; everything else is written "not tried" or "unverified". Never mark an
   option as working from memory or from what a site looks like in a browser.
4. **Write the findings** — normal English, other people read it months later:
   - What the source actually serves, with a copy-pasteable reproduce command and a sample.
   - Traps the probe exposed: missing stable ids, pagination or per-year limits, odd rows,
     auth, terms of use. These are the valuable lines; state each one concretely.
   - Options on two axes when they are independent — _where the data comes from_ and _where
     the job runs_ — one table each, with status, effort, for and against.
   - What every option needs regardless (schema field, formatting rule).
   - One recommendation, the laziest option that holds up. Not a survey with no answer.
   - Numbered questions for the owner — the rules only they can set.
5. **File it** with the `ticket` skill as an E0 decision ticket: title
   `E0.<n> · Spike: <question>`, milestone `E0 · Decisions`, label `epic:e0`. The body is the
   question, why it matters and the constraints — one paragraph, **no checklist**. The findings
   go in the **first comment**, headed `### Spike findings`, because the body is what the ticket
   is and comments are how it went.
6. **Report** the number, the URL, the recommendation and the owner questions, in a few lines.

After that the `ticket` decision ritual takes over: the owner's answers, a `**Decided: ...**`
comment, a build ticket in the right epic, then the close.

## Rules

- **The repo is public.** Never paste a secret, token or third-party key into an issue, even
  one that ships in someone's public bundle — give the command that reads it instead.
- Probe gently: a handful of requests, a browser user agent, nothing in a loop.
- A probe that fails is a finding. Write down the status code and the error text.
