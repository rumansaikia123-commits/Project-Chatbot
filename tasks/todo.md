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

## Housekeeping
- [ ] Fix Render auto-deploy so future pushes go live without a manual click

## Later (not in v1)
- [ ] Optional future features: photos, multiple languages, password protection
