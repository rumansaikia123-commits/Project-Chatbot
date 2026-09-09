// A hand-verified directory of Guwahati sports & recreation venues,
// transcribed from a "Sports & Recreation" research document. Same
// "mini RAG" idea as every other category file: three independent
// getRelevant*() functions below only return the entries that actually
// match what the visitor asked about, kept in one file since all three
// groups share the same sport/activity vocabulary and a lot of the same
// locality names.
//
// The source document grouped these into 4 categories (Stadiums & Major
// Sports Venues / Government & Institutional Sports Complexes / Private &
// Recreational Sports / Gaming & Entertainment), but the first two
// overlapped each other so much that the same real venue was listed
// twice under two different category labels ("R.G. Baruah Sports
// Complex" as its own row, AND folded into "Nehru Stadium / R.G. Baruah
// Sports Complex" elsewhere) — the same class of duplicate already hit
// once with accommodation's "The Greenwood". Per direct correction, the
// real name is "Nehru Stadium" and the real location is R.G. Baruah
// Road; that's the single entry kept below.
//
// Rebuilt around 3 intent-based groups instead of the source's 4 label-
// based ones, since that's what actually distinguishes how a visitor
// asks: watching a match (spectatorVenues — all uniformly ticket-access/
// coaching, government or institutional-run) vs. playing something
// yourself (sportsFacilities — bookable private courts/turfs/clubs) vs.
// indoor arcade-style family entertainment (gamingVenues).
//
// Unlike accommodations, all three groups here DO carry day/order
// itinerary fields (in CHAT_RESPONSE_SCHEMA, not in this file) — watching
// a match or playing badminton is a genuine daily-itinerary activity the
// same way a temple visit or a cinema outing is, unlike a place to stay.
//
// PUNO Advance (gamingVenues) was researched and added on top of the
// source document per direct request — a real Guwahati indoor adventure/
// trampoline park the source didn't include. Address, activities, and
// rating confirmed via web search (NH 37 Lokhra, Lalung Gaon Rd, near
// Binod Nissan Betkuchi, Sonaighuli; 4.8/5, 3,032 reviews).

const spectatorVenues = [
  { name: 'Nehru Stadium', area: 'R.G. Baruah Road',
    activities: ['cricket', 'football', 'athletics', 'badminton', 'basketball', 'tennis', 'swimming'],
    indoorOutdoor: 'Both', operator: 'Government',
    highlight: "Guwahati's major multi-sport government venue, with multiple dedicated facilities spanning cricket, football, athletics, and more." },

  { name: 'Barsapara / ACA Stadium', area: 'Barsapara',
    activities: ['cricket'], indoorOutdoor: 'Outdoor', operator: 'Assam Cricket Association',
    highlight: "A professional spectator cricket stadium — Guwahati's major venue for international and domestic cricket." },

  { name: 'Indira Gandhi Athletic Stadium', area: 'Sarusajai',
    activities: ['athletics', 'football'], indoorOutdoor: 'Outdoor', operator: 'Government',
    highlight: 'A major athletics/football stadium with a 30,000-person capacity and a synthetic running track.' },

  { name: 'NF Railway Stadium', area: 'Maligaon',
    activities: ['football', 'cricket', 'badminton', 'table-tennis'], indoorOutdoor: 'Both', operator: 'Indian Railways',
    highlight: 'An institutional sports stadium run by Northeast Frontier Railway.' },

  { name: 'Maulana Md. Tayabullah Hockey Stadium', area: 'Guwahati',
    activities: ['hockey'], indoorOutdoor: 'Outdoor', operator: 'Government',
    highlight: "Guwahati's dedicated hockey stadium." },

  { name: 'Rajiv Gandhi Indoor Stadium', area: 'Amingaon',
    activities: ['indoor-sports'], indoorOutdoor: 'Indoor', operator: 'Government',
    highlight: 'A major indoor sports facility in Amingaon.' },

  { name: 'Karmabir Nabin Chandra Bordoloi AC Indoor Stadium', area: 'Sarusajai',
    activities: ['indoor-sports'], indoorOutdoor: 'Indoor', operator: 'Government',
    highlight: 'A major air-conditioned indoor facility used for both sports and events.' },

  { name: 'SAI Regional Centre, Guwahati', area: 'Paltan Bazaar',
    activities: ['football', 'tennis', 'strength-conditioning', 'indoor-sports'], indoorOutdoor: 'Both', operator: 'Sports Authority of India',
    highlight: 'A training and high-performance centre run by the Sports Authority of India — more geared toward serious training than casual spectating.' },

  { name: 'Rudra Singha Sports Complex', area: 'Dispur',
    activities: ['multi-sport'], indoorOutdoor: 'Both', operator: 'Government',
    highlight: 'A government multi-sport complex serving institutional and community sports in Dispur.' },

  { name: 'Tepesia Sports Complex', area: 'Sonapur / Tepesia',
    activities: ['multi-sport'], indoorOutdoor: 'Both', operator: 'Government / Institutional',
    highlight: 'A multi-sport complex out in Sonapur/Tepesia, just outside central Guwahati.' },

  { name: 'Chachal Tennis Complex', area: 'Chachal / VIP Road',
    activities: ['tennis'], indoorOutdoor: 'Outdoor', operator: 'Government / Institutional',
    highlight: 'A dedicated tennis complex on VIP Road.' },

  { name: 'Gauhati University Sports Stadium', area: 'Jalukbari',
    activities: ['athletics', 'football'], indoorOutdoor: 'Outdoor', operator: 'Gauhati University',
    highlight: "Gauhati University's own sports facility, covering athletics, football, and other university sports." },

  { name: 'Dr. Zakir Hussain Aquatic Complex', area: 'Guwahati',
    activities: ['swimming'], indoorOutdoor: 'Indoor', operator: 'Government',
    highlight: "Guwahati's dedicated aquatic sports facility." },
];

