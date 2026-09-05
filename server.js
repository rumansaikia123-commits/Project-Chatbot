// This is the chatbot's backend server.
// It runs privately (never seen by visitors) and does one job:
// receive a message from the webpage, ask Gemini for a reply, send that reply back.

require('dotenv').config(); // loads secret values from .env into process.env

const express = require('express');
const { GoogleGenAI, Type } = require('@google/genai');
const buildSystemPrompt = require('./systemPrompt');
const { getRelevantVenues } = require('./venues');
const { getRelevantRestaurants } = require('./restaurants');
const { getRelevantParks } = require('./parks');
const { getRelevantTemples } = require('./temples');
const { getRelevantCinemas } = require('./cinemas');
const { getRelevantShops } = require('./shops');
const { getRelevantAttractions } = require('./attractions');
const { getRelevantHotels, getRelevantResorts, getRelevantHomestays } = require('./accommodations');
const { getRelevantSpectatorVenues, getRelevantSportsFacilities, getRelevantGamingVenues } = require('./sports');
const { getRelevantTransportHubs, getRelevantCabServices, getRelevantSelfDriveServices } = require('./transport');
const { getRelevantHospitals } = require('./hospitals');

// "Structured output": instead of letting Gemini write its whole answer as
// one block of prose (which the frontend then has to guess-format with
// markdown tricks like **bold**), this schema tells Gemini to fill in a
// strict template — real, typed data fields — for any restaurants or
// nightlife venues it recommends. `Type` (imported above) is just an enum
// of the data types this schema understands: STRING, NUMBER, ARRAY, OBJECT.
//
// This applies to every reply, not just recommendation ones — a greeting
// or an itinerary question still comes back with a normal `reply` string,
// just with both recommendation arrays empty alongside it.
const CHAT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: 'The conversational reply text shown to the visitor.',
    },
    restaurantRecommendations: {
      type: Type.ARRAY,
      description:
        'Restaurants being recommended in this reply. Empty if this reply is not recommending restaurants.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          cuisines: { type: Type.ARRAY, items: { type: Type.STRING } },
          rating: { type: Type.NUMBER },
          costForTwo: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
          // Nullable: only set for a multi-day itinerary (2+ days), so the
          // frontend can group cards by day. Null for a normal question.
          day: { type: Type.NUMBER, nullable: true },
          // Nullable: only set alongside `day`, marking this item's
          // position (1, 2, 3...) within that day's own sequence of
          // activities, so cards render in the order they actually happen
          // rather than a fixed category order (temple, then restaurant,
          // then nightlife...) that can put a later activity's card before
          // an earlier one's.
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'cuisines', 'rating', 'highlight', 'day', 'order'],
      },
    },
    nightlifeRecommendations: {
      type: Type.ARRAY,
      description:
        'Nightlife venues being recommended in this reply. Empty if this reply is not recommending nightlife venues.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          // Nullable: unlike restaurants, several venues never had a star
          // rating in the original source data.
          rating: { type: Type.NUMBER, nullable: true },
          costForTwo: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'tags', 'rating', 'costForTwo', 'highlight', 'day', 'order'],
      },
    },
    parkRecommendations: {
      type: Type.ARRAY,
      description:
        'Parks being recommended in this reply. Empty if this reply is not recommending parks.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          // Parks have no star rating or clean numeric cost in the source
          // data (entry fees include free-entry windows and concessions
          // that don't collapse into a single number), so unlike
          // restaurants/nightlife there's no rating/costForTwo here.
          daysOff: { type: Type.STRING },
          entryFee: { type: Type.STRING },
          highlight: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'activities', 'daysOff', 'entryFee', 'highlight', 'day', 'order'],
      },
    },
    templeRecommendations: {
      type: Type.ARRAY,
      description:
        'Temples being recommended in this reply. Empty if this reply is not recommending temples. The fuller history/mythology/spiritual-significance story belongs in "reply", not here — these fields are just the compact card facts.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          deity: { type: Type.STRING },
          themes: { type: Type.ARRAY, items: { type: Type.STRING } },
          // Nullable: not every temple in the source data has a stable,
          // verified timetable or a documented dress code.
          timings: { type: Type.STRING, nullable: true },
          dressCode: { type: Type.STRING, nullable: true },
          highlight: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'deity', 'themes', 'highlight', 'day', 'order'],
      },
    },
    cinemaRecommendations: {
      type: Type.ARRAY,
      description:
        'Cinemas being recommended in this reply. Empty if this reply is not recommending cinemas. Never fill in a showtime, ticket price, or seat availability — this app has no live data for those.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          bestFor: { type: Type.STRING },
          highlight: { type: Type.STRING },
          tip: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'bestFor', 'highlight', 'tip', 'day', 'order'],
      },
    },
    shopRecommendations: {
      type: Type.ARRAY,
      description:
        'Shopping destinations (malls, markets, or the GS Road corridor) being recommended in this reply. Empty if this reply is not recommending shopping destinations.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          bestFor: { type: Type.STRING },
          highlight: { type: Type.STRING },
          tip: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'tags', 'bestFor', 'highlight', 'tip', 'day', 'order'],
      },
    },
    attractionRecommendations: {
      type: Type.ARRAY,
      description:
        'General sightseeing places being recommended in this reply (museums, wildlife, viewpoints, day trips, etc. — NOT temples or parks, which have their own dedicated arrays). Empty if this reply is not recommending sightseeing.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          themes: { type: Type.ARRAY, items: { type: Type.STRING } },
          distanceFromDispur: { type: Type.STRING },
          highlight: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'themes', 'distanceFromDispur', 'highlight', 'day', 'order'],
      },
    },
    hotelRecommendations: {
      type: Type.ARRAY,
      description:
        'In-city hotels being recommended in this reply. Empty if this reply is not recommending hotels. Never fill in live room availability or current pricing — this app has no live data for those. No "day"/"order" fields exist here — a place to stay is not part of the day-by-day itinerary sequencing.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          stars: { type: Type.NUMBER, nullable: true },
          rating: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
        },
        required: ['name', 'area', 'highlight'],
      },
    },
    resortRecommendations: {
      type: Type.ARRAY,
      description:
        'Out-of-town resorts (Sonapur, Pobitora/Mayong, Chandrapur, Amsing/Jorabat — all outside Guwahati proper) being recommended in this reply, for a day-trip or weekend-getaway question. Empty if this reply is not recommending resorts. Never fill in live room availability or current pricing.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          stars: { type: Type.NUMBER, nullable: true },
          rating: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
        },
        required: ['name', 'area', 'highlight'],
      },
    },
    homestayRecommendations: {
      type: Type.ARRAY,
      description:
        'Homestays, guesthouses, and Airbnb-style stays being recommended in this reply. Empty if this reply is not recommending one of these. Never fill in live availability or current pricing.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          reviewCount: { type: Type.NUMBER },
          highlight: { type: Type.STRING },
        },
        required: ['name', 'area', 'rating', 'reviewCount', 'highlight'],
      },
    },
    spectatorVenueRecommendations: {
      type: Type.ARRAY,
      description:
        'Stadiums and major government/institutional sports venues being recommended in this reply, for a "watch a match" or spectator question — NOT bookable private facilities, which have their own array. Empty if this reply is not recommending a spectator venue. These are ticket-access/coaching venues, not walk-up bookable.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          indoorOutdoor: { type: Type.STRING },
          operator: { type: Type.STRING },
          highlight: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'activities', 'indoorOutdoor', 'operator', 'highlight', 'day', 'order'],
      },
    },
    sportsFacilityRecommendations: {
      type: Type.ARRAY,
      description:
        'Private, bookable sports facilities (courts, turfs, clubs) being recommended in this reply, for a "where can I play X" question — NOT spectator stadiums, which have their own array. Empty if this reply is not recommending one.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          indoorOutdoor: { type: Type.STRING },
          operator: { type: Type.STRING },
          rating: { type: Type.NUMBER, nullable: true },
          reviewCount: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'activities', 'indoorOutdoor', 'operator', 'highlight', 'day', 'order'],
      },
    },
    gamingRecommendations: {
      type: Type.ARRAY,
      description:
        'Indoor gaming/arcade/family entertainment venues (bowling, VR, trampoline parks, etc.) being recommended in this reply. Empty if this reply is not recommending one.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          rating: { type: Type.NUMBER, nullable: true },
          reviewCount: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
          day: { type: Type.NUMBER, nullable: true },
          order: { type: Type.NUMBER, nullable: true },
        },
        required: ['name', 'area', 'activities', 'highlight', 'day', 'order'],
      },
    },
    transportHubRecommendations: {
      type: Type.ARRAY,
      description:
        'Fixed transport hubs (airport, railway stations, bus terminals, the water terminal, ferry ghats) being recommended in this reply, for a "how do I get to/from Guwahati" or "where does the ferry/cruise start from" question. Empty if this reply is not recommending one. Never invent a schedule, fare, or live timing — this app has no live data for those.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          type: { type: Type.STRING },
          highlight: { type: Type.STRING },
        },
        required: ['name', 'area', 'type', 'highlight'],
      },
    },
    cabServiceRecommendations: {
      type: Type.ARRAY,
      description:
        'Private, chauffeur-driven cab-hire businesses being recommended in this reply, for an inter-state or intra-state cab-hire question — NOT for a question about app-based ride-hailing (Uber/Ola/Rapido) or self-drive rental, which are handled separately. Empty if this reply is not recommending one.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          phone: { type: Type.STRING },
          rating: { type: Type.NUMBER, nullable: true },
          reviewCount: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
        },
        required: ['name', 'area', 'phone', 'highlight'],
      },
    },
    selfDriveRecommendations: {
      type: Type.ARRAY,
      description:
        'Self-drive car rental businesses being recommended in this reply. Empty if this reply is not recommending one.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          phone: { type: Type.STRING },
          rating: { type: Type.NUMBER, nullable: true },
          reviewCount: { type: Type.NUMBER, nullable: true },
          highlight: { type: Type.STRING },
        },
        required: ['name', 'area', 'phone', 'highlight'],
      },
    },
    hospitalRecommendations: {
      type: Type.ARRAY,
      description:
        'Hospitals being recommended in this reply. Empty if this reply is not recommending one. This is a pure directory lookup — never infer a specialty from a described symptom, never make a clinical judgment or imply a diagnosis, and never invent bed availability, wait times, doctor names, or insurance/payment details.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          area: { type: Type.STRING },
          ownership: { type: Type.STRING, nullable: true },
          tier: { type: Type.STRING },
          emergency: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          highlight: { type: Type.STRING },
        },
        required: ['name', 'area', 'tier', 'emergency', 'activities', 'highlight'],
      },
    },
  },
  required: ['reply', 'restaurantRecommendations', 'nightlifeRecommendations', 'parkRecommendations', 'templeRecommendations', 'cinemaRecommendations', 'shopRecommendations', 'attractionRecommendations', 'hotelRecommendations', 'resortRecommendations', 'homestayRecommendations', 'spectatorVenueRecommendations', 'sportsFacilityRecommendations', 'gamingRecommendations', 'transportHubRecommendations', 'cabServiceRecommendations', 'selfDriveRecommendations', 'hospitalRecommendations'],
};

