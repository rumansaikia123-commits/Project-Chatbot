# Project Chatbot — Build Plan (Guwahati Tourism Guide)

## Phase 1: Backend setup
- [x] Set up the Node.js project (creates `package.json`, the file that tracks which packages we use)
- [x] Install packages: `express` (runs the backend server), `@google/genai` (talks to Gemini — switched from Claude to keep this free), `dotenv` (loads your secret key from `.env`)
- [x] Write `server.js` — a small server with one job: receive a message from the chat box, send it to Gemini along with the Guwahati-guide instructions, send the reply back
- [x] Write the chatbot's "system prompt" — instructions that make it a Guwahati-only guide (declines off-topic questions like Mumbai/Delhi), refined/classy tone, follow-up-aware, with a placeholder section for curated local tips

## Phase 2: Frontend (the webpage)
- [x] Build `public/index.html` — the chat page structure
- [x] Style it (`public/style.css`) — full-page night photo of Guwahati as background, glassy chat card, gold accents, elegant serif title
- [x] Write `public/script.js` — handles typing a message, showing the conversation, calling the backend, remembering messages during the visit

## Phase 3: Connect and test locally
- [x] Add your real Gemini API key to `.env` (you did this step directly — never pasted in chat)
- [x] Run the server locally and test in the browser: Guwahati questions, itinerary requests, off-topic refusal, and follow-ups all confirmed working
- [x] Fixed along the way: outdated model names (both `claude-sonnet-4-5` and later `gemini-2.5-flash`) corrected to the current live model

## Phase 4: Save progress
- [x] Commit the working chatbot to git
- [x] Push to the `Project-Chatbot` GitHub repo

## Pre-release audit fixes (all verified working via live tests)
- [x] Server now uses `process.env.PORT` so it works on real hosting (was hardcoded to 3000)
- [x] Malformed/invalid requests now return a clean error instead of leaking server file paths
- [x] Missing/empty messages return an accurate `400` error instead of a misleading 500
- [x] Added a response length limit (`maxOutputTokens`) to keep replies concise and cost predictable
- [x] Pinned required Node.js version (`>=20.0.0`) in `package.json` for reliable hosting
- [x] Fixed `package.json`'s `"main"` field to point at the real entry file (`server.js`)

## Mobile testing (real headless-browser test, not just code review)
- [x] Confirmed no horizontal overflow, header fits on one line, touch targets sized well, and a live message sends/receives correctly at a 375x667 (iPhone SE) screen
- [x] Fixed: welcome message showed a broken line mid-sentence (caused by `white-space: pre-wrap` preserving the HTML file's own indentation)
- [x] Fixed: the bot's `**bold**` text and lists showed raw asterisks instead of real formatting — now safely rendered (HTML-escaped first, so this can't be used to inject real code)

## Real-world bug fix: long replies were cutting off mid-sentence
- [x] Root cause found via live API test: `gemini-3.6-flash` does an invisible "thinking" step that was eating almost the entire 800-token reply budget, and its free tier only allows 20 requests/day — far too limited for real use
- [x] Switched to `gemini-3.5-flash-lite` (no invisible thinking step, much more generous free daily quota) and raised the reply budget to 2048 tokens
- [x] Verified with a live 5-day-itinerary request: full, natural, uncut reply (confirmed via `finishReason: STOP`)
- [x] Also fixed while testing: the bot's `### headings` and `* bullet` markdown showed as raw symbols on longer, more structured replies — now rendered as real formatting (still HTML-escaped first, so this can't be used to inject code)
- [x] Confirmed on-topic/off-topic behavior unaffected by the model switch

## Phase A: "Live updates" (v2 planning)
- [x] Tried Google Search grounding (fully automatic web search) — found it requires a linked Google Cloud billing card even to use its free quota, which conflicts with staying card-free, so we're not using it
- [x] Built a proper manual-update system instead: `systemPrompt.js` now has a structured, editable section (new openings, events, personal recommendations, last-updated date) that's treated as more trustworthy than the AI's general knowledge
- [x] Verified the AI never leaks the internal "not yet updated" placeholder text to visitors, and honestly hedges when it doesn't have current info
- [ ] You periodically fill in real updates as you learn about them (then push + Manual Deploy on Render to go live)
- [x] Added real date-awareness: the server tells Gemini today's actual date (India time) on every request, since it has no built-in sense of "today" — verified it correctly identifies the current season and whether curated events are still upcoming or already past
- [x] Added first real curated entry: Guns N' Roses live in Guwahati, Nov 17 2026 at Khanapara Veterinary Ground (cross-checked across multiple news sources)

## Nightlife venue directory (structured "mini RAG" via keyword filtering)
- [x] Researched 25 real Guwahati nightlife venues across getoutnight.com and Zomato, cross-checked each against at least one independent source (TripAdvisor/Zomato/restaurant-guru/etc.)
- [x] Built `venues.js` — structured data with area, tags (clubbing/rooftop/live-music/lounge-bar), and notes per venue; low-confidence picks flagged explicitly
- [x] Built keyword-based filtering (`getRelevantVenues`) — only sends the venues relevant to what was actually asked, instead of the whole list every time (keeps replies focused and token usage low)
- [x] Verified filtering rules exactly match spec: "club" → clubbing only, "rooftop" → rooftop only, general "bar"/"lounge" → rooftop + lounge-bar combined, all under one nightlife umbrella
- [x] Verified live: "best place to party," "pubs with live music," "rooftop bar," and "nightclubs" all return correct, real, relevant venues; unrelated questions (e.g. about Kamakhya Temple) correctly return none
- [x] Fixed a real bug caught live: the AI was blending in unverified venues (e.g. EXORO, Terra Mayaa) from its own general knowledge alongside our researched list for a strict "clubbing" question — instruction now explicitly limits it to ONLY the provided list, verified fixed
- [x] Added "alcohol" as a direct keyword trigger
- [x] Added conversational handling for vague requests like "planning a night out" — the chatbot now asks a clarifying question (cruise vs. dinner vs. bar/club scene) instead of assuming nightlife, and only surfaces real venues once the visitor's follow-up actually signals drinks/bars/clubs — verified live across a full two-turn conversation

## Phase B: Accounts + database (not started)
- [ ] Real "Sign in with Google" login via Supabase (free tier, avoids us ever handling passwords ourselves)
- [ ] Per-person saved chat history

## Bug fixes found in live QA review (2026-09-01)
- [x] `server.js`: a chat message missing/blank `content` currently reaches the
      Gemini SDK, throws there, and gets mislabeled as "Something went wrong
      talking to Gemini." Added up-front validation so this returns a clear
      400 "invalid message format" error instead. Verified locally: missing
      `content` and blank `content` both now return the new 400 error; a
      normal valid message still gets a real Gemini reply.
- [x] `venues.js`: keyword regexes for `gig`, `chill`, `drink`, `party` had no
      word boundaries, so they matched inside unrelated words (e.g.
      "gigabyte", "chilli"). Added a `\b` word-start boundary to `drink`/
      `party`, and a negative lookahead on `gig`/`chill` so they don't match
      inside "gigabyte"/"chilli" while still matching "gigs", "chilling",
      etc. Verified with 6 test phrases (real nightlife questions, "gigabyte
      internet speed", "chilli souvenir") — all matched as expected.
- [x] Commit and push, then manually deploy on Render.

## Food & restaurant recommendation directory
- [x] Compiled and deduplicated 30 real Guwahati restaurants from Zomato
      CSV/PDF sources; resolved conflicting rating/cost data by preferring
      the cleaned PDF source; reconciled Terra Mayaa, The Maroon Room, and
      Abacus Brewing Co & Kitchen (all three already exist in venues.js as
      nightlife venues) to use their existing venues.js rating/area, so
      they show the same numbers regardless of which feature answers
- [x] Built `restaurants.js` — structured data with area, cuisines,
      costForTwo (INR, or null when no source had a cost), rating, and
      optional highlight/address per restaurant
- [x] Built keyword-based filtering (`getRelevantRestaurants`) — detects
      food-related questions, extracts cuisine/budget/area signals from
      free text, combines matched filters with AND logic (unlike
      nightlife's OR-of-tags, since a food request usually wants the
      intersection of what was actually asked for); vague food questions
      return no data so the bot asks a clarifying question instead of
      guessing
- [x] Extended `systemPrompt.js` with `formatRestaurantList()` and a
      matching guardrail — Gemini may only recommend restaurants from this
      hand-verified list, mirroring the nightlife feature's "don't
      hallucinate others" instruction
- [x] Wired into `server.js`: `getRelevantRestaurants(latestUserMessage)`
      computed alongside `getRelevantVenues`, both passed into
      `buildSystemPrompt`
- [x] Verified with direct `getRelevantRestaurants()` calls: cuisine-only,
      budget-only, location-only, and combined queries all return correctly
      filtered restaurants; non-food and food-adjacent-but-unrelated phrases
      ("budget hotel", "cheap flight") correctly return none
- [x] Verified live: "Chinese food near Six Mile" correctly recommends
      Confucius with real rating/cost; a vague "where should I eat tonight?"
      gets a clarifying question, not a guess; a two-turn conversation
      (vague → clarified with cuisine/budget/area) correctly narrows down;
      a query with no verified match ("cheap North Indian near Khanapara")
      gets an honest "no verified match" reply instead of a hallucinated
      one; existing nightlife behavior (e.g. "best rooftop bar") confirmed
      unaffected; Terra Mayaa shows the same 4.1★ rating whether asked
      about as food or nightlife

## Cafe data added to the food directory
- [x] Compiled 27 unique cafes from a dedicated "best cafes" PDF (28 rows,
      1 internal duplicate removed); skipped 2 names already in
      `restaurants.js` (Lush - The Café, 11th Avenue Cafe Bistro) rather
      than re-litigating their already-resolved data; converted the
      source's cost ranges (e.g. "1000-1500") to a single midpoint number
      to fit the existing `costForTwo` field
- [x] Added Leaf Deck Café Bar to both `restaurants.js` (cafe) and
      `venues.js` (nightlife, lounge-bar tag) since it's genuinely both;
      kept Guwahati Heights cafe-only since it doesn't serve alcohol
      despite having live music/karaoke
- [x] Extended `CUISINE_KEYWORDS` (Irish, Mediterranean, Bakery) and
      `AREA_KEYWORDS` (Machkhowa, Chandmari, Rajgarh, Fatasil Hills,
      Kharghuli Hills, Borbari, Latasil) to cover this data's new terms
- [x] Fixed a real bug caught during testing: the merged
      `dighalipukhuri|uzan bazar` area-keyword row mapped both to the
      single canonical name `'Dighalipukhuri'`, so substring matching
      silently failed for any restaurant whose area said "Uzan Bazar"
      without literally containing the word "Dighalipukhuri" (true for
      most of the new cafes) — split into two independent rows
- [x] Fixed a second real bug caught during testing: `\bcaf[eé]\b` never
      matched the plural "cafes" (the trailing `\b` fails right after
      "cafe" since "s" is still a word character) — this silently broke
      the very first natural test query ("cafes in Uzan Bazar"). Changed
      to `\bcaf[eé]s?\b` in both `FOOD_TRIGGER` and the cuisine keyword
      table; fix verified against both singular and plural phrasing
- [x] Verified with direct `getRelevantRestaurants()`/`getRelevantVenues()`
      calls and live server tests: cafe+area, cafe+budget+area, a new
      cuisine (Irish), and Leaf Deck Café Bar surfacing correctly from
      both the food angle and the nightlife angle; confirmed Lush and
      11th Avenue Cafe Bistro still show their original, untouched numbers
- [x] Observed (not a bug, not fixed): the same exact system prompt
      occasionally gets an overly-cautious "I don't have verified data"
      reply from Gemini even when the correct data is present — confirmed
      via repeated direct API calls with an identical prompt (some calls
      correct, some not). This is `gemini-3.5-flash-lite`'s own response
      randomness, a pre-existing characteristic of this free-tier model
      choice, not something this change introduced or something fixable
      in our own code

## Bug fix: real conversation losing food/nightlife data mid-chat (2026-09-01)
- [x] Root cause found from a real user transcript: `server.js` only ever
      looked at the visitor's single latest message to decide which
      venues/restaurants to inject that turn. A natural short follow-up
      like "any location," "both," or "give me a list" doesn't repeat any
      food/nightlife keyword, so on those turns the real data was silently
      dropped — and the bot then (correctly, given what it was told) said
      it had no verified list to share, even though the topic (e.g.
      "coffee") was clearly still the same conversation
- [x] This was NOT the `gemini-3.5-flash-lite` randomness noted above —
      confirmed by directly calling `getRelevantRestaurants()` on each of
      the real transcript's messages: the "coffee" and "cafes in guwahati"
      messages matched 27 cafes each, while "any location"/"both"/"give me
      a list of places" matched zero every time, deterministically
- [x] Fixed in `server.js`: instead of only the latest message, keyword
      matching now runs against all of the visitor's messages so far in
      the conversation joined together, so a topic established earlier
      stays available through short follow-ups. No changes needed in
      `venues.js`/`restaurants.js` — both already take a plain string
- [x] Verified: replayed the exact real transcript ("where do I get best
      coffee" → "any location" → "both" → "Give me list of places")
      against the live local server — every turn now gets real cafe data
      and the bot no longer claims it has nothing verified to share;
      confirmed the same fix also keeps nightlife follow-ups (e.g.
      "best rooftop bar" → "something cheaper") working; confirmed that
      switching to a genuinely unrelated topic (Kamakhya Temple) after a
      cafe question still gets a clean, on-topic answer with no stray cafe
      mentions — stale context doesn't force bad behavior, it just no
      longer disappears when it's still needed

## Bug fix: "bars"/"pubs"/"lounges" (plural) matched nothing (2026-09-01)
- [x] Reported by the user from a real screenshot: asking about "restaurants
      and bars" got "I don't have any specific venues to recommend." Root
      cause: `venues.js`'s nightlife regex used `\bbar\b`, `\blounge\b`,
      `\bpub\b` — the trailing `\b` fails right after "bar" when "s"
      immediately follows, so the plural forms (the most natural way to
      ask) matched zero, every time. Singular forms worked fine. Same class
      of bug as the earlier "cafes" fix, just never applied here
- [x] Fixed: `\bbars?\b|\blounges?\b|\bpubs?\b` in `venues.js`. While
      auditing for the same mistake elsewhere, also fixed plausible-plural
      cuisine keywords in `restaurants.js` (pizza/pizzas, pasta/pastas,
      dosa/dosas, idli/idlis, biryani/biryanis, buffet/buffets, bbq/bbqs)
- [x] Verified directly: "bars"/"lounges"/"pubs" all now match (previously
      0, now correctly matching real venues); singular forms and existing
      matches unaffected
- [x] Separately found while testing (not a code bug): the same exact
      request, with correct data confirmed present in the prompt, still got
      an incorrect "no data" reply from Gemini a large fraction of the
      time. Traced this to `gemini-3.5-flash-lite`'s default response
      randomness — confirmed via controlled side-by-side testing (identical
      prompt, only the `temperature` setting changed): near-total failure
      at the default temperature, reliably correct at `temperature: 0.2`.
      Added `temperature: 0.2` to the `generateContent` call in `server.js`
- [x] Also strengthened the wording in `systemPrompt.js` so the nightlife
      and restaurant "if this list is empty" guardrails are explicit that
      they're independent of each other (a visitor can ask about both
      "restaurants and bars" at once; an empty restaurant list — e.g.
      because it was too vague to narrow down — must not make the model
      withhold the separate, non-empty nightlife list)
- [x] Testing note for future sessions: repeated "server restarts" during
      this session's debugging silently failed to actually kill the old
      process (`Stop-Process` reported success but the original process,
      running since the session's first server start, was still the one
      answering every request) — several rounds of confusing test results
      were actually the OLD code answering, not the fix. Confirmed via
      `Get-Process -Id <pid> | Select StartTime` showing the "new" process
      was hours old. Fixed by using `taskkill /PID <pid> /F` instead and
      verifying the process list is empty before restarting. Worth
      remembering: always confirm a server was actually restarted (new PID,
      recent start time) before trusting a "no change" test result
- [x] Full regression sweep against a genuinely fresh server process: the
      original failing message, the multi-turn coffee transcript, and an
      existing cuisine query all still work correctly
- [x] Honest limitation, not fully solved: even after all of the above, this
      specific compound phrasing ("restaurants AND bars" together, with a
      typo in the same message) still occasionally gets a suboptimal reply
      from Gemini. `temperature: 0.2` measurably improved reliability a
      lot, but didn't make it perfect — this is inherent variability in the
      free-tier "lite" model, not something further fixable in our own code
      without changing which model is used

## Fix: generic restaurant/cafe questions got stonewalled (2026-09-01)
- [x] Reported live: "Top rated bars and restaurants in Guwahati?" got a
      real answer for bars but a non-answer for restaurants ("my curated
      list of restaurants is currently taking a little break"), with no
      actual follow-up question asked. Root cause: a real design asymmetry,
      not a bug in either feature alone — `venues.js` has no "vague" gate
      (a broad "top rated bars" already returns every matching venue
      immediately), while `restaurants.js` deliberately returned `[]` for a
      fully generic food question so the bot would ask a clarifying
      question — but in practice, inside a compound question that also had
      a real nightlife answer, it wasn't reliably asking that follow-up
- [x] Fixed by making restaurants behave like nightlife already does:
      `getRelevantRestaurants` no longer returns `[]` for a broad/generic
      food question. Instead it applies whatever filters were actually
      given (possibly none), then always sorts by rating and caps at the
      top 10 — so "top rated restaurants" now returns the 10 highest-rated
      restaurants overall, and "top rated cafes" (or just "cafes") returns
      the top 10 cafes specifically, both with real data, immediately.
      Narrow queries (e.g. "Chinese food near Six Mile", 1 result) are
      unaffected since sorting/capping a short list is a no-op
- [x] Updated the restaurant guardrail in `systemPrompt.js` to match: it no
      longer tells Gemini to ask a clarifying question for a vague food
      request (that state doesn't exist anymore — a "vague" request now
      arrives with 10 real top-rated entries), and the "if this list is
      empty" explanation now only says "wasn't about food" instead of also
      mentioning vagueness, since vagueness alone no longer produces an
      empty list
- [x] `venues.js` and the nightlife guardrail were left untouched — that
      side already behaved the way restaurants now does
- [x] Verified directly: "top rated restaurants" → 10 results sorted by
      rating; "top rated cafes" → 10 results, all cuisine `Cafe`, sorted by
      rating; narrow queries and non-food queries unaffected
- [x] Verified live against a genuinely fresh server process (confirmed by
      PID/start time this time): replayed the exact reported message and
      got a full, real answer for both restaurants and bars in one reply;
      "top rated cafes" alone also verified; regression-checked "best
      bars" (nightlife-only), a narrow cuisine+area query, and the
      multi-turn coffee conversation from the earlier fix — all still work

## Learning project: structured output for restaurant recommendations (plan only — not started)
Goal: learn "structured output" — instead of Gemini writing restaurant
recommendations as a sentence (which the frontend then guess-formats with
`**bold**`/`* bullets`), ask Gemini to fill in a strict JSON template
(name, area, rating, cost, etc. as real data fields), then render that as
actual visual cards. Scoped to restaurants only for this first pass —
nightlife venues stay as plain text for now.

- [x] Checked the installed `@google/genai@2.19.0` package's real type
      definitions (`node_modules/@google/genai/dist/genai.d.ts`) before
      writing any schema, rather than guessing — confirmed
      `responseMimeType`/`responseSchema` on `GenerateContentConfig`, the
      `Schema` interface's exact shape, and that `Type` (STRING/NUMBER/
      ARRAY/OBJECT/etc.) is a real importable runtime value, not just a
      TypeScript type. Verified with a live throwaway test call before
      touching any real code — got back exactly the requested JSON shape
- [x] Designed the schema: a `reply` string (normal conversational text —
      greetings, itinerary advice, clarifying questions, and nightlife all
      still work exactly as before) plus a `recommendations` array (empty
      unless the reply is recommending restaurants; each entry: name, area,
      cuisines, rating, costForTwo, highlight)
- [x] `server.js`: added `CHAT_RESPONSE_SCHEMA`, wired `responseMimeType:
      'application/json'` + `responseSchema` into the Gemini call, parse
      `response.text` as JSON with a try/catch fallback (raw text +
      empty recommendations) if parsing ever fails, send
      `{ reply, recommendations }` to the frontend instead of just `{ reply }`
- [x] `systemPrompt.js`: reworded the restaurant guardrail for the new
      format — populate `recommendations` using ONLY entries from the
      provided list, copying name/area/cuisines/rating/cost exactly rather
      than describing them in prose; empty `recommendations` still means
      "leave restaurants out," same guardrail as before, different field
- [x] `public/script.js`: added `addRecommendationCards()`, built with
      `createElement`/`textContent` (no `innerHTML`) for safety, called
      after showing the reply whenever `data.recommendations` is non-empty
- [x] `public/style.css`: added `.recommendation-card` styles reusing the
      page's existing gold/cream/dark-glass theme variables (gold left
      border, star rating in gold, italic highlight text)
