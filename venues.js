// A small, hand-researched directory of Guwahati nightlife venues (restaurants,
// bars, clubs, rooftops). Each venue has one or more "tags" describing its vibe.
// Instead of sending this whole list to Gemini on every single message (wasteful
// and would bloat every reply), getRelevantVenues() below picks out only the
// venues that actually match what the visitor asked about — a small, simple
// version of the "retrieval" step in RAG, without needing a database or
// embeddings, since these questions are naturally categorical (vibe + area).

const venues = [
  // ----- Live music -----
  { name: 'The Maroon Room', area: 'Dispur', tags: ['live-music'],
    notes: "Guwahati's only restaurant with live entertainment every night (Karaoke Fridays, Live Band Sat/Sun, DJ Kangkan Thursdays). Also an art gallery. 4.9★, ranked #2 in the city." },
  { name: 'The Anglers (Club & Tavern)', area: 'Uzan Bazar, 62 Bhuban Road', tags: ['live-music'],
    notes: 'Irish-pub-inspired. Live music Fri/Sat/Sun. Continental & Asian food. 4.8★.' },
  { name: 'Shanghai Salsa', area: 'Zoo Tiniali', tags: ['live-music'],
    notes: 'Mexican-styled pub, live bands on weekends, karaoke. Known for a lively dancing crowd.' },
  { name: 'The Lounge - Dynasty', area: 'Fancy Bazaar', tags: ['live-music'],
    notes: 'Live music and karaoke inside Hotel Dynasty. Warm ambience.' },
  { name: 'Ascend Resto Lounge & Bar', area: 'Christian Basti, Nilakshi Plaza', tags: ['live-music'],
    notes: 'Live music, great ambience, 4.4★. Konkan/Asian cuisine.' },

  // ----- Clubbing / DJ -----
  { name: 'NYX Lounge and Deck', area: 'Khanapara, above Poddar Car World', tags: ['clubbing'],
    notes: "Self-described Guwahati's #1 night club. Celebrity DJs, theme nights, big screens for sports." },
  { name: 'Roycee', area: 'Bhangagarh, Exotica Garden', tags: ['clubbing'],
    notes: 'Full bar, DJ, live sports screening. 4.2★.' },
  { name: 'XS Bar & Lounge', area: 'Tarun Nagar, inside Dynasty Hotel', tags: ['clubbing'],
    notes: 'Stylish, vibrant music scene. 4.1★, on the pricier side.' },
  { name: 'The Locals', area: 'Khanapara/Retrotown', tags: ['clubbing'],
    notes: 'DJ-driven nightlife spot.' },
  { name: 'The Vibe House', area: 'Khanapara/Six Mile, Jaya Nagar', tags: ['clubbing'],
    notes: 'Live band + DJ sets.' },
  { name: 'Nuts and Brew', area: 'Dispur, above Forever 21 (Novotel GS Road)', tags: ['clubbing', 'rooftop', 'lounge-bar'],
    notes: 'Rooftop craft-beer microbrewery with DJ and live music. 4.8★, ~₹2,500 for two.' },
  { name: 'Abacus Brewing Co & Kitchen', area: 'Khanapara, Hotel Palacio, GS Road', tags: ['clubbing', 'live-music'],
    notes: 'Craft brewery; reviewers call the live music the best in the city. 4.6★.' },

  // ----- Rooftop (all also tagged lounge-bar, since a rooftop is a kind of bar/lounge) -----
  { name: 'Skye Rooftop Bar & Pool', area: 'Novotel GS Road, 10th floor', tags: ['rooftop', 'lounge-bar'],
    notes: 'Pool-side rooftop dining, 5★, ~₹3,000 for two.' },
  { name: 'EXORO The Rooftop Pub', area: 'Roodraksh Mall, Bhangagarh, 4th floor', tags: ['rooftop', 'lounge-bar'],
    notes: 'Live DJ + music, neon-lit, panoramic views. 4.2-4.3★.' },
  { name: 'Levitate Rooftop Restaurant', area: 'Khanapara, opposite Vivanta by Taj', tags: ['rooftop', 'lounge-bar'],
    notes: 'Live music, panoramic views over Khanapara. 4.8★.' },
  { name: 'Olive Garden Rooftop Restro Cum Bar', area: 'Ganeshguri', tags: ['rooftop', 'lounge-bar'],
    notes: 'Live music evenings, eclectic Indian/Italian/Mexican menu. Mixed reviews on pricing.' },
  { name: 'Elevate Bar & Bistro', area: 'Bhangagarh', tags: ['rooftop', 'lounge-bar'],
    notes: 'Lower-confidence pick — mixed/negative reviews reported (limited drink stock, dull ambience on some visits).', lowConfidence: true },
  { name: 'The Root Barrel', area: 'Zoo Tiniali, Exotica Greens (7th floor)', tags: ['rooftop', 'lounge-bar'],
    notes: 'Rooftop craft-beer bar with panoramic city views. Mixed feedback on service speed.' },
  { name: 'Terra Mayaa', area: 'Tarun Nagar, Anil Plaza-II', tags: ['rooftop', 'lounge-bar'],
    notes: 'Open-air rooftop deck, panoramic views, full bar. 4.0-4.1★.' },

  // ----- Lounge / bar (non-rooftop) -----
  { name: 'The Socialite', area: 'GS Road', tags: ['lounge-bar'],
    notes: 'Live music evenings, reasonable prices, open till midnight.' },
  { name: 'FTV Bar & Lounge', area: 'Christian Basti', tags: ['lounge-bar'],
    notes: '"Trendy and relaxing" outdoor terrace, 5★ on TripAdvisor.' },
  { name: 'Reign - Bar & Lounge', area: 'Radisson Blu Hotel, Maligaon', tags: ['lounge-bar'],
    notes: 'Upscale, quiet/peaceful, pool-side seating. Best for a classy, calm drink rather than a party. 4.5★.' },
  { name: '188 Downtown', area: 'Dispur, inside Novotel', tags: ['lounge-bar'],
    notes: 'Upscale multi-cuisine dining + bar, praised for its music. Ranked #7 in Guwahati.' },
  { name: 'Trafik Lounge Bar & Restaurant', area: 'Silpukhuri', tags: ['lounge-bar'],
    notes: 'Lower-confidence pick — mixed/mediocre reviews, budget-friendly.', lowConfidence: true },
  { name: 'Beer Cafe', area: 'Times Square Mall, Sreenagar', tags: ['lounge-bar', 'live-music'],
    notes: 'Wide beer selection, live music, award-winning (Guwahati Food Awards 2024). 4.8★.' },
  // Also listed in restaurants.js as a cafe — it's a cafe by day, bar by night.
  { name: 'Leaf Deck Café Bar', area: 'Chandmari', tags: ['lounge-bar'],
    notes: 'Cafe cum bar with handcrafted cocktails and all-day happy hours. 4.8★.' },
];

