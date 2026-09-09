---
name: verify-phrasing
description: Use this whenever a keyword trigger, activity/cuisine list, or area-matching table in one of this project's data files (restaurants.js, sports.js, sweets.js, transport.js, weather.js, etc.) is added, changed, or a brand-new category file is created — before treating that change as complete. Generates realistic phrasing variations of the underlying concept and tests each one against the real getRelevantX() matcher function, to catch keyword/regex/area gaps before a real visitor hits them.
---

# Verify phrasing coverage

## Why this exists

Every real matching bug this project has hit — cafe/cafes, mithai,
samosa, bare "swim", the Beltola and GS Road/Christian Basti area gaps —
had the same shape: the code only recognized ONE way of asking, and a
completely natural different phrasing returned nothing. Every one of
these was found live, by a real message, after the change had already
been called "done" and (twice) already deployed. A fixed list of test
phrasings can't fully prevent this, since you can't fully anticipate
every way someone phrases something in advance — but generating a wide,
varied batch of realistic phrasings *at the moment of change* and
actually running them against the real matcher catches most of this
class before it ever reaches `npm test` or a live user.

## When to use this

Proactively, without waiting to be asked, whenever you (Claude) are
about to consider a change to any of the following "done":
- A new or edited `TRIGGER` regex (e.g. `WEATHER_TRIGGER`,
  `SWEETSHOP_TRIGGER`, `ACTIVITY_KEYWORDS` entries)
- A new or edited `*_NAME_KEYWORDS` or `AREA_KEYWORDS` table
- A new category file's `getRelevantX()` function
- Any fix to an existing matcher bug (the fix itself needs this same
  stress-test, not just the one reported phrasing)

Also usable on request (e.g. "run verify-phrasing on sports.js's
swimming matching").

## Procedure

1. **Identify the concept and the function.** What real-world thing is
   this matching (e.g. "swimming", "cheap biryani near Ganeshguri",
   "RV rental")? Which exact `getRelevantX()` function and file owns it?

2. **Generate 10-15 realistic phrasing variations**, deliberately
   spanning different angles — do not reuse a fixed list from a past
   run, generate fresh ones matched to the actual concept:
   - Direct / textbook phrasing ("swimming pool")
   - Casual / conversational ("feel like a swim", "fancy a dip")
   - Indirect (implies the concept without naming it — "somewhere to
     cool off", "should I carry an umbrella" for weather)
   - Area-qualified ("pool in GS Road", "biryani near Ganeshguri")
   - Budget-qualified, if the category has one ("cheap", "under 500")
   - Plural vs. singular, and other real word-form variants ("swim" /
     "swims" / "swimming"; "cafe" / "cafes")
   - A named-entity lookup, if the category supports one (a real venue
     name from the data)
   - At least 1-2 deliberately UNRELATED messages (e.g. a message about
     a totally different category), to confirm the matcher stays quiet
     rather than over-firing

3. **Run each variation directly against the real matcher**, e.g.:
   ```
   node -e "
   const { getRelevantSportsFacilities } = require('./sports');
   for (const msg of [/* variations */]) {
     console.log(msg, '->', getRelevantSportsFacilities(msg).length);
   }
   "
   ```
   Never guess what the matcher does — always actually run it, the same
   way every fix this session was verified live rather than assumed.

4. **Flag every unexpected result**: a phrasing that should plausibly
   return real matches but returns `[]`, or an unrelated message that
   unexpectedly returns matches.

5. **For every real gap found**, fix it properly, not just for that one
   phrasing — check the same file's OTHER keyword tables for the
   identical mistake before considering the fix done (this project's
   established practice — the GS Road fix and the Beltola fix were both
   found by proactively re-checking after an initial fix, not by
   stopping at the first one). Follow this project's existing
   conventions: plural-safe patterns (`\bwords?\b`, not `\bword\b`),
   substring-safe canonical area names (prefer a shorter, more general
   canonical output over an over-specific compound one — see the
   Beltola/GS Road fixes for the exact reasoning), and checking sibling
   data files for the same real-world entity before assuming a name is
   new.

6. **Add a permanent regression test** to `test.js` for each real bug
   found and fixed — matching this project's established pattern
   (`REGRESSION (...)`-prefixed test names, asserting the exact
   previously-broken phrasing now returns the exact expected result).
   Don't just fix the code silently; lock the fix in.

7. **Run `npm test`** to confirm the whole suite is still green, not
   just the new cases.

8. **Report a short summary**: how many variations were tried, how many
   real gaps were found and fixed (name them), and confirm the full
   suite passes. If zero gaps were found, say so plainly too — this
   isn't meant to always find something, it's meant to give real
   confidence when it doesn't.

## What this does NOT replace

This only tests the matcher layer (does the right DATA reach the
prompt) — it does not test Gemini's actual reply behavior, which has
its own real randomness (see `test.js`'s own scope note, and
[[feedback-prompt-instructions-need-hard-rule-framing]] /
[[feedback-weather-tool-calling-reliability]] in project memory for
real examples). A live server check is still the right tool for
anything about the model's actual written reply, not this skill.