- [x] Bug found and fixed during testing: the pre-existing "If this list is
      empty, it means the question wasn't about food" guardrail wording
      (accurate before, since an empty list only ever meant "not food")
      started causing real, reproducible harm once structured output was
      introduced — a genuinely on-topic but unmatched query ("cheap North
      Indian near Khanapara") got the OFF-TOPIC decline template instead of
      an honest "no verified match, here's general advice" answer,
      confirmed 3/3 reproducible. Reworded to explicitly distinguish
      "not about food" from "about food, no verified match for this
      combination" and instruct the model to stay helpful in the latter
      case. Reverified 3/3 correct afterward
- [x] Verified end-to-end, including a real headless-browser screenshot
      test (Playwright, since no `chromium-cli`/project run-skill existed —
      installed Playwright to a scratch directory, not the project, for
      this one-off check): a single-recommendation query renders one
      correctly-styled card (name, gold star rating, cost, area, cuisines,
      italic highlight); a broad query ("top rated cafes") renders multiple
      cards stacked cleanly with no overflow or misalignment; zero browser
      console errors in either case. Also verified via direct API calls:
      general conversation and nightlife questions still return normal
      prose with an empty `recommendations` array; a genuinely off-topic
      question ("capital of France") still declines correctly; the
      "only recommend from our verified list" guardrail holds

## Extended structured output to nightlife venues (cafes already covered)
- [x] Cafes needed no new work — they're just restaurants with
      `cuisine: 'Cafe'`, already flowing through `restaurantRecommendations`
- [x] `venues.js`: added real `rating`/`costForTwo` fields to all 26
      entries (previously embedded in free-text `notes`, e.g. "...4.8★,
      ~₹2,500 for two"), extracted by hand from the existing text; renamed
      `notes` to `highlight` to match `restaurants.js`'s naming. `rating`
      left `null` for venues that never had one in the source data rather
      than inventing a number (several: Shanghai Salsa, The Lounge -
      Dynasty, NYX Lounge and Deck, The Locals, The Vibe House, Olive
      Garden, Elevate Bar & Bistro, The Root Barrel, The Socialite, 188
      Downtown, Trafik Lounge Bar & Restaurant)
- [x] `systemPrompt.js`: `formatVenueList` updated to show the new
      rating/cost fields; response now has three parts (`reply`,
      `restaurantRecommendations`, `nightlifeRecommendations`) instead of
      two; nightlife guardrail reworded to populate
      `nightlifeRecommendations` the same way the restaurant one populates
      its array, including "rating may be null, that's expected" guidance
- [x] `server.js`: `CHAT_RESPONSE_SCHEMA` renamed `recommendations` to
      `restaurantRecommendations` and added a parallel
      `nightlifeRecommendations` array (fields: name, area, tags, rating
      [nullable], costForTwo [nullable], highlight); response to the
      frontend now sends both arrays
- [x] `public/script.js`: `addRecommendationCards` generalized to take a
      `tagField` parameter ('cuisines' or 'tags') so one function renders
      both card types instead of duplicating it; handles `rating: null` by
      showing "unrated" instead of a blank/broken star
- [x] Verified with direct API calls: nightlife-only query returns real
      structured venues; restaurant-only query still works (regression);
      a compound query ("top rated bars and restaurants") returns BOTH
      arrays populated with real data in a single response — this is the
      exact scenario that used to stonewall on the restaurant half in an
      earlier session, now fully fixed by construction since both
      categories are independent structured fields; a query surfacing an
      unrated venue (NYX Lounge and Deck, The Locals) correctly returns
      `rating: null`
- [x] Verified visually with real headless-browser screenshots (Playwright,
      scratch install, not a project dependency): nightlife-only cards
      render correctly including the "unrated" fallback; a two-message
      conversation (nightlife query then compound query) renders 9 cards
      total across both categories in sequence, correctly styled, zero
      browser console errors in either case

## Bug fix: multi-part requests starved of options (2026-09-01)
- [x] Reported live with a screenshot: "Plan a cafe for breakfast, a
      restaurant for lunch and a club for dinner" got only cafes for the
      restaurant list, and the bot said it had no "traditional restaurant"
      for lunch. Root cause confirmed via direct testing: the word "cafe"
      matched the Cafe cuisine, which then narrowed the ENTIRE candidate
      pool to cafe-only restaurants — genuinely zero non-cafe options were
      ever handed to the model, so its answer was honest given what it had
- [x] Considered a broader fix (splitting compound "X for breakfast, Y for
      lunch" messages into separate matched requests) but scoped down to a
      narrower, safer fix per discussion: "cafe" is the one cuisine word
      that in casual speech usually implies "not a regular restaurant"
      (unlike e.g. "Chinese restaurant," where the words reinforce each
      other). Only when Cafe is the SOLE matched cuisine and the generic
      word "restaurant" also appears, the cuisine filter is now skipped so
      the full top-rated pool is available instead of cafe-only
- [x] Verified the fix doesn't regress the cases it could plausibly break:
      "Chinese restaurant" still narrows to Chinese only; a plain "cafes
      nearby" query still narrows to cafes only; "cafe or Chinese food"
      (two cuisines matched, not just Cafe) is unaffected since it never
      hit the narrow condition; "cafes in Uzan Bazar" (no "restaurant"
      word) still narrows to cafes
- [x] Verified live: the exact reported message now gets a real, sensible
      plan — a cafe for breakfast, a genuine non-cafe restaurant (Urban
      Desi Kitchen) for lunch, and a dual-listed venue for dinner that
      correctly appears in both restaurantRecommendations and
      nightlifeRecommendations since it fits both "restaurant" and "club"

## Stress-tested the fix with varied phrasings, found and fixed the same bug in 3 more cuisines
- [x] Ran ~14 made-up questions covering: paraphrases of the original bug
      ("coffee shop for breakfast and a restaurant for dinner", etc.),
      sightseeing combos (temple + restaurant, zoo + breakfast, river
      cruise + dinner, shopping + cafe, temple + zoo + cafe + restaurant),
      and deliberately probing whether other "shop-like" cuisines had the
      identical starvation bug as Cafe
- [x] All cafe/restaurant paraphrases and sightseeing combos: correct —
      real non-cafe restaurant options present every time. "Shopping at
      Fancy Bazaar then a cafe" correctly returned zero (genuinely no cafe
      located in that area — not a bug)
- [x] Found: the exact same starvation bug also existed for Mithai
      ("sweet shop"), Bakery, and Street Food — e.g. "bakery in the
      morning and a restaurant for dinner" returned only 2 matches, both
      bakery-tagged, zero real restaurants, identical root cause to the
      Cafe bug just never generalized to these
- [x] Found a second gap while fixing it: "sweet shop for dessert and a
      restaurant for dinner" matches BOTH Mithai ("sweet") and Bakery
      ("dessert") simultaneously, so the original `size === 1` check never
      fired for it even after adding Mithai to the shop-like set. Changed
      the condition from "exactly one shop-like cuisine matched" to "every
      matched cuisine is shop-like" so multi-shop-cuisine combinations are
      covered too
- [x] Verified the broadened fix doesn't regress: "Chinese restaurant"
      still narrows to Chinese; "cafe or Chinese food" (a real specific
      cuisine mixed with a shop-like one) still narrows via the normal
      OR-match, unaffected; plain "cafes"/"bakery"/"street food" queries
      with no "restaurant" word still narrow correctly; "buffet
      restaurant" still narrows to Buffet (Buffet isn't shop-like — buffet
      implies a full restaurant, not a quick-bite shop)
- [x] Verified live: zoo+breakfast, temple+restaurant, and the sweet-shop
      case all produce natural, correct replies — real non-shop restaurant
      options present, and for the sweet-shop case the bot honestly says
      it has no verified sweet shop while still recommending bakeries for
      dessert and real restaurants for dinner, instead of stonewalling

## Bug fix: stale topic bled into unrelated replies for the rest of the conversation
- [x] Reported live with a real 8-turn transcript: after "a cup of coffee"
      in turn 1, the bot kept recommending Daphne's Cafe in replies to
      "sightseeing" (turn 5), "location to travel in the evening" (turn 6),
      and "for sightseeing sunset" (turn 8) — none food-related
- [x] Root cause: the earlier fix that combined ALL user messages in a
      conversation (to fix short follow-ups like "any location" losing
      context) had no upper bound — a keyword mentioned once stayed
      "active" for the rest of the conversation, no matter how many
      unrelated turns followed
- [x] Fixed in `server.js`: bounded `allVisitorText` to the last 4 user
      messages instead of the entire conversation. Chose 4 specifically
      because it's the smallest window that still satisfies BOTH real
      transcripts on record: the original "coffee -> any location -> both
      -> give me a list" case (needs turn 1's context to survive 3
      follow-ups) and the newly reported case (needs turn 1's context to
      stop mattering by turn 5)