const sportsFacilities = [
  { name: 'Arizona Sports Arena', area: 'Borbari',
    activities: ['badminton', 'squash', 'table-tennis', 'pickleball', 'football', 'cricket', 'swimming'],
    indoorOutdoor: 'Both', operator: 'Private', rooftop: false, rating: 4.6, reviewCount: 877,
    highlight: 'A large indoor+outdoor recreational sports arena with coaching and equipment rental available. Bookable by membership.' },

  { name: 'PlayAir Sports Turf & Cafe', area: 'Chatribari',
    activities: ['football', 'cricket', 'badminton', 'volleyball'],
    indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: true, rating: null, reviewCount: null,
    highlight: 'A rooftop sports turf with its own cafe, a bowling practice machine, lockers, and showers.' },

  { name: 'The PlayYard by WeSport', area: 'Dispur / Rukmini Gaon',
    activities: ['football'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: false, rating: 4.8, reviewCount: 70,
    highlight: 'A recreational football/turf sports complex.' },

  { name: 'Arena 28', area: 'Beltola Tiniali',
    activities: ['football'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: false, rating: 4.5, reviewCount: 204,
    highlight: 'A dedicated football turf in Beltola Tiniali.' },

  { name: 'The Loft Court', area: 'Rehabari',
    activities: ['pickleball'], indoorOutdoor: 'Both', operator: 'Private', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A dedicated pickleball court with equipment rental, changing rooms, parking, and floodlights.' },

  { name: 'The Pickleball Club', area: 'Basistha',
    activities: ['pickleball', 'badminton'], indoorOutdoor: 'Both', operator: 'Private', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A dedicated pickleball and badminton club.' },

  { name: 'Court House', area: 'Ulubari',
    activities: ['pickleball', 'badminton'], indoorOutdoor: 'Both', operator: 'Private', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A racquet-sports venue offering both pickleball and badminton.' },

  { name: 'Pickle Pals', area: 'Narengi Tinali',
    activities: ['pickleball'], indoorOutdoor: 'Both', operator: 'Private', rooftop: false, rating: 4.8, reviewCount: 19,
    highlight: 'A dedicated pickleball court in Narengi Tinali.' },

  { name: 'Dispur Pickleball Coaching Centre', area: 'Basisthpur / Dispur',
    activities: ['pickleball'], indoorOutdoor: 'Both', operator: 'Private', rooftop: false, rating: 4.9, reviewCount: 12,
    highlight: 'A pickleball coaching centre in Dispur.' },

  { name: 'All Assam Tennis Association', area: 'Borbari / VIP Road',
    activities: ['tennis'], indoorOutdoor: 'Outdoor', operator: 'Association', rooftop: false, rating: 4.5, reviewCount: 422,
    highlight: "A dedicated tennis club run by Assam's state tennis association." },

  { name: 'Tennis Social', area: 'Narikal Bari',
    activities: ['tennis'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: false, rating: 4.8, reviewCount: 35,
    highlight: 'A tennis club in Narikal Bari.' },

  { name: 'Badminton Central', area: 'Nabin Nagar',
    activities: ['badminton'], indoorOutdoor: 'Indoor', operator: 'Private', rooftop: false, rating: 4.8, reviewCount: 74,
    highlight: 'A dedicated badminton club in Nabin Nagar.' },

  { name: 'Arena32', area: 'Sree Nagar',
    activities: ['badminton'], indoorOutdoor: 'Indoor', operator: 'Private', rooftop: false, rating: 4.6, reviewCount: 57,
    highlight: 'A dedicated badminton court in Sree Nagar.' },

  { name: 'NCS Square, SkyBall', area: 'NCS Square, Adabari',
    activities: ['cricket', 'football', 'badminton'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: true, rating: null, reviewCount: null,
    highlight: 'A 4,000+ sq-ft rooftop sports arena at NCS Square, also used for events.' },

  { name: 'Warisa Estate, JR Karting', area: 'Sonapur',
    activities: ['go-karting'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: false, rating: 4.3, reviewCount: 284,
    highlight: 'A go-karting venue at Warisa Estate in Sonapur.' },

  { name: 'LAPX Go-Karting', area: 'Guwahati',
    activities: ['go-karting'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A high-tech go-karting venue, open and operating in Guwahati.' },

  { name: 'Assam Archery Club', area: 'Bhetapara',
    activities: ['archery'], indoorOutdoor: 'Outdoor', operator: 'Private / Association', rooftop: false, rating: 4.3, reviewCount: 61,
    highlight: 'An archery club and training venue in Bhetapara.' },

  // ----- Swimming, added 2026-09-09: hotel pools inside Guwahati (not
  // outskirt resorts), activity centres, and public pools/training
  // clubs, researched per direct request. Hotel ratings are copied from
  // the matching real hotel already in accommodations.js's `hotels`
  // array — same real place, same rating everywhere, this app's
  // standing rule (see e.g. Kiranshree Sweets/Ahija Self Drive). These
  // sports.js entries are independent of those accommodations.js
  // entries, same pattern as Terra Mayaa existing in two files. Real,
  // sourced confirmation exists that all 9 hotels below allow paid
  // non-guest pool access (a Guwahati pool-party venue guide) — the
  // highlight text is deliberately kept to the simple "paid access for
  // non-guests" phrasing rather than detailing the pool-party/event-
  // package structure, per direct instruction. No pricing is included
  // anywhere, matching this app's standing no-live-pricing rule.
  { name: 'Novotel Guwahati GS Road', area: 'GS Road, Dispur/Downtown',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: true, rating: 4.6, reviewCount: null,
    highlight: 'A rooftop infinity pool. Paid access for non-guests available — contact the hotel to confirm current options.' },
  { name: 'Vivanta Guwahati', area: 'Khanapara',
    activities: ['swimming'], indoorOutdoor: 'Both', operator: 'Hotel', rooftop: false, rating: 4.4, reviewCount: null,
    highlight: 'Both an indoor and an outdoor pool. Paid access for non-guests available — contact the hotel to confirm current options.' },
  { name: 'Radisson Blu Hotel, Guwahati', area: 'NH-37, Tetelia / Gotanagar (Airport)',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: false, rating: 4.6, reviewCount: null,
    highlight: "An outdoor pool plus a dedicated children's pool. Paid access for non-guests available — contact the hotel to confirm current options." },
  { name: 'Ratnamouli Palace', area: 'Beltola Chariali',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: true, rating: 4.6, reviewCount: null,
    highlight: 'A rooftop pool with a garden setting. Paid access for non-guests available — contact the hotel to confirm current options.' },
  { name: 'Arista by Ambition', area: 'GS Road, Christian Basti',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: false, rating: 4.6, reviewCount: null,
    highlight: 'An outdoor pool. Paid access for non-guests available — contact the hotel to confirm current options.' },
  { name: 'Kiranshree Grand', area: 'New Airport Road, Mirzapur/Ganakpara (Airport)',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: false, rating: 4.4, reviewCount: null,
    highlight: "An outdoor pool plus a children's pool. Paid access for non-guests available — contact the hotel to confirm current options." },
  { name: 'The Greenwood', area: 'Beltola Tiniali, Beltola-Basistha-Khanapara Road',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: false, rating: 4.4, reviewCount: null,
    highlight: 'A boutique resort-style pool area. Paid access for non-guests available — contact the hotel to confirm current options.' },
  { name: 'Vishwaratna Hotel', area: 'AT Road / central Guwahati',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: false, rating: 4.0, reviewCount: null,
    highlight: 'An outdoor pool. Paid access for non-guests available — contact the hotel to confirm current options.' },
  { name: 'Hotel Palacio', area: 'Khanapara',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Hotel', rooftop: false, rating: 4.1, reviewCount: null,
    highlight: 'A pool open 7 AM-6 PM. Paid access for non-guests available — contact the hotel to confirm current options.' },

  // Possibly the same broader R.G. Baruah Sports Complex area as the
  // existing Nehru Stadium entry above (this project has hit a real
  // duplicate at this exact location before — see the comment at the
  // top of spectatorVenues). Kept as its own entry: real, distinct
  // operational details were found (a specific 50×21m pool, seasonal
  // April-November operation, separate men's/women's facilities, real
  // membership fee tiers) suggesting a genuinely separate facility, not
  // Nehru Stadium's pool under another name — but this wasn't 100%
  // confirmable from directory listings alone. Revisit if solid
  // evidence later shows this is actually the same facility.
  { name: 'Bimala Prasad Chaliha Swimming Pool', area: 'Sarania Hills',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Government', rooftop: false, rating: null, reviewCount: null,
    highlight: "A government-run seasonal pool (April-November) with separate facilities for men and women and professional coaching available." },
  { name: 'IOC Swimming Pool', area: 'Bamunimaidan',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Indian Oil Corporation', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A company-run pool operated by Indian Oil Corporation, open to the public.' },
  { name: 'Nabin Mahanta Memorial Swimming Arena', area: 'Sarusajai',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Government', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A public pool for children and adults, at reasonable cost.' },
  { name: 'Guwahati Club', area: 'Uzan Bazar',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Private / Club', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A membership-based club offering swimming coaching for beginners and experienced swimmers.' },
  { name: 'Dispur Swimming Pool', area: 'Dispur',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Government', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A public pool offering lessons for beginners, children, and advanced swimmers.' },
  { name: 'Dolphin Swimming & Training Centre', area: 'Japorigog',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: false, rating: null, reviewCount: null,
    highlight: 'A training-focused swim centre, well-suited for children and beginners.' },
  { name: 'Marlin Aquatics', area: 'Milan Nagar',
    activities: ['swimming'], indoorOutdoor: 'Outdoor', operator: 'Private', rooftop: false, rating: 4.3, reviewCount: null,
    highlight: 'A premiere swim academy focused on structured beginner coaching using modern training techniques.' },
];

const gamingVenues = [
  { name: 'KNOX Guwahati', area: 'Ulubari',
    activities: ['arcade', 'bowling', 'laser-tag', 'vr', 'racing-simulator'], rating: 4.9, reviewCount: 491,
    highlight: 'A large indoor gaming and family entertainment centre — arcade games, bowling, laser tag, VR, and a racing simulator.' },

  { name: 'Timezone – City Center Mall', area: 'Christian Basti / GS Road',
    activities: ['arcade', 'bowling', 'vr'], rating: 4.8, reviewCount: 1646,
    highlight: 'A well-known indoor gaming and family entertainment centre inside City Center Mall — arcade games, bowling, and VR.' },

  { name: 'GeT TaggED', area: 'Guwahati',
    activities: ['arcade', 'laser-tag', 'pool', 'snooker', 'foosball'], rating: null, reviewCount: null,
    highlight: 'An indoor gaming and social recreation centre — arcade games, laser tag, pool, snooker, and foosball.' },

  { name: 'PUNO Advance', area: 'Sonaighuli / Lokhra (NH 37, near Binod Nissan Betkuchi)',
    activities: ['trampoline', 'rock-climbing', 'obstacle-course', 'bowling', 'vr', 'arcade'], rating: 4.8, reviewCount: 3032,
    highlight: "Northeast India's biggest indoor adventure and trampoline park — trampoline zones, a ninja/obstacle course, rock climbing (the \"Sky Wall\"), bowling, VR games, and arcade gaming, suited to all ages." },
];

// Shared across all three groups — a bare sport/activity word (e.g.
// "badminton") never collides across groups in practice, since each
// entry's own `activities` array is what ultimately narrows a match;
// this table only recognizes the word, filtering against real data does
// the actual scoping.
const ACTIVITY_KEYWORDS = [
  { pattern: /\bcricket\b|box\s?cricket|cricket\s?nets?/, activity: 'cricket' },
  { pattern: /\bfootball\b|\bsoccer\b/, activity: 'football' },
  { pattern: /\bathletics?\b|\btrack\s?(and|&)?\s?field\b/, activity: 'athletics' },
  { pattern: /\bbadminton\b/, activity: 'badminton' },
  { pattern: /\bbasketball\b/, activity: 'basketball' },
  { pattern: /\btable[\s-]?tennis\b/, activity: 'table-tennis' },
  { pattern: /(?<!table[\s-])\btennis\b/, activity: 'tennis' },
  // "swims?" added (2026-09-09): "where can I swim" / "where can I go
  // for a swim" didn't contain the literal word "swimming" that this
  // pattern required — same word-form gap this project has hit
  // repeatedly elsewhere (cafe/cafes, samosa, etc.). "dip" added the
  // same day (found via the verify-phrasing skill's stress test): "fancy
  // a dip" / "go for a dip" is a common, unambiguous colloquial synonym.
  // Deliberately NOT adding a bare "\bpool\b" match with no lookahead —
  // "pool" is genuinely ambiguous in this app (GeT TaggED's activities
  // include real billiards 'pool'), so a bare "pool"/"any pools nearby"
  // question is left unmatched rather than risk wrongly assuming
  // swimming; "swimming pool" as a phrase already matches fine via
  // \bswimming\b above.
  { pattern: /\bswims?\b|\bswimming\b|\baquatic\b|\bdip\b|\bpool\b(?=.*(swim|lap))/, activity: 'swimming' },
  { pattern: /\bhockey\b/, activity: 'hockey' },
  { pattern: /\bsquash\b/, activity: 'squash' },
  { pattern: /\bpickleball\b/, activity: 'pickleball' },
  { pattern: /\bvolleyball\b/, activity: 'volleyball' },
  { pattern: /\barchery\b/, activity: 'archery' },
  { pattern: /go[\s-]?kart(ing)?/, activity: 'go-karting' },
  { pattern: /\barcade\b/, activity: 'arcade' },
  // Billiards 'pool' (GeT TaggED's activities), added 2026-09-09 —
  // found while testing the new swimming-vs-billiards clarifying
  // question: this activity had NO keyword mapping to it at all before
  // this, so picking "the pool/billiards table game" led nowhere.
  // Deliberately requires "table"/"billiards"/"play pool" — never a
  // bare "\bpool\b" alone, same ambiguity-avoidance reasoning as the
  // swimming pattern just above.
  { pattern: /\bpool\s?table\b|\bbilliards\b|\bplay\s?pool\b/, activity: 'pool' },
  { pattern: /\bbowling\b/, activity: 'bowling' },
  { pattern: /laser\s?tag/, activity: 'laser-tag' },
  { pattern: /\bvr\b|virtual\s?reality/, activity: 'vr' },
  { pattern: /racing\s?simulator/, activity: 'racing-simulator' },
  { pattern: /\btrampoline\b|jump(ing)?\s?park/, activity: 'trampoline' },
  { pattern: /rock[\s-]?climbing|climbing\s?wall/, activity: 'rock-climbing' },
  { pattern: /obstacle\s?course|ninja\s?course/, activity: 'obstacle-course' },
  { pattern: /\bsnooker\b/, activity: 'snooker' },
  { pattern: /\bfoosball\b/, activity: 'foosball' },
  { pattern: /strength\s?(and|&)?\s?conditioning|\bgym\b/, activity: 'strength-conditioning' },
  { pattern: /multi[\s-]?sport/, activity: 'multi-sport' },
  { pattern: /indoor\s?sports?/, activity: 'indoor-sports' },
];

const SPECTATOR_NAME_KEYWORDS = [
  { pattern: /nehru\s?stadium|r\.?g\.?\s?baruah\s?sports\s?complex/, name: 'Nehru Stadium' },
  { pattern: /barsapara|\baca\s?stadium\b/, name: 'Barsapara / ACA Stadium' },
  { pattern: /indira\s?gandhi\s?athletic/, name: 'Indira Gandhi Athletic Stadium' },
  { pattern: /nf\s?railway\s?stadium/, name: 'NF Railway Stadium' },
  { pattern: /tayabullah|hockey\s?stadium/, name: 'Maulana Md. Tayabullah Hockey Stadium' },
  { pattern: /rajiv\s?gandhi\s?indoor/, name: 'Rajiv Gandhi Indoor Stadium' },
  { pattern: /karmabir|nabin\s?chandra\s?bordoloi/, name: 'Karmabir Nabin Chandra Bordoloi AC Indoor Stadium' },
  { pattern: /sai\s?regional\s?centre/, name: 'SAI Regional Centre, Guwahati' },
  { pattern: /rudra\s?singha/, name: 'Rudra Singha Sports Complex' },
  { pattern: /tepesia\s?sports\s?complex/, name: 'Tepesia Sports Complex' },
  { pattern: /chachal\s?tennis/, name: 'Chachal Tennis Complex' },
  { pattern: /gauhati\s?university\s?sports/, name: 'Gauhati University Sports Stadium' },
  { pattern: /zakir\s?hussain|aquatic\s?complex/, name: 'Dr. Zakir Hussain Aquatic Complex' },
];

const FACILITY_NAME_KEYWORDS = [
  { pattern: /arizona\s?sports\s?arena/, name: 'Arizona Sports Arena' },
  { pattern: /playair/, name: 'PlayAir Sports Turf & Cafe' },
  { pattern: /playyard|wesport/, name: 'The PlayYard by WeSport' },
  { pattern: /arena\s?28/, name: 'Arena 28' },
  { pattern: /loft\s?court/, name: 'The Loft Court' },
  { pattern: /pickleball\s?club/, name: 'The Pickleball Club' },
  { pattern: /court\s?house/, name: 'Court House' },
  { pattern: /pickle\s?pals/, name: 'Pickle Pals' },
  { pattern: /dispur\s?pickleball/, name: 'Dispur Pickleball Coaching Centre' },
  { pattern: /all\s?assam\s?tennis/, name: 'All Assam Tennis Association' },
  { pattern: /tennis\s?social/, name: 'Tennis Social' },
  { pattern: /badminton\s?central/, name: 'Badminton Central' },
  { pattern: /arena\s?32/, name: 'Arena32' },
  { pattern: /ncs\s?square|skyball/, name: 'NCS Square, SkyBall' },
  { pattern: /warisa\s?estate|jr\s?karting/, name: 'Warisa Estate, JR Karting' },
  { pattern: /lapx/, name: 'LAPX Go-Karting' },
  { pattern: /assam\s?archery/, name: 'Assam Archery Club' },
  // Swimming venues, added 2026-09-09.
  { pattern: /novotel/, name: 'Novotel Guwahati GS Road' },
  { pattern: /vivanta/, name: 'Vivanta Guwahati' },
  { pattern: /radisson/, name: 'Radisson Blu Hotel, Guwahati' },
  { pattern: /ratnamouli/, name: 'Ratnamouli Palace' },
  { pattern: /arista/, name: 'Arista by Ambition' },
  { pattern: /kiranshree\s?grand/, name: 'Kiranshree Grand' },
  { pattern: /greenwood/, name: 'The Greenwood' },
  { pattern: /vishwaratna/, name: 'Vishwaratna Hotel' },
  { pattern: /hotel\s?palacio/, name: 'Hotel Palacio' },
  { pattern: /bimala\s?prasad\s?chaliha/, name: 'Bimala Prasad Chaliha Swimming Pool' },
  { pattern: /\bioc\s?swimming/, name: 'IOC Swimming Pool' },
  { pattern: /nabin\s?mahanta/, name: 'Nabin Mahanta Memorial Swimming Arena' },
  { pattern: /guwahati\s?club/, name: 'Guwahati Club' },
  { pattern: /dispur\s?swimming/, name: 'Dispur Swimming Pool' },
  { pattern: /dolphin\s?swimming/, name: 'Dolphin Swimming & Training Centre' },
  { pattern: /marlin\s?aquatics/, name: 'Marlin Aquatics' },
];

const GAMING_NAME_KEYWORDS = [
  { pattern: /\bknox\b/, name: 'KNOX Guwahati' },
  { pattern: /timezone/, name: 'Timezone – City Center Mall' },
  { pattern: /get\s?taggeed|get\s?tagged/, name: 'GeT TaggED' },
  { pattern: /\bpuno\b/, name: 'PUNO Advance' },
];

const AREA_KEYWORDS = [
  { pattern: /r\.?g\.?\s?baruah\s?road/, area: 'R.G. Baruah Road' },
  { pattern: /barsapara/, area: 'Barsapara' },
  { pattern: /sarusajai/, area: 'Sarusajai' },
  { pattern: /maligaon/, area: 'Maligaon' },
  { pattern: /amingaon/, area: 'Amingaon' },
  { pattern: /paltan\s?bazaar/, area: 'Paltan Bazaar' },
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /sonapur|tepesia/, area: 'Sonapur / Tepesia' },
  { pattern: /chachal|vip\s?road/, area: 'Chachal / VIP Road' },
  { pattern: /jalukbari/, area: 'Jalukbari' },
  { pattern: /borbari/, area: 'Borbari' },
  { pattern: /chatribari/, area: 'Chatribari' },
  { pattern: /rukmini\s?gaon/, area: 'Rukmini Gaon' },
  // Shortened from 'Beltola Tiniali' (2026-09-09): that canonical name
  // is too specific — a bare "Beltola" search only found entries whose
  // area string literally contained "Beltola Tiniali", silently missing
  // Ratnamouli Palace (real area: "Beltola Chariali", a different
  // sub-locality). Same bug shape already fixed once in restaurants.js
  // for ABC/Bhangagarh. Pure widening — "Beltola" is still a substring
  // of every existing Beltola-area entry, so nothing already matching
  // (e.g. Arena 28) stops matching.
  { pattern: /beltola/, area: 'Beltola' },
  { pattern: /rehabari/, area: 'Rehabari' },
  { pattern: /basistha\b(?!pur)/, area: 'Basistha' },
  { pattern: /ulubari/, area: 'Ulubari' },
  { pattern: /narengi/, area: 'Narengi Tinali' },
  { pattern: /basisthpur/, area: 'Basisthpur' },
  { pattern: /narikal\s?bari/, area: 'Narikal Bari' },
  { pattern: /nabin\s?nagar/, area: 'Nabin Nagar' },
  { pattern: /sree\s?nagar/, area: 'Sree Nagar' },
  { pattern: /adabari/, area: 'Adabari' },
  { pattern: /bhetapara/, area: 'Bhetapara' },
  { pattern: /sonaighuli|lokhra/, area: 'Sonaighuli / Lokhra' },
  // Split into two rows (2026-09-09): same bug shape as the Beltola fix
  // above, found live right after deploying the swimming venues — the
  // merged canonical 'Christian Basti / GS Road' only matched entries
  // whose area contained that exact compound string, but the new
  // swimming entries genuinely say just "GS Road, Dispur/Downtown" or
  // "GS Road, Christian Basti" (different word order, no "/"), so a
  // bare "GS Road" search returned nothing for them. Existing entries
  // (e.g. Timezone – City Center Mall, area "Christian Basti / GS
  // Road") still match both rows below, since their area string
  // contains both "GS Road" and "Christian Basti" as substrings either
  // way — pure widening, no regression.
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  { pattern: /gs\s?road|city\s?cent(re|er)\s?mall/, area: 'GS Road' },
  // Added 2026-09-09 for the new hotel/public-pool swimming entries.
  { pattern: /khanapara/, area: 'Khanapara' },
  { pattern: /\bairport\b|tetelia|gotanagar|ganakpara/, area: 'Airport' },
  { pattern: /\bat\s?road\b/, area: 'AT Road' },
  { pattern: /bamunimaidan/, area: 'Bamunimaidan' },
  { pattern: /sarania\s?hills|gandhi\s?basti/, area: 'Sarania Hills' },
  { pattern: /milan\s?nagar/, area: 'Milan Nagar' },
  { pattern: /uzan\s?bazar|mg\s?road/, area: 'Uzan Bazar' },
  { pattern: /japorigog/, area: 'Japorigog' },
];

// The watch/match gap allows for a sport name in between ("watch A
// CRICKET match") — found missing during testing, where the original
// tighter pattern (requiring "watch" immediately before "match"/"game")
// failed on the single most natural way to phrase this.
const SPECTATOR_TRIGGER =
  /\bstadiums?\b|\bspectator\b|watch(ing)?\b[^.!?]{0,25}\b(match|game)\b|\b(cricket|football|hockey)\s+(match|game)\b|\bticket(s)?\b/;
const FACILITY_TRIGGER =
  /\bplay\b|\bbook(ing)?\b|\bcourt\b|\bturf\b|\bclub\b|\bpractice\b|\brent(al)?\b|\bmembership\b|\brooftop\b/;
// "Learn a sport" is deliberately routed toward the Government/
// Institutional/Association-operated venues, not the private bookable
// ones — per explicit instruction: someone wanting to LEARN a sport
// (coaching, training) is pointed at spectatorVenues (every entry there
// is government/institutional/association-run) plus whichever
// sportsFacilities entries are themselves Association-operated (All
// Assam Tennis Association, Assam Archery Club) — never the plain
// Private-operated facilities, which stay reserved for "where can I
// play" instead. "Coaching" moved out of FACILITY_TRIGGER into this
// trigger for the same reason.
const LEARN_TRIGGER = /\blearn(ing)?\b|\bcoach(ing)?\b|\btrain(ing)?\b/;
// Broadened during testing: "fun indoor activities for families" (a very
// natural way to ask about this whole category) originally matched
// nothing at all, since every word in the original trigger was a named
// activity (arcade/bowling/VR/etc.) rather than a general phrase for the
// category itself.
const GAMING_TRIGGER =
  /\barcade\b|\bbowling\b|laser\s?tag|\bvr\b|virtual\s?reality|\btrampoline\b|rock[\s-]?climbing|obstacle\s?course|ninja\s?course|\bgaming\b|family\s?entertainment|indoor\s?(fun|activities|entertainment)|things?\s?to\s?do\s?indoors?|kids?\s?activities|entertainment\s?(centre|center)|\bfoosball\b|\bsnooker\b/;
const ROOFTOP_TRIGGER = /\brooftop\b/;
// "Adventure sport" is a curated subset, not a real activity tag on its
// own — the genuinely adventure-flavored activities across both
// sportsFacilities (go-karting, archery) and gamingVenues (PUNO
// Advance's rock climbing, obstacle/ninja course, trampoline). Matches
// attractions.js's own "adventure sport" handling: a bare "adventure" or
// "nature" question is a different, wildlife/scenic intent handled
// entirely over there, never here.
const ADVENTURE_SPORT_TRIGGER = /\badventure\s?sports?\b/;
const ADVENTURE_SPORT_ACTIVITIES = new Set(['go-karting', 'archery', 'rock-climbing', 'obstacle-course', 'trampoline']);

const TOP_N_FACILITY = 10;

function matchKeywords(text, table, field) {
  const matched = [];
  for (const entry of table) {
    if (entry.pattern.test(text)) matched.push(entry[field]);
  }
  return matched;
}

function matchActivities(text) {
  const matched = new Set();
  for (const { pattern, activity } of ACTIVITY_KEYWORDS) {
    if (pattern.test(text)) matched.add(activity);
  }
  return matched;
}

// "Explicit" signal = a category-specific trigger word or a named venue
// — never just a bare shared activity word. This distinction matters for
// deference between siblings: a bare activity word alone (e.g.
// "cricket") is a genuinely weak, ambiguous signal since it appears in
// BOTH spectator and facility data (a stadium hosts cricket AND a private
// arena offers box cricket) — found via testing that without this
// distinction, "where can I WATCH a cricket match" (explicit spectator
// signal) still wrongly surfaced box-cricket facilities too, since
// "cricket" alone was enough for facilities to think it had its own
// signal and therefore never defer. Now a group only ever defers to a
// SIBLING'S explicit signal, and only when it has no explicit signal of
// its own — its own bare-activity match no longer protects it from that.
function hasSpectatorSignal(text) {
  return SPECTATOR_TRIGGER.test(text) || matchKeywords(text, SPECTATOR_NAME_KEYWORDS, 'name').length > 0;
}
function hasFacilityExplicitSignal(text) {
  return FACILITY_TRIGGER.test(text) || matchKeywords(text, FACILITY_NAME_KEYWORDS, 'name').length > 0;
}
function hasGamingExplicitSignal(text) {
  return GAMING_TRIGGER.test(text) || matchKeywords(text, GAMING_NAME_KEYWORDS, 'name').length > 0;
}

// A named venue always narrows. Otherwise a specific signal (see above)
// or an area match keeps this group in play; if neither, but a SIBLING
// group has its own specific signal instead, this one defers rather than
// piggybacking on a shared area name — same fix already verified for
// accommodations.js ("hotels near Zoo Road" wrongly surfacing
// homestays). A genuinely vague "what stadiums are there in Guwahati"
// returns the full 13-entry list — no natural sub-tier exists to build a
// fallback from, and it's short enough to show in full.
function getRelevantSpectatorVenues(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, SPECTATOR_NAME_KEYWORDS, 'name');
  const matchedAreas = matchKeywords(text, AREA_KEYWORDS, 'area');
  const matchedActivities = matchActivities(text);
  // "Learn/coaching/training" always gives this group its own signal —
  // see the comment on LEARN_TRIGGER above. Deliberately not folded into
  // hasSpectatorSignal itself, since that function is also what
  // getRelevantSportsFacilities checks to decide whether to defer to
  // this group — if it were, a "learn cricket" question would make
  // facilities wrongly defer entirely instead of applying its own
  // Association-only filter below.
  const ownSignal = hasSpectatorSignal(text) || LEARN_TRIGGER.test(text);

  if (!ownSignal && matchedAreas.length === 0) return [];
  if (matchedNames.length > 0) {
    return spectatorVenues.filter((v) => matchedNames.includes(v.name));
  }
  if (!ownSignal && (hasFacilityExplicitSignal(text) || hasGamingExplicitSignal(text))) {
    return [];
  }

  let results = spectatorVenues;
  let filterApplied = false;
  if (matchedActivities.size > 0) {
    results = results.filter((v) => v.activities.some((a) => matchedActivities.has(a)));
    filterApplied = true;
  }
  if (matchedAreas.length > 0) {
    results = results.filter((v) => matchedAreas.some((area) => v.area.toLowerCase().includes(area.toLowerCase())));
    filterApplied = true;
  }
  if (!filterApplied) return spectatorVenues;
  return results;
}

// A bare activity match (e.g. "badminton") counts as a WEAK signal of
// its own — enough to keep this group in play when nothing else has an
// explicit claim, but not enough to resist deferring to a sibling's
// explicit signal (see the comment on hasFacilityExplicitSignal above).
// A genuinely vague "where can I play sports" falls back to the top 10
// by rating, unrated entries sorted last — mirrors restaurants.js's
// TOP_N pattern, since (unlike spectator venues) most of these do have a
// real rating. "Rooftop" is its own real filterable dimension (PlayAir
// and NCS Square SkyBall are genuinely rooftop venues).
function getRelevantSportsFacilities(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, FACILITY_NAME_KEYWORDS, 'name');
  const matchedAreas = matchKeywords(text, AREA_KEYWORDS, 'area');
  const matchedActivities = matchActivities(text);
  const wantsRooftop = ROOFTOP_TRIGGER.test(text);
  const wantsToLearn = LEARN_TRIGGER.test(text);
  const wantsAdventureSport = ADVENTURE_SPORT_TRIGGER.test(text);
  const explicitSignal = hasFacilityExplicitSignal(text);
  const ownSignal = explicitSignal || matchedActivities.size > 0 || wantsToLearn || wantsAdventureSport;

  if (!ownSignal && matchedAreas.length === 0) return [];
  if (matchedNames.length > 0) {
    return sportsFacilities.filter((f) => matchedNames.includes(f.name));
  }
  // Deliberately checks the ORIGINAL hasSpectatorSignal here, not
  // whether spectator also picked up a learn-trigger — so "learn
  // cricket" doesn't make this group wrongly defer to spectator; it
  // still gets to apply its own Association-only filter below instead.
  if (!explicitSignal && (hasSpectatorSignal(text) || hasGamingExplicitSignal(text))) {
    return [];
  }

  let results = sportsFacilities;
  let filterApplied = false;
  // "Learn/coaching/training" narrows to only the Association-operated
  // facilities (All Assam Tennis Association, Assam Archery Club) — the
  // plain Private-operated ones are reserved for "where can I play"
  // instead, per explicit instruction.
  if (wantsToLearn) {
    results = results.filter((f) => f.operator.includes('Association'));
    filterApplied = true;
  }
  if (wantsAdventureSport) {
    results = results.filter((f) => f.activities.some((a) => ADVENTURE_SPORT_ACTIVITIES.has(a)));
    filterApplied = true;
  }
  if (matchedActivities.size > 0) {
    results = results.filter((f) => f.activities.some((a) => matchedActivities.has(a)));
    filterApplied = true;
  }
  if (wantsRooftop) {
    results = results.filter((f) => f.rooftop === true);
    filterApplied = true;
  }
  if (matchedAreas.length > 0) {
    results = results.filter((f) => matchedAreas.some((area) => f.area.toLowerCase().includes(area.toLowerCase())));
    filterApplied = true;
  }
  if (!filterApplied) {
    return [...sportsFacilities].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1)).slice(0, TOP_N_FACILITY);
  }
  return results;
}

// Same shape again. Gaming vocabulary (arcade/bowling/VR/trampoline/
// etc.) never collides with a real sport name, so no cross-leakage risk
// exists here in practice even sharing one activity table. Only 4
// entries total, so a vague "fun indoor activities" returns all of them.
function getRelevantGamingVenues(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, GAMING_NAME_KEYWORDS, 'name');
  const matchedAreas = matchKeywords(text, AREA_KEYWORDS, 'area');
  const matchedActivities = matchActivities(text);
  const wantsAdventureSport = ADVENTURE_SPORT_TRIGGER.test(text);
  const explicitSignal = hasGamingExplicitSignal(text);
  const ownSignal = explicitSignal || matchedActivities.size > 0 || wantsAdventureSport;

  if (!ownSignal && matchedAreas.length === 0) return [];
  if (matchedNames.length > 0) {
    return gamingVenues.filter((g) => matchedNames.includes(g.name));
  }
  if (!explicitSignal && (hasSpectatorSignal(text) || hasFacilityExplicitSignal(text))) {
    return [];
  }

  let results = gamingVenues;
  let filterApplied = false;
  if (wantsAdventureSport) {
    results = results.filter((g) => g.activities.some((a) => ADVENTURE_SPORT_ACTIVITIES.has(a)));
    filterApplied = true;
  }
  if (matchedActivities.size > 0) {
    results = results.filter((g) => g.activities.some((a) => matchedActivities.has(a)));
    filterApplied = true;
  }
  if (matchedAreas.length > 0) {
    results = results.filter((g) => matchedAreas.some((area) => g.area.toLowerCase().includes(area.toLowerCase())));
    filterApplied = true;
  }
  if (!filterApplied) return gamingVenues;
  return results;
}

module.exports = {
  spectatorVenues,
  sportsFacilities,
  gamingVenues,
  getRelevantSpectatorVenues,
  getRelevantSportsFacilities,
  getRelevantGamingVenues,
};