// Looks at what the visitor actually asked and returns only the matching venues.
// If nothing nightlife-related is detected, returns an empty list (so we don't
// waste tokens adding venue info to unrelated questions).
function getRelevantVenues(message) {
  const text = message.toLowerCase();

  const isClub = /\bclub(bing)?|nightclub/.test(text);
  const isRooftop = /roof\s?top/.test(text);
  // (?!a) after "gig" stops it matching inside words like "gigabyte"/"gigahertz",
  // while still matching "gig", "gigs", "any gigs tonight".
  const isLiveMusic = /live\s?(music|band)|karaoke|\bgig(?!a)/.test(text);
  // (?!i) after "chill" stops it matching inside "chilli"/"chillies" (the pepper),
  // while still matching "chill", "chilling", "chilled".
  // "s?" on bar/lounge/pub so plurals ("bars", "lounges", "pubs" — the most
  // natural way to ask) match too, not just the singular form.
  const isBarOrLounge = /\bbars?\b|\blounges?\b|\bpubs?\b|\bdrink|nightlife|hang\s?out|\bparty|\bchill(?!i)|alcohol/.test(text);

  const wantsTags = new Set();
  if (isClub) wantsTags.add('clubbing');
  if (isRooftop) wantsTags.add('rooftop');
  if (isLiveMusic) wantsTags.add('live-music');
  // The generic "bar/lounge" trigger only applies when rooftop or club wasn't
  // already specifically asked for — otherwise "rooftop bar" would incorrectly
  // pull in every plain lounge in town just because the word "bar" appears.
  if (isBarOrLounge && !isRooftop && !isClub) wantsTags.add('lounge-bar');

  if (wantsTags.size === 0) return [];

  return venues.filter((venue) => venue.tags.some((tag) => wantsTags.has(tag)));
}

module.exports = { venues, getRelevantVenues };