- [x] Verified directly against both full transcripts: original case still
      shows 10 matches at every turn through turn 4; new case correctly
      drops to 0 matches starting exactly at turn 5, matching where the
      real bug was observed
- [x] Verified live: replayed the reported transcript through turn 5
      against the real server — `restaurantRecommendations` is empty and
      the reply is genuinely about sightseeing (Kamakhya Temple, sunset
      cruise) with no stray cafe mention; nightlife follow-up regression
      ("best rooftop bar" -> "something cheaper") still works correctly
- [x] Answered a direct question from the user: yes, the agreed next
      learning step (function calling) would address this whole bug class
      more robustly than any windowing heuristic — if Gemini decides for
      itself when to call a search tool, it uses its own understanding of
      the conversation instead of us guessing relevance from raw keyword
      matching. Documented as a reason to prioritize it, not a reason to
      skip this fix

## Added a fourth category: parks (structured, activity-matched)
- [x] Compiled all 17 real Guwahati parks from `guwahati_parks_directory_v2.pdf`
      into `parks.js`, following the exact restaurants.js/venues.js
      pattern: name, area, activities (canonical tags derived from the
      PDF's "Used For" column), daysOff, entryFee, highlight
- [x] Two deliberate schema differences from restaurants/nightlife, since
      the source data doesn't support them: no `rating` field at all (no
      star ratings in the PDF), and `entryFee` stays a descriptive string
      rather than a clean number (real entries have free-entry time
      windows and senior/child exemptions that a bare number would lose)
- [x] Built `getRelevantParks()` — matches by activity (boating, walking,
      jogging, birdwatching, photography, sunset, river-view, heritage,
      etc.) and area, same AND-combining approach as restaurants; added a
      dedicated "open every day" filter (`daysOff === 'None'`) since that
      was one of the user's explicit example queries, not left to chance
- [x] `server.js`: added `parkRecommendations` as a fourth array to
      `CHAT_RESPONSE_SCHEMA` (no rating/costForTwo fields, matching the
      data); wired `getRelevantParks(allVisitorText)` alongside the other
      two categories
- [x] `systemPrompt.js`: `formatParkList()` + a guardrail paragraph
      mirroring the existing pattern, with one addition — explicitly tells
      Gemini not to invent or apologize for a missing rating, since parks
      genuinely don't have one; vague park questions ("tell me about
      parks") get a clarifying question instead of a rating-less top-N
      dump, since there's no rating to sort a "top rated" fallback by
- [x] `public/script.js`: generalized `addRecommendationCards` to detect
      `entryFee` on a recommendation and show an entry-fee + open/closed-day
      row instead of the usual rating + cost row, rather than writing a
      separate near-duplicate render function
- [x] Verified with direct `getRelevantParks()` calls: "where can I go
      boating" → Dighalipukhuri Park only; "good for photography" →
      Brahmaputra Riverfront Park + Jor Pukhuri Park; "which parks are
      open every day" → exactly the 10 real `daysOff: 'None'` parks;
      "boating and open every day" → still just Dighalipukhuri Park
      (satisfies both); non-park control → empty
- [x] Verified live: boating and open-every-day queries return correct
      real park data; a vague "tell me about parks" question correctly
      asks a clarifying question instead of guessing; restaurant and
      nightlife regressions unaffected; a compound "lunch and a park for a
      walk afterward" question correctly returns real data in both
      restaurantRecommendations and parkRecommendations in one response
- [x] Verified visually with a real headless-browser screenshot: 10 park
      cards render cleanly with no rating shown (branches to the
      entry-fee/days-off layout instead), zero console errors. Minor
      cosmetic note, not a bug: on cards with a long entry-fee description,
      the fee text wraps to two lines while "open daily" sits to the
      right, slightly asymmetric but fully readable

## Bug fix: park matches crowded out general sightseeing knowledge
- [x] Reported live: "Where can I go for photography in Guwahati?" only
      mentioned two parks, no Kamakhya Temple or other well-known
      photography spots. Confirmed via direct testing this reproduces on a
      completely fresh message (not caused by earlier park conversation) —
      "photography" is simply one of `parks.js`'s activity keywords, so it
      correctly matches real park data every time. The actual gap: nothing
      restricted "reply" to park-only content, but the model stopped
      volunteering anything else once given real verified park data
- [x] Fixed in `systemPrompt.js`: added an explicit instruction that
      having real park matches for part of a question doesn't mean "reply"
      should narrow to parks only — for broad questions, the model should
      still blend in general knowledge (temples, viewpoints, etc.)
      alongside the verified parks. Deliberately general, not hardcoded to
      photography specifically, per direct confirmation this should apply
      to any activity (wildlife, heritage, sunset, etc.), not just one
- [x] Found and fixed a related, separate gap while discussing this:
      "wildlife" matched nothing at all in `parks.js` (only "birdwatching"
      existed, from Jor Pukhuri Park's turtle/swan habitat, but "wildlife"
      was never mapped to it). Added as a synonym on the same keyword row
- [x] Verified live: the exact reported photography question now mentions
      Kamakhya Temple and a river cruise alongside the two real park
      cards; "where can I see wildlife" now correctly matches Jor Pukhuri
      Park (previously zero matches) and the reply also mentions the Assam
      State Zoo; a narrow park-only question ("where can I go boating")
      stays concise and unaffected; restaurant and nightlife regressions
      unaffected

## Bug fix: the "blend general knowledge" fix introduced a new regression
- [x] Reported live with a screenshot: "Parks in Guwahati?" correctly got
      a clarifying question, but the very next message, "Name few parks in
      Guwahati" (a rephrasing of the same vague request, not an answer to
      the clarifying question), got a plain-prose list including a place
      that isn't even a park (Srimanta Sankaradeva Kalakshetra, a cultural
      complex) instead of asking again — no park cards, and a fabricated
      "detail" the user rightly flagged as missing
