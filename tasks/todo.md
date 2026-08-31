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

## Phase B: Accounts + database (not started)
- [ ] Real "Sign in with Google" login via Supabase (free tier, avoids us ever handling passwords ourselves)
- [ ] Per-person saved chat history

## Housekeeping
- [ ] Fix Render auto-deploy so future pushes go live without a manual click

## Later (not in v1)
- [ ] Optional future features: photos, multiple languages, password protection