const app = express();
// Hosting platforms assign their own port via this environment variable;
// 3000 is only used as a fallback for local testing.
const PORT = process.env.PORT || 3000;

// Lets our server understand JSON data sent from the webpage
app.use(express.json());

// Serves the frontend files (the actual webpage) from the "public" folder
app.use(express.static('public'));

// The Gemini client, set up using the free API key from .env
// (this key is never sent to the browser — it stays on the server)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemini occasionally returns a 503 "this model is currently
// experiencing high demand" error — confirmed live on the deployed site
// via Render's own logs, showing the exact message: {"code":503,
// "message":"...Spikes in demand are usually temporary...",
// "status":"UNAVAILABLE"}. Since Google's own message says these spikes
// are temporary, a couple of automatic retries with a short pause often
// succeeds without the visitor ever seeing an error — cheaper and
// simpler than moving to a paid plan, and worth trying first. Only
// retries on this specific overload signal; a genuinely different
// problem (a bad request, an invalid key, etc.) fails immediately
// instead of retrying pointlessly.
async function generateContentWithRetry(config, maxRetries = 2, delayMs = 2000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(config);
    } catch (error) {
      const message = error.message || '';
      const isOverloaded = message.includes('UNAVAILABLE') || message.includes('"code":503') || message.includes('overloaded') || message.includes('high demand');
      if (!isOverloaded || attempt === maxRetries) {
        throw error;
      }
      console.error(`Gemini overloaded (attempt ${attempt + 1} of ${maxRetries + 1}) — retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

// This is the endpoint the webpage will call whenever the visitor sends a message.
// It expects the full conversation so far (an array of messages), so Gemini
// can remember earlier turns, e.g. "what about day 2".
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Expected a non-empty list of messages.' });
  }

  // Catch malformed messages (missing/blank content) here, before they reach
  // Gemini — otherwise the SDK throws on them and the failure gets wrongly
  // reported as a Gemini-side error instead of a bad request.
  const hasInvalidMessage = messages.some(
    (message) => typeof message.content !== 'string' || message.content.trim() === ''
  );
  if (hasInvalidMessage) {
    return res.status(400).json({ error: 'Each message must include non-empty text content.' });
  }

  try {
    // Gemini expects each message as { role, parts: [{ text }] }, and uses
    // "model" instead of "assistant" for the bot's own earlier replies.
    const contents = messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content }],
    }));

    // Computed fresh on every request so the chatbot always knows the real
    // current date in Guwahati's own timezone, regardless of where the
    // server itself happens to be physically hosted.
    const todayInIndia = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    });

    // Look at the visitor's recent messages (not just the latest one) for
    // nightlife/food keywords. A single message is too narrow: once someone
    // asks "where's good coffee" and the bot asks a follow-up question,
    // their next reply is often something short like "any area" or "give
    // me a list" — which mentions no food words at all. Checking only that
    // latest message would wrongly conclude the topic isn't food-related
    // anymore and drop the real data, even though the conversation clearly
    // hasn't moved on.
    //
    // But combining the ENTIRE conversation (no limit) went too far the
    // other way: a real user's transcript showed "coffee" mentioned once in
    // turn 1 still triggering a cafe recommendation in turn 8, well after
    // they'd moved on to sightseeing questions with nothing to do with
    // food. A window of the last 4 user messages satisfies both real
    // transcripts we've seen: it's long enough that "coffee" -> "any
    // location" -> "both" -> "give me a list" (4 turns) still works, but
    // short enough that "coffee" -> 3 unrelated turns -> "sightseeing"
    // (5th turn) correctly no longer counts as a food question.
    const RECENT_MESSAGE_WINDOW = 4;
    const allVisitorText = messages
      .filter((message) => message.role !== 'assistant')
      .slice(-RECENT_MESSAGE_WINDOW)
      .map((message) => message.content)
      .join(' ');
    const relevantVenues = getRelevantVenues(allVisitorText);
    const relevantParks = getRelevantParks(allVisitorText);
    const relevantTemples = getRelevantTemples(allVisitorText);
    const relevantCinemas = getRelevantCinemas(allVisitorText);
    const relevantShops = getRelevantShops(allVisitorText);
    const relevantAttractions = getRelevantAttractions(allVisitorText);
    const relevantHotels = getRelevantHotels(allVisitorText);
    const relevantResorts = getRelevantResorts(allVisitorText);
    const relevantHomestays = getRelevantHomestays(allVisitorText);
    const relevantSpectatorVenues = getRelevantSpectatorVenues(allVisitorText);
    const relevantSportsFacilities = getRelevantSportsFacilities(allVisitorText);
    const relevantGamingVenues = getRelevantGamingVenues(allVisitorText);
    const relevantTransportHubs = getRelevantTransportHubs(allVisitorText);
    const relevantCabServices = getRelevantCabServices(allVisitorText);
    const relevantSelfDriveServices = getRelevantSelfDriveServices(allVisitorText);
    const relevantHospitals = getRelevantHospitals(allVisitorText);
    // Temples' own area names (hill/locality) are folded into the text
    // restaurants.js sees, purely so its existing area-keyword matching can
    // pick up a genuine overlap (e.g. Umananda/Ugratara both say "Uzan
    // Bazar") — this never invents proximity data, it just makes sure a
    // real match isn't crowded out of the top-rated fallback by unrelated,
    // higher-rated restaurants. No new data, no changes to restaurants.js.
    const relevantRestaurants = getRelevantRestaurants(
      `${allVisitorText} ${relevantTemples.map((t) => t.area).join(' ')}`
    );

    const response = await generateContentWithRetry({
      // gemini-3.6-flash does an invisible "thinking" step that was eating
      // almost the entire maxOutputTokens budget, cutting real replies short.
      // flash-lite skips that step, and its free tier allows far more
      // requests per day, which matters for an app real people will use.
      model: 'gemini-3.5-flash-lite',
      contents,
      config: {
        systemInstruction: buildSystemPrompt(todayInIndia, relevantVenues, relevantRestaurants, relevantParks, relevantTemples, relevantCinemas, relevantShops, relevantAttractions, relevantHotels, relevantResorts, relevantHomestays, relevantSpectatorVenues, relevantSportsFacilities, relevantGamingVenues, relevantTransportHubs, relevantCabServices, relevantSelfDriveServices, relevantHospitals),
        // Raised from 2048: a broad "market" question now returns all 16
        // real market entries with full text fields, which needs ~2,400
        // tokens on its own. At 2048, generation hit MAX_TOKENS mid-JSON
        // and Gemini's fallback behavior nested a malformed, truncated
        // copy of the whole response inside the "reply" string instead of
        // filling the real shopRecommendations array — confirmed directly
        // via response.candidates[0].finishReason. 4096 leaves real
        // headroom (measured usage: ~2,400 tokens for this exact case).
        maxOutputTokens: 4096,
        // Without this, the model's default randomness made it ignore real,
        // correctly-provided venue/restaurant data surprisingly often —
        // e.g. claiming "no bars on hand" despite 15 being listed right in
        // its own instructions. Confirmed via repeated side-by-side testing:
        // near-total failure at the default temperature, 5/5 correct at 0.2.
        // Lower temperature makes replies a little more uniform in phrasing,
        // but that's a small trade for actually using the data it's given.
        temperature: 0.2,
        // Forces the reply to match CHAT_RESPONSE_SCHEMA exactly, instead of
        // being free-form text.
        responseMimeType: 'application/json',
        responseSchema: CHAT_RESPONSE_SCHEMA,
      },
    });

    // response.text is now a JSON string (matching the schema above), not
    // plain prose — parse it into a real object before sending it on.
    let parsed;
    try {
      parsed = JSON.parse(response.text);
    } catch (parseError) {
      // Structured output is normally guaranteed to match the schema, but
      // if it's ever malformed for some reason, fall back to showing the
      // raw text rather than failing the whole request.
      console.error('Failed to parse structured response:', parseError.message);
      parsed = { reply: response.text, restaurantRecommendations: [], nightlifeRecommendations: [], parkRecommendations: [], templeRecommendations: [], cinemaRecommendations: [], shopRecommendations: [], attractionRecommendations: [], hotelRecommendations: [], resortRecommendations: [], homestayRecommendations: [], spectatorVenueRecommendations: [], sportsFacilityRecommendations: [], gamingRecommendations: [], transportHubRecommendations: [], cabServiceRecommendations: [], selfDriveRecommendations: [], hospitalRecommendations: [] };
    }

    res.json({
      reply: parsed.reply,
      restaurantRecommendations: parsed.restaurantRecommendations,
      nightlifeRecommendations: parsed.nightlifeRecommendations,
      parkRecommendations: parsed.parkRecommendations,
      templeRecommendations: parsed.templeRecommendations,
      cinemaRecommendations: parsed.cinemaRecommendations,
      shopRecommendations: parsed.shopRecommendations,
      attractionRecommendations: parsed.attractionRecommendations,
      hotelRecommendations: parsed.hotelRecommendations,
      resortRecommendations: parsed.resortRecommendations,
      homestayRecommendations: parsed.homestayRecommendations,
      spectatorVenueRecommendations: parsed.spectatorVenueRecommendations,
      sportsFacilityRecommendations: parsed.sportsFacilityRecommendations,
      gamingRecommendations: parsed.gamingRecommendations,
      transportHubRecommendations: parsed.transportHubRecommendations,
      cabServiceRecommendations: parsed.cabServiceRecommendations,
      selfDriveRecommendations: parsed.selfDriveRecommendations,
      hospitalRecommendations: parsed.hospitalRecommendations,
    });
  } catch (error) {
    console.error('Error talking to Gemini:', error.message);
    res.status(500).json({ error: 'Something went wrong talking to Gemini.' });
  }
});

// Catches anything that goes wrong before it reaches our own routes above
// (e.g. a visitor sending broken/invalid data) and replies with a plain,
// safe error instead of Express's default page, which would otherwise
// reveal internal server file paths and code details.
app.use((err, _req, res, _next) => {
  console.error('Unexpected server error:', err.message);
  res.status(400).json({ error: 'Invalid request.' });
});

app.listen(PORT, () => {
  console.log(`Chatbot server running at http://localhost:${PORT}`);
});