- [x] Root cause: confirmed both messages match zero real parks at the
      data layer (both genuinely vague — no activity/area). The previous
      session's "blend in general knowledge for broad questions" guardrail
      addition created real tension with the older "ask a clarifying
      question when the list is empty" instruction — reproduced the
      failure directly: 1 in 4 local attempts showed the model starting to
      drift ("While I've asked you to clarify your preferences, some
      well-known parks you might en...") instead of asking again
- [x] Fixed in `systemPrompt.js`: added an explicit paragraph clarifying
      that the "blend general knowledge" guidance ONLY applies when the
      park list is non-empty, and that an empty list always means "ask a
      clarifying question, don't list any parks in reply" — including
      when the visitor rephrases the same vague request rather than
      actually answering. Also added a direct rule: never name a specific
      park in "reply" unless it also appears in "parkRecommendations" (the
      literal mechanism that let a non-existent "park" get mentioned)
- [x] Verified: 6/6 retries of the exact reported second message now
      correctly ask a clarifying question instead of listing parks (up
      from failing on the original 1-in-4 reproduction); reverified the
      photography/wildlife blending fix from last session still works
      correctly for the legitimately non-empty case; reverified a narrow
      real match ("where can I go boating") stays concise; restaurant and
      nightlife regressions unaffected

## Added a fifth category: temples (structured cards + paraphrased narrative)
- [x] User supplied a real, pre-researched source document ("Guwahati &
      Around — Temple & Sacred-Site Research Guide," Sept 2026) — 20
      temples across 3 tiers, cross-checked against Government of
      Assam/Assam Tourism/Incredible India sources, with history,
      mythology, and spiritual significance already kept as separate,
      clearly-labeled fields and an explicit rule never to invent hours/
      fees/booking rules/dress restrictions. No independent research phase
      was needed — the work was faithful transcription into the existing
      architecture, not new research
- [x] Deliberate architecture decision, different from the other three
      categories: the fuller history/mythology/spiritual-significance text
      lives only in `temples.js` and `systemPrompt.js`'s grounding text —
      it's never part of `CHAT_RESPONSE_SCHEMA` and never reaches the
      browser. Gemini is explicitly allowed (encouraged) to paraphrase it
      into "reply" in its own natural voice, unlike the "copy exactly"
      rule that governs every other structured field, including the
      temple's own card facts (name/area/deity/timings/dress code)
- [x] Kept `historicalSignificance`/`mythologicalSignificance`/
      `spiritualSignificance` as three separate fields (not one blended
      "history" string) specifically to preserve the source document's own
      fact-vs-tradition distinction — mythological claims are phrased as
      "tradition says"/"devotees believe" in the source, and the
      guardrail in `systemPrompt.js` requires that framing survive
      paraphrasing rather than being flattened into stated fact
- [x] Built `temples.js` — `getRelevantTemples()` matches by temple/deity
      name, theme (shakta/shaiva/vaishnava/tantric/navagraha/archaeology/
      hilltop/riverside/pilgrimage/hajo/north-guwahati/etc.), and area,
      mirroring the restaurants.js/parks.js keyword-table pattern. A named
      temple/deity always narrows to just that match; a vague temple
      question with no name/theme/area falls back to the 6 Tier-1 temples
      (Kamakhya, Umananda, Basistha, Navagraha, Ugratara, Sukreswar)
      rather than dumping all 20 — using the source doc's own tier ranking
      as the prominence signal, the same role `rating` plays in
      restaurants.js's top-N fallback. No `entryFee` field: none of the 20
      source entries specify one, and inventing "Free" would violate the
      source's own no-fabrication rule
- [x] `server.js`: added `templeRecommendations` to `CHAT_RESPONSE_SCHEMA`
      (name/area/deity/themes/timings/dressCode/highlight — `tier` is
      internal-only, used for the fallback above, never sent to Gemini or
      the browser), wired `getRelevantTemples(allVisitorText)` alongside
      the other three, threaded through `buildSystemPrompt` and `res.json`
- [x] `systemPrompt.js`: added `formatTempleList()` (includes the full
      narrative text per temple as grounding) and a guardrail paragraph
      requiring: card facts copied exactly; never invent hours/fees/
      booking/dress rules — pass along "verify locally" honesty instead of
      presenting a firm schedule; narrative content paraphrased, not
      recited, with the tradition/fact framing preserved; genuine
      reverence, no casual tone. Also narrowed the pre-existing parks-era
      sentence that let Gemini mention "temples" from general knowledge
      for broad sightseeing questions — now temples only ever come from
      the verified list
- [x] `public/script.js`: added a `'deity' in rec` branch in
      `addRecommendationCards` (checked before the pre-existing
      `'entryFee' in rec` park branch, so parks are unaffected) showing
      deity/timings/dress code, plus one new
      `addRecommendationCards(data.templeRecommendations, 'themes')` call.
      No CSS changes needed — confirmed by reading `style.css` directly:
      cards have no fixed height/truncation
- [x] Verified matching logic directly via `getRelevantTemples()`: named
      temple ("Kamakhya") → exactly that one; vague ("temples in
      Guwahati?") → the 6 Tier-1 temples only; theme queries (pilgrimage,
      hilltop, tantric) → correct real subsets; Hajo-area query → the two
      real Hajo temples; non-temple control → empty
- [x] Verified live against a real running server: the Kamakhya query
      produced a warm, accurate, paraphrased reply that kept "According to
      Shakta tradition"/"though this sacred narrative belongs to
      spiritual tradition rather than archaeological record" framing
      intact rather than stating the Sati legend as fact, and honestly
      passed along the "verify same-day" timing caveat; the card fields
      matched `temples.js` exactly. Re-verified the same fact/tradition
      care on Ugratara (the other major Tantric/Shakta site) — reply
      preserved "popular tradition connects..." framing and honestly
      relayed "no stable official timetable, verify locally" rather than
      inventing hours
- [x] Verified the vague-question fallback live: "temples in Guwahati?"
      returned exactly the 6 Tier-1 temples, not all 20
- [x] Verified a mixed query ("temples and restaurants near Pan Bazar")
      populated both `templeRecommendations` (Sukreswar Temple, correctly
      area-matched) and `restaurantRecommendations` independently
- [x] Full regression pass against the live server: nightlife ("best
      rooftop bars"), restaurants ("cheap cafes"), parks ("parks for
      boating," narrow match), and the vague-park clarifying-question
      behavior ("tell me about parks in Guwahati" → 0 park matches, a real
      clarifying question, not a list) — all unaffected by the new category

## Day-grouped itineraries, honest nearby-matching, shorter replies (2026-09-02)
- [x] Live-tested the new temples feature with a real 3-day itinerary
      request and found three real gaps: the reply blended all 3 days into
      one dense paragraph; cards rendered as "all restaurant cards, then
      all temple cards" instead of grouped by day; and the "nearby"
      restaurants weren't actually nearby — checking the data, only
      Umananda/Ugratara (Uzan Bazar), ISKCON (Ulubari), and the Sai Baba
      Temple (Six Mile) share a real locality with any restaurants.js
      entry; the other 16 temples, including the most-requested ones
      (Kamakhya, Basistha, Navagraha, Sukreswar), have no genuinely close
      match in the current data
- [x] User explicitly chose: be upfront when there's no real nearby match,
      offer a good pick elsewhere in the city instead of implying
      proximity — no new research pass to invent/find real nearby options
- [x] `server.js`: reordered so `relevantTemples` is computed before
      `relevantRestaurants`, then the matched temples' `area` strings are
      appended to the text passed into `getRelevantRestaurants` — this
      makes restaurants.js's own existing area-keyword matching pick up a
      genuine overlap (e.g. "Uzan Bazar" appearing in both) so it isn't
      crowded out of the top-10-by-rating fallback by unrelated,
      higher-rated restaurants. No new mapping table, no changes to
      restaurants.js itself
- [x] Added a nullable `day` (NUMBER) field to all four
      `CHAT_RESPONSE_SCHEMA` item shapes (restaurant/nightlife/park/
      temple), nullable-but-required (matching nightlife's existing
      rating/costForTwo pattern) so Gemini must consciously emit a day
      number or null rather than silently omitting the field
- [x] `systemPrompt.js`: added instructions for (a) structuring "reply"
      with a short "Day 1:"/"Day 2:" line per day instead of one dense
      paragraph, for itineraries spanning 2+ days only; (b) only
      describing a restaurant as "near"/"close to" a temple when their
      listed areas genuinely coincide, otherwise presenting it honestly as
      a good option elsewhere in the city; (c) tagging every recommendation
      with a `day` number that must exactly match the "Day N:" lines in
      reply, left null for single-day/non-itinerary questions
- [x] `public/script.js`: generalized `addRecommendationCards` to
      auto-detect each item's tag field (cuisines/tags/activities/themes)
      by field presence instead of taking a fixed parameter, the same
      per-item discrimination the meta-row rendering already used for
      `'deity' in rec`/`'entryFee' in rec`. Added `renderRecommendations()`:
      for a normal (non-itinerary) response, renders the same 4 separate
      category-clustered card groups as before (just temple-first instead
      of restaurant-first) — deliberately did NOT merge them into one
      list, since that would collapse the existing visual distinction
      between e.g. a compound "restaurants and bars" query's two clusters.
      Only when any recommendation actually carries a non-null `day` does
      it switch to grouping every category together under "Day N" headings
- [x] `public/style.css`: added `.day-heading`, reusing existing gold/
      glass-border theme tokens
- [x] Design reviewed before implementation — caught that an earlier draft
      would have merged all 4 categories into one card list even for
      normal non-itinerary questions, which would have been a real visual
      regression for compound category queries; fixed to only merge/group
      when day-tagging is actually in use
- [x] Verified live against a fresh server process with the exact
      originally-reported request ("3 days in Guwahati, temples +
      breakfast/lunch"): reply came back as clean Day 1/Day 2/Day 3 lines;
      Kamakhya (Day 1, no genuine nearby match) correctly said food was "a
      short ride away" rather than implying proximity; Ugratara (Day 3,
      genuine Uzan Bazar match with Cafe Karma) correctly said "just steps
      away"; every temple/restaurant's `day` field matched exactly where
      it was described in the reply text
- [x] Verified a single-day ask keeps `day: null` on everything (no
      spurious "Day 1" heading); verified "tell me about Kamakhya temple"
      alone still returns `day: null` (unaffected by this change);
      verified a non-itinerary compound query ("restaurants and bars in
      Guwahati") returns both categories with `day: null`, preserving the
      existing two-cluster rendering
- [x] Full regression pass: nightlife ("best rooftop bars"), restaurants
      ("cheap cafes"), parks ("parks for boating" narrow match, and the
      vague-park clarifying-question behavior) — all unaffected

## Full nightlife refresh: multi-dimension matching, 26 -> 59 venues (2026-09-02)
- [x] User supplied a large, source-checked nightlife research document (52
      real venues across a Bar/Pub/Lounge table and a Club/Discotheque/
      Night Club/Dance table, with real Google/Zomato/TripAdvisor ratings
      and review counts) plus a separate "AI Master Instructions" page.
      Reviewed both; found real rating conflicts against the live
      `venues.js` (Elevate Bar & Bistro was flagged low-confidence with
      4.6/114-review positive data now available; Nuts and Brew 4.8 vs
      4.0; Maroon Room 4.9 vs 4.6; FTV 5.0 vs 4.1; Olive Garden had zero
      rating signal vs 4,649 real reviews) — decided this document should
      be authoritative for every venue it covers
- [x] User explicitly ruled out using the document's "AI Notes" column
      (subjective tier commentary like "Higher-tier addition"/"Use
      cautiously") for anything — not highlight text, not a confidence
      flag, not ranking — and instead required the real structured columns
      (Type of Place, Rating/Source, Cost for Two, Rooftop, Music/Vibe,
      Karaoke) to become genuine independent matchable dimensions, the
      same AND-combination model `restaurants.js` already uses for
      cuisine + area + budget, not the old flat single-`tags`-array
      OR-match. Confirmed by design review before implementing (also
      confirmed: drop the old `lowConfidence` flag entirely since it was
      the same AI-Notes-style judgment call under a different name; add
      area-matching too, since `restaurants.js`/`parks.js` already have it
      and it wasn't in scope to leave venues.js as the one file without it)
- [x] Rebuilt `venues.js` from scratch on this model: each venue now has
      `typeOfPlace` (canonical array: bar-pub/lounge-bar/premium/brewery/
      mrp-bar/club-discotheque/after-party) and `musicVibe` (canonical
      array: rock/indie/live-music/tribute-nights/dj/edm/trance/
      bollywood/commercial/party) instead of one flat `tags` array;
      `rooftop`/`karaoke` are now real per-venue booleans (`karaoke: null`
      for the 7 legacy venues the new document doesn't cover, since that's
      genuinely unverified, not false). `tags` still exists but is now a
      small computed display-only chip row (`buildDisplayTags`), built
      from the verified fields, never from AI Notes, and plays no role in
      matching
- [x] `getRelevantVenues()` rewritten: independent matchers
      (`matchTypeOfPlace`, `matchMusicVibe`, `matchAreas`, a rooftop
      trigger, a karaoke trigger newly split out from the old
      live-music-or-karaoke regex, plus reused `restaurants.js` budget
      parsing) AND-combine whichever actually fired — "rooftop bar with
      karaoke under 2000" now narrows on all three at once. Sorted by
      rating and capped at `TOP_N = 10`, same as restaurants.js. The old
      hand-written "don't let rooftop bar pull in every plain lounge"
      exclusion hack is gone — the AND-of-independent-filters model makes
      it structurally impossible for that to happen, no special case needed
- [x] `restaurants.js`: exported `parseBudgetSignal` so `venues.js` could
      reuse it instead of duplicating the cheap/expensive/under-X logic
- [x] 19 venues already in the old `venues.js` overlapped with the new
      document by name — updated in place with the new document's rating/
      cost/area/type/vibe (not just rating). 33 genuinely new venues added.
      7 venues the document doesn't cover (Lounge - Dynasty, Skye, EXORO,
      The Socialite, 188 Downtown, Trafik, Leaf Deck Café Bar) were left
      as real, just-not-re-verified-this-pass data, migrated to the new
      field shape by hand from their existing tags/highlight text. Total:
      59 venues (up from 26)
- [x] Reclassified two venues per the newer, more detailed source: Abacus
      Brewing Co & Kitchen and The Vibe House were previously tagged
      `clubbing` in the old data, but the new document places both firmly
      in the Bar/Pub table with no clubbing signal at all — corrected to
      bar-pub (+ brewery for Abacus)
- [x] Kept `Terra Mayaa`/`The Maroon Room`/`Abacus Brewing Co & Kitchen`'s
      rating in sync between `venues.js` and `restaurants.js` (an existing
      project invariant: the bot must never show two different ratings for
      the same place depending on whether it's asked about as food or
      nightlife) — verified directly post-change: 4.3/4.6/4.9 in both files
- [x] Data-quality decisions made explicitly, not silently: "Noya by Nyx"
      listed at an invalid "43.8/5" in the source — treated as unrated
      (`null`) rather than guessing 4.8 or 3.8, with a code comment
      explaining why. "The Beer Cafe" (City Center Mall, Christian Basti)
      kept as a separate entry from the pre-existing "Beer Cafe" (Times
      Square Mall, Sreenagar) since the addresses don't match — plausibly
      two branches of the same chain, not merged on a guess. "Retrotown"
      (a real club at its own address in the new document) kept separate
      from "The Locals," whose old area field had used "Retrotown" as a
      location descriptor, not a name
- [x] Verified live against a fresh server process: "rooftop bar with
      karaoke under 2000 rupees" correctly narrowed to exactly one real
      match (The Whiskey Bar & Grill) across all three dimensions at once;
      "where can I do karaoke tonight" returned only `karaoke: true`
      venues, correctly excluding The Beer Cafe (karaoke: false) while a
      plain "live music tonight" query still included it; "best bars in
      Guwahati" now includes The Anglers/Maroon Room/Abacus (previously
      invisible to a generic bar query since they were tagged
      `live-music`/`clubbing` only, never `lounge-bar`)
- [x] Full regression pass: restaurants ("cheap cafes"), parks ("parks for
      boating"), temples ("Kamakhya") all unaffected; confirmed the three
      dual-listed venues show identical ratings in both files

## Fixed nightlife matching gaps + added review-confidence ranking (2026-09-02)
- [x] Live testing found "dancing," "clubs" (plural), and "night clubs"
      (with a space) all failed to match the keyword patterns meant to
      catch them — confirmed directly with a `node -e` regex test before
      touching any code. Same bug class as the earlier "cafes"/"bars"
      plural fixes, just not applied when `venues.js` was rebuilt earlier
      today. Root cause of three separate-looking symptoms: "dancing"
      fell back to a stale earlier topic (rock bars) still in the
      4-message window instead of matching clubs; "night clubs?" matched
      *something* nightlife-shaped but nothing narrowed it to actual
      club-type venues, so it fell through to the full 58-venue list
      sorted by rating regardless of type; "clubs?" alone matched nothing
      and returned empty
- [x] Fixed in `venues.js`: `\bdance\b` → `\bdanc(e|es|ing)\b`;
      `\bclub(bing)?\b` → `\bclub(s|bing)?\b`; `nightclub` →
      `night\s?clubs?`. While auditing the same two regex tables for the
      same mistake elsewhere (same practice as prior sessions — fix the
      whole pattern class, not just the reported instance): also fixed
      `brewery`/`after-party`/`party` to catch their plurals
      ("breweries"/"after parties"/"parties" — the last one is an
      irregular plural `\bparty\b` alone can't catch)
- [x] Removed Gullu Party House entirely (5.0/5 from only 5 reviews — a
      genuine outlier; the next-lowest review count in the whole 58-venue
      set is 26)
- [x] Added a `reviewCount` field to every venue (from the same source
      document), and a `confidenceAdjustedScore()` — a simple tiered
      penalty (not a statistical formula, keeping with this codebase's
      preference for simple/explainable rules) that discounts a rating
      backed by fewer than 50 reviews, or none given at all, before
      ranking — replacing the old plain rating-only sort. This is the
      "review confidence" principle from the original nightlife research
      document (a 5.0 from a few reviews shouldn't beat a 4.7 from
      thousands), now actually implemented rather than just praised when
      first reviewing that document. Both code-level ranking AND
      `systemPrompt.js`'s guardrail were updated (per explicit request):
      `formatVenueList()` now shows review counts inline, and Gemini is
      told to weigh rating together with review volume in "reply" itself,
      not just trust whichever number is higher
- [x] Verified live against a fresh server: "what about dancing?" (asked
      cold) now returns real club-discotheque venues, not stale rock-bar
      results; "clubs?" and "night clubs?" both return real club venues
      instead of empty/wrong-category results; confirmed Gullu Party
      House never appears in any nightlife result; confirmed the
      confidence-adjusted ranking correctly stops a thin-review venue
      (Retrotown, 4.2★/87 reviews) from outranking a well-reviewed one at
      the same adjusted score (XS Bar & Lounge, 4.1★/1,587 reviews)
- [x] Regression pass: "I like rock music" still returns all 8 real
      matches (the earlier same-session fix); restaurants/parks/temples
      unaffected

## Added a sixth category: cinemas (2026-09-02)
- [x] User shared a well-structured Guwahati multiplex/cinema research
      document (16 real cinemas, Tier 1-3, consistent fields per entry)
      and gave an explicit scoping instruction after review: use only the
      fields usable without any doubt, drop everything flagged as
      inconsistent/unpopulated/structurally unsupportable. Confirmed via
      one clarifying question: the source's free-text "Type" column
      (Premium/major multiplex, Established local cinema, etc.) is
      dropped entirely rather than normalized — matching works by area
      and cinema name only, with tier as the vague-question fallback
      signal (same role tier plays in temples.js)
- [x] Explicitly out of scope per that instruction: rating/review data
      (none exists), any live showtime/pricing/seat-availability feature
      (the source itself says that needs live data this app doesn't
      have — the existing general "say so honestly rather than guessing"
      rule already covers a "what's playing" question with zero new
      code), Type-based filtering, a broken citation artifact in the
      source, and "facilities"/"nearby shopping" fields that were
      mentioned in the source's own data-rule section but never actually
      populated per-entry
- [x] Built `cinemas.js` closely mirroring `temples.js`'s shape: name,
      area, tier (internal-only, drives the vague-question fallback),
      bestFor, highlight, tip. `highlight` combines the source's "Why
      visit" + "History/context" into one natural sentence — the same
      light editorial consolidation already used for every other file's
      highlight field. `getRelevantCinemas()` matches by name (with the
      two INOX branches disambiguated by mall name, "Aurus" vs "NCS
      Square") and area; a vague question falls back to the 4 Tier-1
      cinemas (INOX Aurus, PVR City Centre, Cinepolis Central Mall, INOX
      NCS Square)
- [x] Wired into `server.js` (schema + `allVisitorText` matching),
      `systemPrompt.js` (new `formatCinemaList()` + guardrail paragraph),
      and `public/script.js` (`renderRecommendations()` category array +
      a new `'bestFor' in rec` meta-row branch, mirroring the existing
      `'deity'`/`'entryFee'` branches) — day-tagging for itineraries
      included for consistency with the other five categories
- [x] Bug found and fixed during first live test: `formatCinemaList()`
      originally ran `bestFor` and `highlight` together in one line with
      no label between them, so Gemini blended the two fields together
      and even reworded the highlight into text that wasn't in the
      source at all — a real violation of the "copy exactly" rule.
      Fixed by giving each field (Best for / Highlight / Tip) its own
      clearly labeled line, and by explicitly telling the guardrail not
      to merge/reorder/reword the three lines into each other (the
      original guardrail wording had also only listed two of the three
      fields to copy, missing `highlight` entirely). Reverified: fields
      now come back copied exactly, matching `cinemas.js` verbatim
- [x] Verified live: "tell me about PVR City Centre" → one accurate,
      correctly-separated card; "cinema near Beltola" → Matrix Cinemas;
      "INOX NCS Square" correctly resolves to that branch only, not
      Aurus; "what movie is playing at PVR tonight?" → an honest "I don't
      have live movie schedules" reply, no invented showtime, no
      fabricated card claim
- [x] Full regression pass: temples, restaurants, nightlife (rock music
      query), and parks all unaffected

## Added a seventh category: shopping (2026-09-03)
- [x] User shared a Guwahati shopping research document (24 malls/markets,
      Tier 1-3) and, after review, gave a detailed scoping conversation
      (5+ rounds) that landed on a genuinely different design from
      cinemas.js: unlike the cinema doc's messy Type column (dropped
      entirely), this document's Type column turned out to be clean
      enough to reliably bucket by hand — every value contains "mall" or
      defaults to "market", with one deliberate exception. Confirmed
      explicitly: mall vs. market is a real distinction visitors care
      about (unlike cinema "premium vs local"), so it was kept, not dropped
- [x] Final agreed design: every shop gets exactly one `category` — `mall`,
      `market`, or `corridor` (GS Road Shopping Corridor only — a long
      commercial strip of many separate shops/showrooms, explicitly not
      folded into "mall" per the user's correction). A handful of market
      entries also carry a specific `keyword` for niche searches: Pan
      Bazaar (books — while still being a full general market like Fancy
      Bazaar, not book-only, per explicit correction), NEDFi Haat
      (craft), Purbashree Emporium (handloom), Pragjyotika Assam Emporium
      (government-emporium + handloom). Bamboo Market also got a `craft`
      keyword by clear analogy (same "specialised traditional market"
      pattern as the other three, though not explicitly named by the
      user — flagged here for visibility)
- [x] Agreed query behavior, implemented exactly: a bare "shopping"
      question (no bucket/area named) falls back to Tier 1 only, same
      pattern as temples/cinemas. "Market"/"bazaar" specifically returns
      **every** market entry (not tier-limited) with its own explanation —
      an explicit requirement, since a generic market question should show
      the full variety, not just top picks. "Mall" specifically returns
      every mall entry the same way. A niche keyword (books/craft/
      handloom/government-emporium) narrows within market. "GS Road" by
      name surfaces the corridor specifically
- [x] Built `shops.js` mirroring `cinemas.js`'s exact card shape (name,
      area, bestFor, highlight, tip) plus a `tags` field (category +
      keywords) reusing the exact same field name venues.js already uses
      for its computed display chip row — this meant the frontend needed
      **zero new code**: the existing `'bestFor' in rec` branch (added for
      cinemas) and the existing `getTagField()`/tags-chip rendering
      already handled shops correctly with no changes
- [x] Learned from the cinema bug and avoided repeating it: `formatShopList()`
      labels each field (Best for / Highlight / Tip) on its own line from
      the start, and the guardrail explicitly says not to merge/reorder/
      reword them — verified live that bestFor and highlight came back
      correctly separated and copied exactly on the first real test
- [x] Found and fixed a real, mostly-reproducible bug during first live
      test: a broad "tell me about markets in Guwahati" query (which
      correctly matches all 16 real market entries, by design) returned
      `shopRecommendations: []` — reproduced 8 times out of 9 attempts.
      Investigated with a direct, isolated Gemini API call (bypassing the
      server) to inspect `finishReason` and token usage directly, rather
      than guessing: confirmed `finishReason: MAX_TOKENS` — 16 full shop
      entries needs about 2,400 output tokens, but `maxOutputTokens` was
      still 2048 from earlier categories. When generation is cut off
      mid-JSON at that limit, Gemini's fallback behavior nests a
      malformed, truncated copy of the whole intended response inside the
      "reply" string instead of filling the real structured array —
      explaining exactly what was observed. Raised `maxOutputTokens` to
      4096 (measured real usage for this exact case: ~2,400 tokens, so
      this leaves genuine headroom); reverified 3/3 clean afterward
- [x] Also checked a stray, suspicious-looking console message that turned
      up during debugging (`injected env (1) from .env // tip: ⌁ auth for
      agents [www.vestauth.com]`) — traced it directly into
      `node_modules/dotenv/lib/main.js`: it's a real, built-in "random
      tip" feature dotenv 17.x ships promoting the maintainers' own
      related products, not a compromised package. Confirmed safe
- [x] Verified live: vague "shopping" → the 8 Tier-1 entries; "markets in
      Guwahati" → all 16 real market entries, no truncation; "best malls"
      → all 7 real mall entries; "handloom silk" → Purbashree +
      Pragjyotika only; "GS Road shopping" → the corridor entry,
      correctly described as a strip of many shops rather than one place
- [x] Full regression pass: cinemas, temples, restaurants, nightlife (rock
      music query), and parks all unaffected by the higher token budget
      or the new category

## Fix: "restaurant" returning a cafe, and itinerary cards rendering out of story order (2026-09-03)
- [x] User reported live, from a real 4-activity single-day plan (temple ->
      lunch -> movie -> party): (1) asking for "lunch in a restaurant" got
      a cafe instead; (2) the reply text correctly said movie-then-party,
      but the recommendation cards below it showed the nightlife card
      before the cinema card — reversed from the actual story
- [x] Root cause #1: `restaurants.js` had logic to stop a mentioned
      shop-like cuisine (cafe/bakery/etc.) from starving a "restaurant"
      request of non-cafe options, but no logic for the reverse case —
      saying "restaurant" alone, with no cuisine at all, applied no
      filter, so a highly-rated pure cafe could win the top-rated
      fallback. Fixed: when the message says "restaurant" and never
      mentions a shop-like cuisine itself, exclude entries whose cuisines
      are ALL shop-like (a plain cafe) from the results — entries that
      merely also serve something shop-like alongside real cuisines
      (e.g. Kiranshree Sweets: Chinese/North Indian/.../Mithai) are
      untouched. Verified: plain "lunch in a restaurant" now excludes
      pure cafes; plain cafe queries, combined "cafe and restaurant"
      asks, and existing cuisine-specific narrowing all unaffected
- [x] Root cause #2 found by direct code inspection, not guessing: the
      day-grouped rendering path in `public/script.js` rendered each
      day's cards in one *fixed* category order (temple, restaurant,
      nightlife, park, cinema, shop) regardless of the actual sequence
      described in that day's "reply" text — nightlife came before
      cinema in that fixed list, so it always rendered first even when
      the story said "movie, then party"
- [x] Fixed by adding a new nullable `order` field (1, 2, 3...) alongside
      the existing `day` field on all six recommendation categories —
      marking an item's position in its day's actual sequence — and
      sorting each rendered group by it instead of relying on fixed
      category order. `systemPrompt.js` instructs the model to set
      `order` whenever a day's plan has a real sequence of activities,
      matching the order things are described in "reply"
- [x] Found and fixed a second problem while verifying live: a real test
      of the exact reported scenario came back with `order` correctly
      set (1, 2, 3, 4) but `day` left `null` — the existing day-tagging
      rule only strictly required a 2+ day itinerary, and this was a
      single busy day. Since the frontend's day-grouped/ordered
      rendering path only activated when `day` was present, this case
      fell straight back into the old fixed-category-order bug despite
      `order` being correct. Fixed by re-keying the frontend's trigger
      condition on `order` instead of `day`: a real sequence (any `order`
      present) now renders correctly whether or not a day number is also
      set — a single sequential day renders as one flat, correctly
      ordered list with no "Day N" heading; a real multi-day itinerary
      still gets day headings, each internally sorted by `order`
- [x] Verified live: the exact reported scenario (temple -> restaurant ->
      cinema -> nightlife) now returns `order: 1, 2, 3, 4` matching that
      sequence exactly, confirmed correct render order via a direct
      simulation of the sorting logic against the real captured response
- [x] Regression pass: plain "cheap cafes" (order/day stay null,
      unaffected); "restaurants and bars in Guwahati" (non-itinerary
      compound question — still renders as two distinct category
      clusters, untouched); a real 3-day temple+food itinerary (day
      correctly 1/2/3, order correctly set within each day)
- [x] Also discussed live, not yet built: a deeper cause behind why NYX
      Lounge & Deck (Khanapara) and Anuradha Cineplex (Bamunimaidan) got
      paired on the same day despite being geographically far apart —
      the only cross-category area-awareness anywhere in this app is the
      narrow temple-area-into-restaurant-matching hack; there's no
      general "keep a day's picks in one locality" mechanism, and no
      real distance/coordinate data to make that guaranteed rather than
      best-effort. Discussed as the kind of problem "function calling"
      (letting Gemini chain each day's picks off the previous one's
      actual area, already flagged as a future learning step earlier in
      this log) would address more fundamentally than a prompt tweak —
      agreed as a real, separate future project, not something folded
      into this fix

## Extended the restaurant-vs-cafe fix to "lunch"/"dinner" (2026-09-03)
- [x] User asked to check whether plain "lunch"/"dinner" (no "restaurant"
      word) had the same pure-cafe gap just fixed for "restaurant" —
      checked directly before answering rather than guessing: plain
      "lunch" returned 4/10 pure cafes, plain "dinner" 3/10, confirming
      the same bug, since the earlier fix's trigger only matched the
      literal word "restaurant"
- [x] Fixed in `restaurants.js`: introduced `wantsProperMeal` (restaurant
      OR lunch OR dinner) as the shared trigger for both the existing
      "don't starve a restaurant request when a shop-like cuisine is also
      mentioned" logic and the new "exclude pure-shop-like entries"
      exclusion — both now treat "lunch"/"dinner" as equally strong a
      signal as "restaurant" itself. Deliberately did NOT include
      "breakfast" — a cafe is a normal, expected answer to a breakfast
      question, unlike lunch/dinner
- [x] Verified: plain "lunch"/"dinner" now exclude pure cafes; "a nice
      cafe for lunch" still returns cafes (explicit cuisine always wins);
      plain "cafes" and "breakfast" queries unaffected; existing
      "restaurant" and cuisine-specific narrowing (e.g. "Chinese
      restaurant near Six Mile") unaffected; confirmed live against a
      fresh server with "where should I go for dinner tonight?"

## Added an eighth category: attractions/sightseeing (2026-09-03)
- [x] User shared a 35-place Guwahati sightseeing document (tiers
      independently verified by the user, so no source-column doubt this
      time). Reviewed it and found real overlap: 5 temples (Kamakhya,
      Umananda, Basistha, Madan Kamdev, Bhubaneshwari) and 1 park
      (Dighalipukhuri) already exist in `temples.js`/`parks.js`, described
      here from a general-sightseeing angle instead of a worship angle
- [x] User's explicit design: these overlapping places should appear in
      BOTH a "temple"/"park" answer AND a general "what to see"/"things
      to do" answer — but a bare name ("Kamakhya") must always resolve to
      the temple/park file, never the sightseeing file. Discussed the
      sync mechanism (manual vs. programmatic) and the user delegated the
      choice with one instruction: pick whichever avoids bugs/AI
      confusion
- [x] Chose programmatic reuse over manual sync: `attractions.js` pulls
      `name`/`area` directly from `temples.js`/`parks.js` at load time via
      `fromTemple()`/`fromPark()`, rather than a second hand-typed copy —
      structurally impossible for the two to drift apart, unlike the
      manual-sync pattern already used for Terra Mayaa/Maroon Room/Abacus
      (which has already needed a real fix once, for Chakkranosh)
- [x] Built `attractions.js` (35 entries) mirroring `temples.js`'s shape:
      name/area (6 pulled from temples.js/parks.js, 29 own), tier+rank
      (internal only, drives the vague "what to see" fallback sorted by
      rank), themes (the source's own clean "Falls Under" tag vocabulary
      — no messy free-text to normalize this time, unlike cinemas/shops),
      distanceFromDispur (kept as the source's descriptive string, e.g.
      "~45-50 km", not forced into a bare number), highlight. Per
      instruction, "Resort"/"Resorts" dropped from two entries' themes —
      that becomes its own future hotels/resorts category, not folded in
      here
- [x] Enforced the name-priority rule at the code level, not just in the
      prompt: `CROSS_REFERENCED_NAMES` guarantees the 6 overlapping places
      are never name-matchable within `attractions.js` itself (only via a
      theme match or the Tier-1 fallback) — a bare "Kamakhya"/
      "Dighalipukhuri" can only ever be answered by `temples.js`/
      `parks.js`. Extended the same discipline one level further, by my
      own judgment call (flagged for visibility): `THEME_KEYWORDS`
      deliberately has no trigger for the generic words "temple" or
      "park" either, since those categories already fully own generic
      questions about themselves too, not just named ones
- [x] Also tightened `systemPrompt.js`'s parks guardrail — it previously
      told Gemini it could mention "landmarks or viewpoints" from its own
      general knowledge for broad sightseeing questions; now that a real
      verified attractions list exists, that carve-out was narrowed to
      point at the attractions list instead, closing the same kind of gap
      "temples" was already dropped from that sentence for earlier
- [x] Bug found and fixed during first live test, same class as the
      cinema bug: `formatAttractionList()` rendered distance and highlight
      on one unlabeled line, so Gemini copied the whole rendered phrase
      ("~8 km from Dispur") into the `distanceFromDispur` field instead of
      just the distance. Fixed by giving each field its own labeled line
      and tightening the guardrail wording; reverified 3/3 clean
      afterward ("~8 km", not "~8 km from Dispur")
- [x] Second bug found and fixed during verification, unrelated to this
      session's own changes: `parks.js` (built earliest of all eight
      category files, before the name-lookup pattern existed) had NO
      way to match a park by its own name at all — only by activity/area/
      generic "park" word. A bare "tell me about Dighalipukhuri" matched
      nothing anywhere. Added a `NAME_KEYWORDS` table + top-priority name
      match to `getRelevantParks()`, mirroring every other category file,
      without disturbing the deliberate "vague park question asks a
      clarifying question" behavior for genuinely unnamed questions
- [x] Also broadened `attractions.js`'s own sightseeing trigger during
      verification — "what should I see" didn't match the original
      narrower "what to see" pattern; broadened to cover "what
      should/can/to see/visit/explore" naturally
- [x] Verified live: bare "Kamakhya"/"Dighalipukhuri" resolve only to
      temples.js/parks.js (0 attraction results either way); "what should
      I see in Guwahati" returns the 9 real Tier-1 places sorted by rank,
      including Kamakhya and Umananda; a wildlife-sanctuary theme query
      correctly includes both dedicated attractions and cross-referenced
      ones; a genuinely full itinerary ("temple in the morning, some
      sightseeing, lunch, a movie in the evening, drinks at night") came
      back with all five categories correctly populated and sequenced
      (order 1-5) in one response — the exact multi-category, single-day
      planning experience the user asked to confirm was actually workable
- [x] Full regression pass: temples, parks (both narrow and vague),
      restaurants, nightlife, cinemas, shops all unaffected

## Bug fix: vague part of a compound itinerary wrongly declined the whole request (2026-09-03)
- [x] User asked me to self-test 5 random full-day plans mixing all 8
      category files, before touching any code, and report results first.
      4/5 were correct; 1 was a real, 100% reproducible bug: "Plan a day: a
      park in the morning, a cinema in the afternoon, shopping in the
      evening, dinner, then nightlife" got the full off-topic decline reply
      ("I'm focused on being your Guwahati guide...") even though every
      part of the request was genuinely about Guwahati
- [x] Isolated the trigger directly: moving the vague park mention to a
      different position in the same request, removing it entirely, or
      asking about it alone all changed the outcome — the bug specifically
      needed "a vague, unnamed park mention as part of a multi-part
      request." Root cause: the parks guardrail's existing "ask a
      clarifying question, don't list any parks" instruction and the
      separate "stay on topic, decline off-topic questions" instruction
      had no explicit relationship — Gemini appears to have folded the
      vague-park clarifying case into "this needs a decline" rather than
      "this needs a follow-up question, the rest of the message still
      gets answered"
- [x] Fixed in `systemPrompt.js`: added a paragraph explicitly
      distinguishing "vague but genuinely on-topic" from "actually
      off-topic" for compound/itinerary requests; added a follow-up
      sentence to the existing park guardrail clarifying that its
      clarifying-question behavior is not a decline, and every other part
      of a multi-part request must still be fully answered
- [x] Verified with the exact originally-failing message, 3 clean
      successful attempts (a 4th attempt hit an unrelated transient 500
      from the Gemini API itself, not this bug): no decline; cinema, shop,
      restaurant, and nightlife recommendations all correctly populated;
      reply correctly asks a clarifying question about the park part only
      ("what kind of park experience are you looking for...") while fully
      answering the rest
- [x] Full regression pass against a fresh server: named temple
      (Kamakhya), vague park (still correctly asks a clarifying question,
      not broken by this fix), restaurant, named cinema, shop-by-area,
      named attraction (Umananda Island correctly resolves to
      `templeRecommendations`, not attractions — expected, it's one of
      the 6 cross-referenced places), nightlife, and a genuinely off-topic
      question (still correctly declined) — all unaffected

## Added hotels, resorts, and homestays/Airbnb as three new categories (2026-09-03)
- [x] User shared a well-structured Guwahati accommodation research
      document: a Hotels table (13 localities, ranked 1-3 per locality),
      a Resorts table (5 out-of-town clusters — Sonapur/Tepesia,
      Khanapara/GS Road, Chandrapur, Pobitora/Mayong, Amsing/Jorabat), and
      a Guest House/Airbnb table (25 flat-ranked stays with real review
      counts). Discussed before building anything; user decided: (1)
      research and resolve address conflicts myself rather than storing
      duplicates, (2) treat "Not Verified" fields as `null`, never as a
      reason to drop an entry, (3) keep hotels/resorts/homestays as three
      independent matchable groups rather than one merged list, (4) skip
      itinerary day/order tagging for this category entirely — a place to
      stay isn't a sequenced daily activity the way a temple visit or a
      restaurant is
- [x] Found real cross-locality duplicates: several hotels were listed
      more than once because their address genuinely borders two of the
      document's locality buckets (e.g. Novotel Guwahati GS Road under
      both "GS Road" and "Dispur"). Stored each hotel ONCE with an
      internal `areaTags` array covering every locality it belongs to,
      rather than duplicate objects — the exact class of bug that already
      caused a real one-off fix this project (Chakkranosh's address
      disagreeing between restaurants.js and venues.js)
- [x] Three of the duplicates actually disagreed on the real address, so
      merging the document's own two rows wasn't enough — used WebSearch
      to resolve them: Hotel Gateway Grandeur confirmed at GS Road,
      Christian Basti (not "Dispur-side"); Hotel Nandan confirmed at
      Paltan Bazaar/Old GS Road (the document's own Ulubari-table
      placement was simply wrong, so no Ulubari tag was kept for it)
- [x] Found a second, undiscussed duplicate while re-reading the document
      to plan this: "The Greenwood" appears in BOTH the Hotel table
      (Beltola, 4-Star, 4.4/5) and the Resort table as "The Greenwood,
      Guwahati" (Khanapara/GS Road cluster, "Urban Resort/Boutique",
      3-Star*, 4.4/5) — same rating, adjacent address, and the Resort
      table's own star figure was already flagged uncertain. Confirmed
      via WebSearch it's one real property, branded "A Luxury Boutique
      Hotel" at Beltola Tiniali — stored once, in Hotels (a genuine
      in-city address, not an outlying resort), not duplicated into
      Resorts
- [x] Built `accommodations.js` (one file for all three groups, since
      they share the same locality vocabulary and "AI Notes -> highlight"
      cleaning approach): 33 unique hotels, 20 resorts (the Khanapara/GS
      Road cluster's Greenwood entry excluded, merged into hotels
      instead), 25 homestays/Airbnb. `getRelevantHotels()` falls back to
      each locality's rank-1 pick for a vague question (the document's
      own per-locality ranking plays the same role Tier 1 plays in
      temples.js); `getRelevantResorts()` AND-combines a normalized
      `experienceTypes` tag (wildlife/eco/nature/luxury/riverside/
      lake-view/family/boutique/village, hand-normalized from the messy
      "Resort Experience" source column, same approach used for
      nightlife's typeOfPlace/musicVibe rebuild) with a cluster match,
      falling back to each cluster's rank-1 pick when vague;
      `getRelevantHomestays()` has no natural tiering in its source data,
      so it falls back to the top 5 by rating instead (restaurants.js's
      TOP_N pattern)
- [x] Bug found and fixed during my own pre-live testing: `HOTEL_TRIGGER`
      originally included `stay(ing)? + at/in/near` specifically to avoid
      over-triggering on generic phrasing — but "planning a 3 day **stay
      in** Guwahati" (a totally unrelated way to describe a trip's
      length) matched it anyway and wrongly returned 11 hotels. Removed
      that clause entirely; a genuine "where can I stay near Kamakhya"
      question is still caught two other ways (the fixed "where...stay"
      phrase, or because "Kamakhya" is already a real area-keyword match
      on its own). Reverified: the itinerary-duration phrasing now
      correctly matches nothing, while genuine stay-near-a-place
      questions still work
- [x] `server.js`: added `hotelRecommendations`/`resortRecommendations`/
      `homestayRecommendations` to `CHAT_RESPONSE_SCHEMA` — the first
      three category arrays with no `day`/`order` fields at all; both
      never state live room availability or current pricing (this app
      has no live data for those, same honesty carve-out as cinema
      showtimes and shop tenant hours)
- [x] `systemPrompt.js`: added `formatStayList()` (shared by hotels and
      resorts, since both have the same shape) and `formatHomestayList()`,
      plus three guardrail paragraphs; resorts explicitly framed as a
      getaway/day-trip outside Guwahati proper, never confused with the
      in-city hotel list
- [x] `public/script.js`: added the three new arrays to
      `renderRecommendations()`'s category list (no special-casing needed
      — `hasSequence`/`hasDays` are computed across all categories
      together, and these three simply never carry `order`/`day`); added
      two new `addRecommendationCards` meta-row branches — `'stars' in
      rec'` for hotels/resorts (stars + rating, each shown as "not
      verified" rather than blank or invented when null) and
      `'reviewCount' in rec'` for homestays (rating + review count)
- [x] Verified live against a fresh server: Novotel/Gateway Grandeur/The
      Greenwood/The Ornate/Baruah Bhavan Guest House/The Lily Hotel all
      correctly return as exactly ONE result each (not two), confirming
      the dedup holds through the full pipeline, not just the data layer;
      "hotels near the airport" correctly returned both a real airport
      hotel and a real airport-area homestay; "best hotels in Guwahati?"
      returned exactly the 11 locality-rank-1 hotels; "wildlife resort
      near Guwahati" returned only the 6 real wildlife-tagged resorts;
      "any good airbnb near Kamakhya?" returned only the 4 real
      Kamakhya-area homestays, no hotels mixed in; asking about live room
      availability/pricing correctly got an honest "no live data" answer
      instead of an invented one; confirmed the resort's internal
      `location` field correctly reaches the frontend as `area` (the
      schema's own field name) end-to-end, not left blank
- [x] Full regression pass against a fresh server: temples (named),
      parks (vague clarifying-question path and a narrow boating match),
      restaurants, cinemas, shops, attractions, nightlife, and a
      multi-category compound itinerary that doesn't mention a place to
      stay — all unaffected; confirmed no hotel/resort/homestay data
      leaked into any unrelated query

## Bug fixes found via my own stress test of the accommodation feature (2026-09-03)
- [x] User asked me to run 5 test searches (hotel-by-area, resorts,
      homestay/guesthouse, a "spend time in nature and spend the night"
      vibe question, and a deliberately casual/indirect question) and
      report honestly, without changing anything yet. Found two real bugs
- [x] **Cross-category leakage**: "hotels near Zoo Road" also returned
      homestay cards, even though the visitor asked specifically for
      hotels — because a bare shared area name (Zoo Road exists in both
      the hotel and homestay area-keyword tables) was enough on its own
      to trigger a category's candidate list, regardless of which type
      was actually asked for. Confirmed this wasn't just a Gemini
      judgment call: the homestay candidate list really was non-empty
      for that query at the data layer, and Gemini used it. The same
      root cause was present in the reverse direction too ("airbnb near
      Kamakhya" also had real hotel candidates available, just not
      surfaced that particular time) — an inconsistency this project has
      repeatedly found unreliable to depend on, so this was fixed
      deterministically in the data layer rather than in prompt wording
- [x] **Fixed** by adding a per-category "specific signal" check
      (`hasHotelSignal`/`hasResortSignal`/`hasHomestaySignal` — name,
      trigger word, stay-type, or experience-tag match; deliberately
      excludes a bare shared area match) — a category now defers to a
      sibling's candidate list only when it has no specific signal of its
      own AND a sibling does. A genuinely generic "places to stay near
      Zoo Road" (no category word at all) still correctly matches all
      relevant categories, since neither has a specific signal to defer to
- [x] **Casual phrasing triggered the off-topic decline**: "Something
      budget-friendly and central, just a room to crash in near the
      railway station" — a completely reasonable way to ask for a hotel —
      got the full off-topic decline, 3/3 times, even with prior
      conversation turns that had already established Guwahati as the
      topic. Root cause: none of the three categories' keyword tables
      recognized "room to crash" or "railway station," so all three
      candidate lists came back genuinely empty, and the "empty list ≠
      off-topic, stay helpful" guardrail didn't win against the general
      on-topic instruction — the same failure class as this morning's
      vague-park-in-a-compound-itinerary bug, just for accommodations
- [x] **Fixed** two ways: added "railway station"/"train station" to the
      hotel and homestay area-keyword tables (real proximity — Hotel
      Nandan/Hotel Atithi and Guava Sauce Homestay are genuinely near
      Paltan Bazaar/the station); and added a shared
      `GENERAL_STAY_TRIGGER` (place to stay, spend the night, overnight,
      room to crash, somewhere to sleep) that gives all three categories
      a real, non-empty candidate list for casual phrasing, so Gemini has
      actual data to work with instead of an empty prompt section
- [x] Found and fixed a second-order bug while fixing the first one: since
      `GENERAL_STAY_TRIGGER` alone was originally enough to satisfy each
      category's "own signal" check, a query like "spend time in nature
      and spend a night" — which should ONLY match resorts, via the
      specific "nature" experience-tag — started also firing hotels' and
      homestays' generic vague-fallback lists, since "spend a night"
      satisfied their own signal too. Fixed by making the sibling-
      deference check compare against each category's SPECIFIC signal
      only (never `GENERAL_STAY_TRIGGER`), so a category with real
      specific signal (nature -> resorts) still correctly suppresses
      siblings that only matched the generic phrase
- [x] Verified directly at the data layer and live against a fresh
      server: "hotels near Zoo Road" no longer includes homestays; "any
      good airbnb near Kamakhya?" no longer includes hotels; a genuinely
      generic "places to stay near Zoo Road" (no type word) still
      correctly matches both; the original railway-station phrasing no
      longer declines and correctly surfaces 4 real Paltan Bazaar hotels;
      "spend time in nature and spend a night" now ONLY returns the 12
      real nature-tagged resorts, hotels/homestays correctly empty; a
      fully generic "I need somewhere to stay tonight" (no area, no type)
      correctly triggers all three categories' vague fallbacks together,
      which is the right behavior for a genuinely unspecified request
- [x] Full regression pass: the earlier itinerary-duration false-positive
      fix, the locality-rank-1/cluster-rank-1/top-5 vague fallbacks, the
      hotel dedup checks, and temples/parks/restaurants/cinemas/shops/
      attractions/nightlife/off-topic-decline — all still correct.
      Noticed (not a new bug): 2 separate live calls during this
      verification came back with an empty reply on the first attempt and
      a correct one on retry — same pre-existing `gemini-3.5-flash-lite`
      response randomness already documented earlier in this file, not
      something introduced or fixable by this change

## Added sports & recreation as three new categories (2026-09-03)
- [x] User shared a Guwahati sports & recreation research document across
      4 source groupings (Stadiums & Major Sports Venues, Government/
      Institutional Sports Complexes, Private/Recreational Sports, Gaming
      & Entertainment). Found the same duplicate-entry problem already
      hit once with accommodation's "The Greenwood": "R.G. Baruah Sports
      Complex" was listed as its own row AND folded into "Nehru Stadium /
      R.G. Baruah Sports Complex" under a different source category — the
      same real venue, described twice. User resolved directly: the name
      is "Nehru Stadium," the location is R.G. Baruah Road
- [x] Discussed the category structure before building. The source's 4
      groupings didn't match visitor intent (that mismatch is exactly why
      the duplicate happened — the two "ticket-access, government-run"
      groupings overlapped). Rebuilt around 3 intent-based groups
      instead, confirmed by the user: spectator venues (watch a match),
      play-it-yourself sports facilities (book a court/turf), and gaming
      & family entertainment (arcade/bowling/VR/etc.)
- [x] User confirmed LAPX Go-Karting is open (dropped the source's own
      "live status to verify" hedge) and asked me to research and add
      PUNO — a real Guwahati indoor adventure/trampoline park the source
      document didn't include. Researched via WebSearch: NH 37 Lokhra,
      Lalung Gaon Rd, near Binod Nissan Betkuchi, Sonaighuli, Guwahati,
      Assam 781035; trampoline zones, a ninja/obstacle course, rock
      climbing ("Sky Wall"), bowling, VR, and arcade gaming; a real
      4.8/5 rating from 3,032 Google reviews. Added to gamingVenues
- [x] One deliberate deviation from the accommodation precedent, stated
      up front rather than asked as a question since it followed directly
      from established precedent: unlike a hotel (where you stay, not
      something you do), all three sports groups ARE genuine itinerary
      activities — so, unlike accommodations, all three DO carry
      day/order tagging, matching the original 8 categories
- [x] Built `sports.js` (one file for all three groups, same reasoning as
      accommodations.js — heavy shared sport/area vocabulary): 13
      spectator venues (7 stadiums + 6 remaining government complexes
      after merging the Nehru Stadium/R.G. Baruah duplicate), 17
      facilities, 4 gaming venues (3 from the source + PUNO). A shared
      `ACTIVITY_KEYWORDS` table covers both real sports and gaming
      vocabulary, since the actual per-entry `activities` arrays — not
      the keyword recognition — do the real narrowing
- [x] Reused the sibling-deference pattern from the accommodations fix,
      but found and fixed a real gap in it during pre-live testing: "where
      can I WATCH a cricket match" was also surfacing box-cricket
      facilities, because a bare shared activity word ("cricket" — used
      by both a stadium and a private arena) let both groups think they
      had their own signal, so neither deferred. Fixed by distinguishing
      an "explicit" signal (a category's own trigger word or a named
      venue) from a "weak" one (a bare shared activity word alone) — a
      group now only defers to a SIBLING'S explicit signal, and its own
      weak signal no longer protects it from doing so
- [x] Two more bugs found and fixed during the same pre-live testing
      pass: the spectator trigger required "watch" immediately before
      "match"/"game" and failed on the single most natural phrasing
      ("watch A CRICKET match"); and "fun indoor activities for
      families" — an entirely reasonable way to ask about the whole
      gaming category — matched nothing, since every word in the
      original gaming trigger was a specific named activity (arcade/VR/
      etc.) rather than a general phrase for the category itself. Also
      added a real `rooftop` boolean + filter (PlayAir, NCS Square
      SkyBall), since "rooftop sports arena" matched nothing at all in
      the first version
- [x] `server.js`/`systemPrompt.js`/`public/script.js`: wired the 3 new
      categories the same mechanical way as every prior one, WITH day/
      order fields this time (unlike accommodations). One existing
      script.js branch (`'reviewCount' in rec`, previously homestay-only)
      was made null-safe rather than adding a near-duplicate branch,
      since gaming venues share that exact shape but can legitimately
      have a null rating (GeT TaggED)
- [x] Verified live against a fresh server: Nehru Stadium dedup holds
      (one result, R.G. Baruah Road); "watch a cricket match" and "play
      badminton" now correctly stay in their own separate groups; "fun
      indoor activities for families" returns all 4 gaming venues
      including PUNO with its real address/rating; LAPX no longer shows
      the verify caveat; "rooftop sports arenas" returns exactly the 2
      real rooftop venues; a compound itinerary (temple, badminton,
      dinner, nightlife) correctly order-tags the sports facility
      alongside every other category in one sequence
- [x] Full regression pass: temples, parks, restaurants, cinemas, shops,
      attractions, nightlife, hotel dedup, resorts, homestays, and a
      genuinely off-topic question — all still correct. Noticed 2
      separate one-off empty-reply flakes during this pass (retried
      clean both times) — same pre-existing `gemini-3.5-flash-lite`
      response randomness documented earlier in this file
- [x] **Found a real, separate bug during this regression pass, NOT
      caused by sports.js**: "shopping near Fancy Bazaar" also returned
      2 hotels and 1 homestay, because "Fancy Bazaar" is a real area in
      both `shops.js` and `accommodations.js`, and the sibling-deference
      fix built for accommodations only defers hotels/resorts/homestays
      to EACH OTHER — it has no awareness of a completely different
      category file like shops.js. Confirmed directly this is entirely
      within accommodations.js's own matching (shops.js unaffected;
      sports.js not involved). Flagged to the user rather than silently
      fixed, since a real fix means deciding whether every category
      should defer to every other category globally — a bigger
      architectural question than a same-file sibling fix

## Bug fix: unmatched sub-topic in a compound question triggered a full decline (2026-09-03)
- [x] User asked me to stress-test the new sports categories with a batch
      of questions ("I want to learn cricket/tennis/football and hockey",
      "play cricket", "arcade or gaming", "pickleball, badminton etc.",
      "hotel near Barsapara stadium") and report honestly first. 5 of 7
      were genuinely good (including "learn cricket"/"learn tennis"
      working correctly with no dedicated "learn" trigger needed, since
      the sport name alone was enough); one was a real, reproducible bug
- [x] "I want to learn football and hockey" got the full off-topic
      decline 2 of 3 times. Root cause, confirmed at the data layer
      first: football has 5 real bookable facilities, but hockey has
      ZERO (the only hockey venue in the data is a spectator stadium, not
      a bookable facility) — so the football candidate list was genuinely
      non-empty and correct, but the unmatched "hockey" part was dragging
      the whole reply into a decline anyway. One retry's own wording gave
      the mechanism away: "I can't help with hockey — but I'd love to
      help you plan some football training!" — the model correctly
      recognized hockey had no match, but let that verdict apply to the
      entire message on 2 of 3 tries instead of just the unmatched part.
      This is the third time this session this exact failure shape has
      appeared (the vague-park-itinerary bug, then the casual-phrasing
      accommodation bug, now this) — always the same root cause: a
      compound request where part of it has no real data confuses the
      model into declining everything, unless it wins that judgment call,
      which isn't reliable on its own
- [x] Fixed generally in `systemPrompt.js`, not sports-specifically — this
      exact bug shape could recur for any category — by extending the
      existing "vague ≠ off-topic" paragraph (added earlier today for the
      park bug) with a new paragraph covering the DIFFERENT case: a part
      of the request that's specific (not vague) but has genuinely no
      verified match anywhere. Explicitly named as a "partial-answer
      situation, not a decline situation" — answer the matched part(s)
      fully, and for the unmatched part, say plainly there's no verified
      option rather than guessing or declining the whole message
- [x] Verified live: the exact failing message now succeeds 5/5 (previously
      failing 2/3) — real football facilities returned every time, no
      decline, honest about hockey having no verified option
- [x] Full regression pass against a fresh server: both of today's earlier
      off-topic-decline fixes (the vague-park compound itinerary, and the
      casual "room to crash" accommodation phrasing) still hold; temples,
      restaurants, nightlife, hotel dedup, spectator venues, sports
      facilities, gaming venues, and a genuinely off-topic question — all
      unaffected

## Added transport as three new categories (2026-09-03)
- [x] User wanted a `transport.js` covering ASTC bus terminals, railway
      stations, airport, "and some other" — discussed before building.
      User asked "is there a water terminal?" — researched and found
      Gateway of Guwahati Terminal and Jetty (Pan Bazaar), a real,
      purpose-built modern river terminal, distinct from the two
      traditional ferry ghats (Kachari Ghat, Sukreswar Ghat) also
      researched
- [x] User then substantially expanded scope: also cover "how do I get to
      Guwahati" / "how do I travel from Guwahati to X" questions from the
      hub data itself; mention within-city options (govt buses, autos,
      Uber/Ola/Rapido) whenever asked about getting around inside the
      city; and — the biggest new piece — research and add ~10 real,
      rated private cab-hire businesses and ~5 real, rated self-drive
      rental businesses, each with a real phone number, "rechecked at
      least twice." Confirmed two design choices before building: (1)
      cab/self-drive entries include area, phone, Google rating (where
      findable), and specialty — richer than the "not much info needed"
      style used for the hub data; (2) the within-city info is a plain
      instruction in the system prompt, not a data lookup, since there's
      no specific venue/route to verify or list
- [x] Researched via WebSearch, cross-checked against at least two
      independent sources each: 8 transport hubs, 8 cab-hire businesses,
      5 self-drive businesses — all with real addresses/areas, and every
      cab/self-drive entry with a real phone number and (where findable)
      a real rating + review count
- [x] Two real candidates deliberately excluded after research, not
      silently dropped: "Gear Up Now" self-drive (a same-area listing
      under a similar name was flagged "Closed Down," so current
      operating status couldn't be confirmed) and "Mini Taxi Tours &
      Travels" cab-hire (a real, well-rated business, but no phone number
      could be confirmed after two separate searches) — reported to the
      user rather than including either on a guess
- [x] One honesty note carried into the app itself: unlike every other
      category (which consistently cites Google), these ratings came from
      a mix of Google and aggregator sites (Justdial, SafarCabby)
      depending on what each business's own listings actually showed —
      noted explicitly rather than presenting a single, implied source
- [x] Built `transport.js` (one file, three groups, same reasoning as
      accommodations.js). None of the three carry day/order fields —
      arriving/departing or booking a cab isn't a sequenced daily
      activity, same reasoning already applied to accommodations
- [x] Bug found and fixed during my own pre-live testing: "where does the
      river cruise start from" matched only the two ferry ghats, missing
      the actual cruise terminal (Gateway of Guwahati) — the type-keyword
      table had "river cruise" folded into the Ferry Ghat pattern instead
      of its own Water Terminal signal. Split "cruise"/"jetty" into their
      own Water Terminal match; reverified both "river cruise" and "ferry
      to Umananda" resolve to the correct, different hubs
- [x] `server.js`/`systemPrompt.js`/`public/script.js`: wired the 3 new
      categories, no day/order (the first categories since accommodations
      to be excluded). Reused the existing `'reviewCount' in rec` branch
      for cab/self-drive cards (same rating+reviewCount shape as
      homestays) rather than duplicating it; added one new `'type' in
      rec` branch for transport hubs, and one generic phone-number line
      appended to any card whose data includes a `phone` field
- [x] Verified live against a fresh server: "how do I get to Guwahati
      from Delhi" correctly surfaces the airport + railway station;
      "where does the river cruise start from" now correctly resolves
      to only the cruise terminal (not the ferry ghats); "how do I get
      around within Guwahati" correctly returns no data and a plain
      buses/autos/apps answer; outstation cab and self-drive questions
      each correctly return only their own 8/5 real businesses with no
      cross-leakage; a live pricing question is correctly declined
      honestly while still handing over the real business's contact info
- [x] Full regression pass: temples, parks, restaurants, nightlife, hotel
      dedup, spectator venues, the football/hockey partial-decline fix
      from earlier today, and a genuinely off-topic question — all
      unaffected

## Wording fix: off-topic decline phrase reused for "no live data" honesty (2026-09-03)
- [x] Noticed while verifying the new cab-hire feature: asking "how much
      will Rocket Cab charge me right now?" got a real, correct answer
      (real contact info, honestly no live pricing) — but worded as "I'm
      focused on being your Guwahati guide, so I can't help with live
      pricing..." — reusing the exact phrase this project reserves for a
      genuine off-topic decline, for what's actually a fully on-topic
      question the bot just doesn't have live data for. Functionally
      correct, but confusingly worded
- [x] Fixed in `systemPrompt.js`: the general "say so honestly rather
      than guessing" instruction now gives its own distinct example
      phrasing ("I don't have live pricing for that, but here's what I
      can tell you...") and explicitly says never to reach for the
      off-topic phrasing for this case; added a matching note right next
      to the off-topic example itself, reserving it strictly for
      questions with nothing to do with Guwahati
- [x] Verified: the exact reported case now correctly says "I don't have
      live pricing..." 3/3 times, never reusing the off-topic phrase;
      confirmed genuine off-topic questions still decline correctly, and
      temple-timing honesty / temple lookups / the football-hockey
      partial-answer fix from earlier today are all unaffected

## Added real Brahmaputra cruises into attractions.js (2026-09-03)
- [x] After researching several real cruise operators (Alfresco Grand,
      Star Cruise Brahmaputra, MV Kohuwa Bon, MV Mahabaahu) and building
      a comparison table together, discussed where this data belongs.
      Decided (confirmed with the user): logistics questions ("how do I
      get to Umananda") stay answered by the existing transport.js ferry
      data; genuine activity/experience questions ("what cruises are
      there", "what should I do in Guwahati", a multi-day itinerary)
      belong in attractions.js instead, since cruises are itinerary-
      eligible activities (day/order tagging) the same way a temple visit
      or a sports facility is — unlike transport.js's hubs, which
      deliberately have no day/order
- [x] Replaced the old placeholder "Brahmaputra River Experience" entry
      (a single vague line with no real operator detail) with 4 real
      entries: Alfresco Grand (Tier 1, reusing the vacated rank-2 slot —
      no renumbering needed since it's a straight 1-for-1 swap), Star
      Cruise Brahmaputra and MV Kohuwa Bon (Tier 2), and MV Mahabaahu
      (Tier 3 — deliberately not Tier 2 alongside the other three, since
      it's a 2-7 *night* commitment, not a same-day outing, and its
      highlight text says so plainly rather than implying it fits into a
      short visit)
- [x] Bug found and fixed during my own pre-live testing: the
      NAME_KEYWORDS entry for the old placeholder entry (`river
      experience|river cruise|sunset cruise`) still existed and pointed
      to a now-renamed/removed entry — worse, being a NAME match, it
      would have exclusively narrowed a generic "what cruises are there"
      question down to just one operator, hiding the other three real
      cruises entirely. Removed the generic phrase from NAME_KEYWORDS
      (name-matches are for actual venue names only) and added the 4
      real operator names instead; a genuinely generic cruise question
      now correctly falls through to the existing 'river-experience'
      theme match, surfacing all four real operators together
- [x] Second bug found the same way: "what cruises are THERE" (plural)
      matched nothing at all — the THEME_KEYWORDS pattern for
      'river-experience' used `\bcruise\b`, which (same plural-word bug
      class hit several times earlier this project — cafes, bars,
      dance/club) fails on the plural since the trailing `\b` isn't a
      boundary right before a following "s". Fixed to `\bcruises?\b`
- [x] Verified live: "what cruises are there and their details" now
      correctly returns exactly the 4 real operators (not the tangential
      Ropeway/Heritage-Centre entries also tagged 'river-experience' —
      confirmed Gemini reasonably excludes those on its own even though
      they're in the candidate list); "how do I get to Umananda" still
      correctly stays a ferry/logistics answer with zero cruise leakage;
      named lookups for all 4 operators correct; a 2-day itinerary
      request correctly slotted Alfresco Grand into Day 1 with a real
      order position alongside the Ropeway and Heritage Centre
- [x] **Found a separate, real gap while testing, unrelated to cruises
      specifically — reported rather than silently fixed given the
      broader scope it touches**: "what should I SEE in Guwahati"
      reliably uses the Tier-1 fallback (3/3 live attempts, 5-9 real
      attraction cards each time), but "what should I DO in Guwahati" —
      an equally natural phrasing — reliably does NOT (0/3 live attempts,
      always a vague non-answer or clarifying question), even though the
      exact same 9 real Tier-1 candidates are available either way after
      fixing SIGHTSEEING_TRIGGER to recognize "do" (which itself was a
      real, separate bug: the trigger only allowed "do" after "things to
      ___", not after "what should/can/to (i) ___" — fixed, verified the
      data layer now correctly returns 9 candidates for "what should I
      do" too). The REMAINING gap (Gemini not reliably using those
      candidates for "do" phrasing specifically) is likely because "do"
      is genuinely broader than "see" in English — arguably a "what
      should I do" question ideally deserves a blend across attractions,
      food, and nightlife together, not just a narrower attractions-only
      answer, so this may need real system-prompt design thought rather
      than a quick fix. Flagged for the user's decision, not fixed here
- [x] Full regression pass: temples, parks, restaurants, hotels, sports,
      transport, and a genuinely off-topic question — all unaffected
- [x] User asked me to fix the "what should I do" gap directly. Checked
      first whether other categories (temples/restaurants/nightlife/
      parks/shops/sports) had any real candidate data available for a
      purely generic "what should I do in Guwahati" message — none do,
      each requires its own specific keyword the generic phrasing doesn't
      contain — so the real fix wasn't "blend more categories," it was
      making Gemini reliably use the one real candidate list it already
      had (attractions' Tier-1 fallback) for "do" phrasing the same way
      it already reliably does for "see" phrasing
- [x] Fixed in `systemPrompt.js`'s attractions guardrail: explicitly
      states "what should I do" and "what should I see" are the same
      question and should get the same confident answer, and that "do"
      reading as broader than "see" is not a reason to hold back real,
      already-verified places
- [x] Verified live: "what should I do in Guwahati?" now returns all 9
      real Tier-1 attractions 5/5 attempts (previously 0/3). Regression
      pass confirmed "what should I see" still works, the vague-park
      clarifying-question behavior is unaffected (making attractions more
      assertive didn't make parks less willing to ask its own clarifying
      question), and cruises/temples/off-topic decline all still correct

## Bug fix: "river exploration" matched no real data at all (2026-09-03)
- [x] User asked me to test "give me details of river exploration in
      Guwahati?" live. Got a vague, generic reply with no real operator
      named — confirmed at the data layer this was a genuine matching
      gap, not a Gemini judgment call
- [x] Root cause, two separate gaps in `attractions.js`: the sightseeing
      trigger's `\bexplore\b` only matches the bare verb, never its own
      noun form "exploration"; and the river-experience theme keyword had
      no trigger for the plain word "river" itself, only "cruise"/
      "boat"/"riverfront" — so a fully natural, real question matched
      neither the general sightseeing trigger nor the specific river
      theme
- [x] Fixed both: broadened to `\bexplor(e|ing|ation)\b`, and added
      `\briver\b` to the river-experience theme pattern
- [x] Verified live: the exact reported question now returns all 7 real
      river-related cards (the 4 cruise operators plus Umananda, the
      Ropeway, and the River Heritage Centre) with a warm orienting reply
      instead of a vague non-answer. Regression pass confirmed "what
      should I do/see," named temple lookups, the park clarifying-
      question behavior, and the off-topic decline are all unaffected

## Split "learn a sport" from "where can I play" in sports.js (2026-09-03)
- [x] User gave an explicit routing rule after reviewing earlier live
      tests: "learn [a sport]"/coaching/training questions should answer
      from Government/Institutional/Association-operated venues, while
      "where can I play"/gaming questions keep using the Private/
      Recreational and Gaming & Entertainment groups as before. Confirmed
      with one clarifying question: even literal spectator stadiums
      (Barsapara, Nehru Stadium) should count for "learn," since they're
      government-operated, not just the training-flavored venues (SAI
      Regional Centre, Chachal Tennis Complex)
- [x] Implementation note: since `operator` already exists on both
      spectatorVenues (100% government/institutional/association) AND
      sportsFacilities (mostly Private, but All Assam Tennis Association
      and Assam Archery Club are genuinely Association-run), a "learn"
      question now correctly blends BOTH groups — e.g. "learn tennis"
      surfaces Chachal Tennis Complex + SAI Regional Centre from
      spectatorVenues AND All Assam Tennis Association from
      sportsFacilities, filtered to operator-Association only there
- [x] Added a `LEARN_TRIGGER` ("learn"/"coaching"/"training"), moved
      "coaching" out of `FACILITY_TRIGGER` into it. Deliberately did NOT
      fold the learn-trigger into the shared `hasSpectatorSignal` helper
      that sibling groups check for deference — doing so would have made
      `getRelevantSportsFacilities` wrongly defer entirely to spectator
      on any "learn" question, instead of applying its own new
      Association-only filter
- [x] Bug found and fixed during my own pre-live testing: after the data-
      layer change, "I want to learn cricket" still got the FULL off-
      topic decline 3/3 times, even though the data layer now correctly
      returned 3 real cricket stadiums. Root cause: the
      spectatorVenueRecommendations guardrail in `systemPrompt.js` only
      ever described "watching a match/stadium" as the reason to use that
      list — with no framing covering "learn a sport," and no other
      category having any candidates either (no Association cricket
      facility exists), Gemini had no guardrail describing why cricket
      stadiums would be relevant to a "learn cricket" question, and
      declined the whole thing rather than using them. This is the same
      "compound/valid request has no matching guardrail framing → wrongly
      declines" failure shape hit several times earlier today, just
      surfacing through the guardrail's own worded scope this time rather
      than an empty candidate list
- [x] Fixed by explicitly adding "learn/coached/trained in a sport" to
      the spectatorVenueRecommendations guardrail's description of when
      to use that list, and noting the facilities guardrail already gets
      a pre-filtered Association-only list for a learn question, no
      further narrowing needed from Gemini's side
- [x] Verified live: "I want to learn cricket" now correctly returns the
      real cricket stadiums 3/3 (previously declining 3/3); "learn
      tennis" correctly blends both real groups; "where can I play
      cricket/badminton" unaffected (still private-facility-only, no
      spectator leakage); "watch a cricket match" (pure spectate, no
      learn) still unaffected; gaming, named temple lookup, and the
      off-topic decline all still correct

## Split "adventure sport" from wildlife/nature attractions (2026-09-03)
- [x] User tested "I want adventure sport in Guwahati" and got a mix of
      wildlife safaris and museum attractions (Pobitora, Guwahati
      Ropeway, Guwahati Planetarium, etc.) — none of which are actually
      sports. Discussed and confirmed a three-way split before building:
      bare "adventure"/"nature" keeps the existing wildlife/scenic
      attractions; "adventure sport" specifically routes to the real
      physical activities in sports.js instead (go-karting, archery,
      PUNO's rock climbing/obstacle course/trampoline); the genuinely
      ambiguous phrase "adventure activity/activities" (no "sport", no
      nature/wildlife word) asks a brief clarifying question instead of
      guessing — "Are you looking for adventure sports, or a natural
      wildlife adventure?" — the same pattern parks.js already uses for
      a vague park request
- [x] Found and fixed a real mistagging while building this: Guwahati
      Planetarium and Regional Science Centre were both tagged
      `adventure-activity` in attractions.js, which is wrong — neither is
      an adventure activity. Root cause: the theme's own keyword pattern
      matched the bare word "activity"/"activities" on its own, far too
      generic. Narrowed to just the word "adventure" (bare "nature"
      already has its own separate, correctly-scoped theme tag, so
      nothing lost there) and removed the incorrect tag from both entries
- [x] Implementation: added a curated `ADVENTURE_SPORT_ACTIVITIES` set in
      sports.js (go-karting, archery, rock-climbing, obstacle-course,
      trampoline) spanning both sportsFacilities and gamingVenues — "I
      want adventure sport" now correctly blends Warisa Estate/LAPX
      Go-Karting + Assam Archery Club (facilities) with PUNO Advance
      (gaming) in one answer. attractions.js short-circuits to empty for
      both "adventure sport" (routes elsewhere) and the bare ambiguous
      phrase (needs a clarifying question), while leaving bare "adventure"
      and "nature" matching exactly as before
- [x] Bug found and fixed during my own pre-live testing: the ambiguous
      "adventure activity" case didn't reliably produce the intended
      clarifying question — Gemini often padded the reply with unrelated
      content instead (a river cruise mention, the in-city transport
      instruction) rather than asking. Fixed by adding an explicit
      guardrail paragraph naming the exact clarifying question to ask and
      instructing against padding with unrelated content
- [x] Second bug found during the same testing pass, this one only
      partially resolved: after adding that paragraph, a bare "I want
      some adventure" — no "Guwahati," no other context — started
      wrongly triggering the SAME clarifying question, even though real
      wildlife/nature data was available and correctly provided. Reworded
      the guardrail to explicitly key off which array is actually
      non-empty rather than re-deciding intent from the wording. This
      fixed the realistic phrasing reliably — "I want some adventure IN
      GUWAHATI" now works correctly 5/5 live attempts — but the
      zero-context bare phrasing (no "Guwahati," no other words at all)
      remains unreliable (~1/5 correct), and the ambiguous-clarifying-
      question case itself still occasionally (1/5 in testing) falls
      into the general off-topic decline instead of asking its intended
      question. Both remaining gaps match this project's already-
      documented `gemini-3.5-flash-lite` response-randomness limitation
      (temperature 0.2 reduces but doesn't eliminate it) rather than a
      further code-fixable issue — flagged honestly rather than claiming
      full reliability
- [x] User asked me to keep iterating on the two residual gaps, up to 3
      attempts. Fixed on the FIRST attempt — reworded the guardrail two
      ways: made the "non-empty list → always present it, never ask"
      rule explicitly MANDATORY rather than a soft preference, and tied
      the ambiguous-clarifying-question case back to the EXISTING general
      "vague-but-on-topic ≠ off-topic" rule (the one already governing
      parks) instead of treating it as a brand-new, isolated instruction
      competing for attention against the general off-topic-decline rule
- [x] Verified live: bare "I want some adventure" with zero other
      context now correctly returns real attraction data 5/5 (previously
      ~1/5); the ambiguous "adventure activities" case now correctly asks
      the intended clarifying question 5/5 (previously mixed between
      correct/off-topic-decline/padded-non-answer). Full regression pass
      (9 different questions, one re-run after an apparent one-off flake
      on "wildlife" cleanly reproduced as 3/3 correct) confirms "adventure
      sport," "where can I see wildlife," "what should I do/see," "learn
      tennis," "where can I play cricket," the park clarifying-question
      behavior, a named temple lookup, and the genuine off-topic decline
      are all unaffected

## Added hospitals as a new category — area + specialty matching (2026-09-03)
- [x] User shared a Guwahati hospitals research document (30 hospitals)
      and asked if it made sense. This is the first category with real
      safety stakes, so three things were discussed and confirmed before
      building anything: (1) the bot always includes a brief "call 108
      for a genuine emergency" line whenever hospital data is involved;
      (2) the source's own honest distinction between plain "24×7",
      "24×7 listed" (unverified), and "Verify"/"Verify clinical hours"
      is preserved as real data, never collapsed into one confident
      claim; (3) no clinical judgment ever — confirmed via a direct
      question that matching fires ONLY on a hospital's own specialty
      words a visitor names directly ("cardiology," "eye hospital"),
      never on a described symptom ("chest pain"), which would edge into
      medical triage
- [x] User's actual feature request: match by area (same pattern as
      every prior category) AND by specialty keyword — e.g. "stroke"
      should point specifically at GNRC Hospitals, since its own real
      "Key Specialities" text literally says "Neurosciences; stroke;
      trauma; emergency; multispeciality." Confirmed this is
      straightforward, not "too wide" — the same AND-combination pattern
      already proven in restaurants.js (cuisine+area) and sports.js
      (activity+area)
- [x] Built `hospitals.js` (one flat array + one matching function,
      unlike the multi-group files — a visitor doesn't think in terms of
      the source's 11 Category labels, tier is just a filter/fallback
      field). Hand-extracted a canonical `specialties` array per hospital
      from each one's real "Key Specialities" text — generic filler
      ("35 departments," "multispeciality," "newer tertiary facility")
      stays in highlight text only, never becomes a fake matchable tag.
      4 entries (Sri Sankaradeva Nethralaya, Pragjyoti Eye Care,
      Institute of Human Reproduction, ASG Eye Hospital) genuinely have
      no Private/Government ownership stated in the source — left as
      `ownership: null` rather than guessed. No day/order fields — going
      to a hospital isn't a leisure itinerary stop, same reasoning as
      accommodations.js/transport.js
- [x] `server.js`/`systemPrompt.js`/`public/script.js`: wired the same
      mechanical way as every prior category. Reused the `activities`
      field name for the specialties array (schema-facing only — the
      internal data model still calls it `specialties`) purely to avoid
      a `getTagField` edit, same trick already used for sports.js. New
      `'emergency' in rec` card branch shows the emergency status as an
      honest label (e.g. "Call ahead — hours not verified") rather than
      a flat confident string
- [x] Verified live: "hospital in GS Road" → the 4 real GS-Road-area
      hospitals; "which hospital treats stroke" → GNRC Hospitals –
      Dispur Unit specifically, matching the user's own worked example
      exactly; "cardiac hospital in Christian Basti" → Apollo only
      (AND-combination, not OR); a vague "which hospital should I go to"
      → the real tertiary-referral/super-speciality fallback set, not
      all 30; a named lookup ("GMCH") → exactly one result; a
      "verify"-flagged entry (Sri Sankaradeva Nethralaya) correctly got
      real hedging ("clinical hours here are not verified, call ahead")
      rather than a confident claim, while GMCH's genuinely-confirmed
      24x7 status was stated plainly, showing the distinction actually
      holds end-to-end, not just in the data file
- [x] Safety check: "I have chest pain, which hospital should I go to?"
      correctly declined to diagnose ("I cannot advise on symptoms") and
      included the 108/nearest-hospital line. One honest nuance found,
      not a failure exactly: the DATA layer never matched "chest pain" to
      any specialty (confirmed — no symptom vocabulary exists in
      `SPECIALTY_KEYWORDS`), but Gemini, given the vague-fallback set of
      6 real hospitals, chose to present only the 3 cardiac-tagged ones
      rather than the full set — a soft echo of symptom-awareness in its
      own downstream reasoning even though the underlying matching logic
      stayed correctly symptom-blind. Not a dangerous failure (it never
      claimed a hospital was "best" for chest pain, and it explicitly
      declined to diagnose), but noted honestly rather than claiming the
      system is symptom-blind end-to-end
- [x] Full regression pass: temples, restaurants, hotels, sports,
      transport, adventure sport, and a genuinely off-topic question —
      all show zero hospital-data leakage and are otherwise unaffected

## Housekeeping
- [ ] Fix Render auto-deploy so future pushes go live without a manual click

## Later (not in v1)
- [ ] Optional future features: photos, multiple languages, password protection
