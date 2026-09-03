// A hand-verified directory of Guwahati-area accommodation, transcribed
// from an "Accommodation" research document (Hotels / Resorts / Guest
// House & Airbnb tables, Google/Tripadvisor/Airbnb-sourced, September
// 2026). Same "mini RAG" idea as every other category file: three
// independent getRelevant*() functions below only return the entries
// that actually match what the visitor asked about. Kept in one file,
// unlike most categories, since all three groups share the same locality
// vocabulary and the same "AI Notes -> highlight" cleaning approach.
//
// Unlike every other category, none of these three carry day/order
// itinerary fields — a place to stay isn't a sequenced daily activity the
// way a temple visit or a restaurant is, so this sits outside the
// day-by-day planning system for now, per explicit instruction.
//
// Several hotels appeared more than once in the source document, each
// time under a different locality bucket, because their real address
// genuinely borders more than one of the document's search areas (e.g.
// Novotel Guwahati GS Road under both "GS Road" and "Dispur"). Rather
// than store duplicate objects — exactly the kind of drift that already
// caused a real bug once (Chakkranosh's address disagreeing between
// restaurants.js and venues.js) — each hotel is stored ONCE below, with
// an internal-only `areaTags` array listing every locality it genuinely
// matches. Three of these needed real research (WebSearch), not just a
// merge of the document's own two rows, because those two rows actually
// disagreed on the address:
//   - Hotel Gateway Grandeur: confirmed at GS Road, Christian Basti (not
//     "Dispur-side" as the Dispur-table row implied).
//   - Hotel Nandan: confirmed at Paltan Bazaar / Old GS Road — the
//     Ulubari-table row's "Central Guwahati" placement was simply wrong,
//     so no Ulubari area tag is kept for it.
//   - "The Greenwood": the Hotel table's Beltola entry and the Resort
//     table's "The Greenwood, Guwahati" (Khanapara/GS Road cluster) are
//     the same real property — confirmed via its actual branding as "A
//     Luxury Boutique Hotel" at Beltola Tiniali. Stored once, here in
//     hotels (not resorts), since it's a genuine in-city address, not an
//     outlying resort. The Resort table's own star figure for it was
//     already flagged uncertain ("3-Star*"); the Hotel table's plain
//     "4-Star" is used instead.
//
// Per instruction, a "Not Verified" star or rating in the source is never
// treated as a reason to exclude an entry — it's just left as `null`,
// the same "don't invent, don't discard" precedent already used for
// temples with no entry fee, or parks with no star rating.

const hotels = [
  { name: 'Novotel Guwahati GS Road', area: 'GS Road, Dispur/Downtown', areaTags: ['GS Road', 'Dispur'],
    localityRank: 1, stars: 5, rating: 4.6,
    highlight: 'Established international business & leisure hotel — the strongest established luxury option in the Dispur/GS Road cluster.' },

  { name: 'Arista by Ambition', area: 'GS Road, Christian Basti', areaTags: ['GS Road', 'Christian Basti'],
    localityRank: 2, stars: 5, rating: 4.6,
    highlight: 'Luxury full-service hotel on GS Road.' },

  { name: 'Hotel Gateway Grandeur', area: 'GS Road, Christian Basti', areaTags: ['GS Road', 'Christian Basti', 'Dispur'],
    localityRank: 3, stars: 4, rating: 4.1,
    highlight: 'Established upscale business hotel on GS Road.' },

  { name: 'Radisson Blu Hotel, Guwahati', area: 'NH-37, Tetelia / Gotanagar', areaTags: ['Airport'],
    localityRank: 1, stars: 5, rating: 4.6,
    highlight: 'Luxury airport-access hotel — note it is not physically inside Borjhar itself.' },

  { name: 'Kiranshree Grand', area: 'New Airport Road, Mirzapur/Ganakpara', areaTags: ['Airport'],
    localityRank: 2, stars: 5, rating: 4.4,
    highlight: 'Luxury airport-area hotel.' },

  { name: 'Hotel Rajashree Inn', area: 'VIP Airport Road, Ganakpara', areaTags: ['Airport'],
    localityRank: 3, stars: null, rating: 3.4,
    highlight: 'Airport-area option; its exact star category has not been officially verified.' },

  { name: 'Hotel Jaysha', area: 'Dispur', areaTags: ['Dispur'],
    localityRank: 2, stars: null, rating: 4.8,
    highlight: 'A high guest rating in Dispur, though its star classification should not be assumed.' },

  { name: 'Hotel Pohor Regency', area: 'Kamakhya Gate / Temple area', areaTags: ['Kamakhya', 'Maligaon'],
    localityRank: 1, stars: null, rating: 4.6,
    highlight: 'A strong choice right by the Kamakhya Temple gate, convenient for pilgrims and early-morning visits.' },

  { name: 'Hotel Shanti Regency', area: 'Near Kamakhya Gate', areaTags: ['Kamakhya', 'Maligaon'],
    localityRank: 2, stars: null, rating: 4.9,
    highlight: 'A small, high-rated hotel/guesthouse-style option near Kamakhya Gate, though its review base is smaller than average.' },

  { name: 'Hotel Nilachal', area: 'Maligaon', areaTags: ['Maligaon', 'Kamakhya'],
    localityRank: 3, stars: null, rating: 4.2,
    highlight: 'A useful, straightforward option for Kamakhya Temple visitors.' },

  { name: 'Hotel Dynasty', area: 'Fancy Bazaar / Lakhtokia', areaTags: ['Fancy Bazaar'],
    localityRank: 1, stars: 4, rating: 4.1,
    highlight: 'An established hotel right in the central Fancy Bazaar market area.' },

  { name: 'Vishwaratna Hotel', area: 'AT Road / central Guwahati', areaTags: ['Fancy Bazaar'],
    localityRank: 2, stars: null, rating: 4.0,
    highlight: 'An established central hotel on AT Road.' },

  { name: 'Hotel Nandan', area: 'Paltan Bazaar, Old GS Road', areaTags: ['Paltan Bazaar', 'Fancy Bazaar'],
    localityRank: 3, stars: 3, rating: 4.1,
    highlight: 'A central budget/mid-range option near Paltan Bazaar and the railway station.' },

  { name: 'Hotel Atithi', area: 'Paltan Bazaar', areaTags: ['Paltan Bazaar'],
    localityRank: 1, stars: 3, rating: 4.4,
    highlight: 'An established city-centre hotel right in Paltan Bazaar.' },

  { name: 'Hotel Daaysco Oley Allo', area: 'Paltan Bazaar area', areaTags: ['Paltan Bazaar'],
    localityRank: 2, stars: null, rating: 4.2,
    highlight: 'A popular central option in the Paltan Bazaar area.' },

  { name: 'The Contour Hotel', area: 'Near Paltan Bazaar', areaTags: ['Paltan Bazaar'],
    localityRank: 3, stars: null, rating: 3.6,
    highlight: 'A central, transport-oriented option near Paltan Bazaar.' },

  { name: 'Swagatam Inn', area: 'Pan Bazaar', areaTags: ['Pan Bazaar'],
    localityRank: 1, stars: null, rating: 4.2,
    highlight: 'A central business/leisure option in Pan Bazaar.' },

  { name: 'Mayflower Hotel', area: 'Pan Bazaar / central', areaTags: ['Pan Bazaar'],
    localityRank: 2, stars: null, rating: 4.0,
    highlight: 'An established central hotel in Pan Bazaar.' },

  { name: 'Hotel President', area: 'Pan Bazaar', areaTags: ['Pan Bazaar'],
    localityRank: 3, stars: null, rating: null,
    highlight: 'A Pan Bazaar hotel whose current star category and guest rating are not yet independently verified — treat it as an unverified option rather than a firm recommendation.' },

  { name: 'The Ornate', area: 'Dr B Baruah Road, Ulubari / Uzan Bazaar side', areaTags: ['Ulubari', 'Uzan Bazaar'],
    localityRank: 1, stars: 3, rating: 4.2,
    highlight: 'The best-established nearby option on the Ulubari/Uzan Bazaar boundary.' },

  { name: 'Baruah Bhavan Guest House', area: 'Latasil, Uzan Bazaar', areaTags: ['Ulubari', 'Uzan Bazaar'],
    localityRank: 2, stars: null, rating: 4.2,
    highlight: 'A guesthouse-style stay (rather than a conventional hotel) on the Ulubari/Uzan Bazaar boundary.' },

  { name: 'Vivanta Guwahati', area: 'Khanapara', areaTags: ['Khanapara'],
    localityRank: 1, stars: 5, rating: 4.4,
    highlight: 'A major luxury hotel in Khanapara.' },

  { name: 'Hotel Palacio', area: 'Khanapara', areaTags: ['Khanapara'],
    localityRank: 2, stars: 4, rating: 4.1,
    highlight: 'An established upscale hotel in Khanapara.' },

  { name: 'The Lily Hotel', area: 'Six Mile / Khanapara', areaTags: ['Khanapara', 'Six Mile'],
    localityRank: 1, stars: 5, rating: 4.1,
    highlight: 'A major luxury hotel right on the Six Mile/Khanapara boundary.' },

  { name: 'Ratnamouli Palace', area: 'Beltola Chariali', areaTags: ['Beltola'],
    localityRank: 1, stars: 4, rating: 4.6,
    highlight: 'A strong, well-established hotel at Beltola Chariali.' },

  { name: 'The Greenwood', area: 'Beltola Tiniali, Beltola-Basistha-Khanapara Road', areaTags: ['Beltola', 'Khanapara', 'GS Road'],
    localityRank: 2, stars: 4, rating: 4.4,
    highlight: 'A boutique, resort-style upscale hotel on the Beltola-Basistha-Khanapara stretch — a good pick for a more relaxed, leafy stay without leaving the city.' },

  { name: 'Hotel Royale de Casa', area: 'Wireless / Beltola-Basistha Road', areaTags: ['Beltola'],
    localityRank: 3, stars: 4, rating: 4.3,
    highlight: 'An established full-service hotel on the Beltola-Basistha Road.' },

  { name: 'The Guwahati Address', area: 'Zoo Road Tiniali', areaTags: ['Zoo Road'],
    localityRank: 1, stars: null, rating: 4.4,
    highlight: 'An established, upscale local hotel at Zoo Road Tiniali.' },

  { name: 'The Palm Suites', area: 'Zoo Road area', areaTags: ['Zoo Road'],
    localityRank: 2, stars: null, rating: 4.8,
    highlight: 'A smaller, boutique-style option in the Zoo Road area.' },

  { name: 'Hotel Royal Palace', area: 'Zoo Road / Tiniali', areaTags: ['Zoo Road'],
    localityRank: 3, stars: 3, rating: 4.2,
    highlight: 'An established mid-range hotel at Zoo Road/Tiniali.' },

  { name: 'Treebo Urban Oasis Inn', area: 'Six Mile', areaTags: ['Six Mile'],
    localityRank: 2, stars: null, rating: null,
    highlight: 'A budget/mid-range chain hotel in Six Mile — its current classification is not yet independently verified.' },

  { name: 'Hotel Alohi Grand', area: 'Six Mile', areaTags: ['Six Mile'],
    localityRank: 3, stars: null, rating: null,
    highlight: 'A local Six Mile hotel option — its current classification is not yet independently verified.' },

  { name: "Rosemary's Nest", area: 'Uzan Bazaar', areaTags: ['Uzan Bazaar'],
    localityRank: 3, stars: null, rating: 5.0,
    highlight: 'A small Uzan Bazaar guesthouse with a perfect rating, though based on only around 26 reviews — a genuinely well-loved find, but worth knowing the sample is small.' },
];

// tier/rank are internal only — never sent to Gemini. `experienceTypes`
// is a canonical array normalized by hand from the source's messier
// "Resort Experience" free text (e.g. "Wildlife/Eco Resort" ->
// ['wildlife-resort', 'eco-resort']) — same normalize-messy-source-text
// approach already used when venues.js was rebuilt with typeOfPlace/
// musicVibe as independent matchable dimensions.
const resorts = [
  { name: 'Mayfair Spring Valley Resort, Guwahati', location: 'Tapesia Garden Road, Sonapur', cluster: 'Sonapur / Tepesia', clusterRank: 1,
    experienceTypes: ['luxury-resort'], stars: 5, rating: 4.6,
    highlight: 'A luxury resort with spa, pools, cottages/villas and a landscaped setting.' },

  { name: 'Brahmaputra Jungle Resort', location: 'Tapesia Garden Road, Sonapur', cluster: 'Sonapur / Tepesia', clusterRank: 2,
    experienceTypes: ['nature-resort'], stars: 3, rating: 4.2,
    highlight: 'An established jungle/nature resort with strong review volume.' },

  { name: 'Aarian Woods Boutique Resort', location: 'Tepesia', cluster: 'Sonapur / Tepesia', clusterRank: 3,
    experienceTypes: ['boutique-resort', 'nature-resort'], stars: null, rating: 4.0,
    highlight: 'A boutique nature resort with a jacuzzi; its classification has not been independently confirmed.' },

  { name: 'Dichang Resort', location: 'NH-37, Patar Kuchi, Tepesia', cluster: 'Sonapur / Tepesia', clusterRank: 4,
    experienceTypes: ['nature-resort', 'family-resort'], stars: 3, rating: 4.1,
    highlight: 'An established nature/family resort with a large review base.' },

  { name: 'Ryka Tranquil Resort', location: 'Nazirakhat, Tepesia', cluster: 'Sonapur / Tepesia', clusterRank: 5,
    experienceTypes: ['nature-resort', 'boutique-resort'], stars: null, rating: 4.6,
    highlight: 'A highly-rated smaller resort, though with low-to-medium review confidence.' },

  { name: 'Segun Bagan Resort', location: 'Sonapur', cluster: 'Sonapur / Tepesia', clusterRank: 6,
    experienceTypes: ['nature-resort'], stars: null, rating: 4.5,
    highlight: 'A strong smaller nature/leisure resort option.' },

  { name: "Georgie's Retreat Eco Camp", location: 'Hatimura, Sonapur', cluster: 'Sonapur / Tepesia', clusterRank: 7,
    experienceTypes: ['eco-resort', 'nature-resort'], stars: null, rating: 4.3,
    highlight: 'An eco-camp-style nature resort.' },

  { name: 'HIYAS Retreat', location: 'Mitani Pathar', cluster: 'Sonapur / Tepesia', clusterRank: 8,
    experienceTypes: ['nature-resort'], stars: null, rating: 4.7,
    highlight: 'A high-rated nature retreat, though based on only around 66 reviews.' },

  { name: 'Luit Greens An Eco Retreat', location: 'Amerigog / Sonapur', cluster: 'Sonapur / Tepesia', clusterRank: 9,
    experienceTypes: ['eco-resort'], stars: null, rating: 4.2,
    highlight: 'A small eco-retreat with limited review volume.' },

  { name: 'Panacea-The Village', location: 'Erabari, Borkhat, Sonapur', cluster: 'Sonapur / Tepesia', clusterRank: 10,
    experienceTypes: ['village-resort', 'family-resort'], stars: null, rating: 3.8,
    highlight: 'An established village/family resort, though with a lower current guest rating than most others in this cluster.' },

  { name: 'Twilight - A Riverside Resort', location: 'Chandrapur / Hatisila', cluster: 'Chandrapur', clusterRank: 1,
    experienceTypes: ['riverside-resort', 'nature-resort'], stars: null, rating: 4.2,
    highlight: 'A riverside nature resort with strong review volume.' },

  { name: 'Khamrenga Lake View Resort', location: 'Chandrapur Bagicha', cluster: 'Chandrapur', clusterRank: 2,
    experienceTypes: ['lake-view-resort', 'nature-resort'], stars: null, rating: 4.4,
    highlight: 'A lake-view, nature-oriented resort in Chandrapur.' },

  { name: "Gog's Tree House Eco Villa", location: 'Chandrapur', cluster: 'Chandrapur', clusterRank: 3,
    experienceTypes: ['eco-resort', 'nature-resort'], stars: null, rating: 4.8,
    highlight: 'A small eco-villa/tree-house stay, though with low review volume.' },

  { name: 'Pankhiraj Resort', location: 'Raja Mayang, Pobitora Forest Range', cluster: 'Pobitora / Mayong', clusterRank: 1,
    experienceTypes: ['wildlife-resort', 'nature-resort'], stars: null, rating: 4.8,
    highlight: 'A strongly-rated wildlife/nature resort, though based on only around 54 reviews.' },

  { name: 'Nirvana Green Resort - Pobitora', location: 'Near Pobitora Wildlife Sanctuary, Mayong', cluster: 'Pobitora / Mayong', clusterRank: 2,
    experienceTypes: ['wildlife-resort', 'eco-resort'], stars: null, rating: 4.4,
    highlight: 'A wildlife-oriented eco stay right by the Pobitora Wildlife Sanctuary.' },

  { name: 'Arya Eco Resort', location: 'Edge of Pobitora Wildlife Sanctuary', cluster: 'Pobitora / Mayong', clusterRank: 3,
    experienceTypes: ['eco-resort', 'wildlife-resort'], stars: 3, rating: 3.6,
    highlight: 'An eco-resort on the edge of Pobitora Wildlife Sanctuary; its star classification needs source-specific treatment, so treat the 3-star figure as approximate.' },

  { name: 'Rhino & River Wildlife Retreat & Spa', location: 'Pobitora / Mayong area', cluster: 'Pobitora / Mayong', clusterRank: 4,
    experienceTypes: ['luxury-resort', 'wildlife-resort'], stars: null, rating: 4.9,
    highlight: 'A premium luxury wildlife retreat and spa, though its classification is not locked without a stronger independent star source.' },

  { name: 'Maibong Eco Resort', location: 'Pobitora Forest Range Road', cluster: 'Pobitora / Mayong', clusterRank: 5,
    experienceTypes: ['eco-resort', 'wildlife-resort'], stars: null, rating: 4.2,
    highlight: 'A nature/wildlife eco stay on the Pobitora Forest Range Road.' },

  { name: 'Chanaka Eco Camp', location: 'Chanaka / Pobitora area', cluster: 'Pobitora / Mayong', clusterRank: 6,
    experienceTypes: ['eco-resort', 'wildlife-resort'], stars: null, rating: 4.2,
    highlight: 'An eco-camp-style wildlife stay with a large review base for a property of this kind.' },

  { name: "PK's Eco Retreat", location: 'Amsing, Jorabat', cluster: 'Amsing / Jorabat', clusterRank: 1,
    experienceTypes: ['eco-resort', 'nature-resort'], stars: null, rating: 4.2,
    highlight: 'An eco/nature resort adjacent to the Amsing waterfall.' },
];

// `stayType` is one canonical value per entry, hand-picked from the
// source's messier "Type of Stay" column (the same kind of inconsistent
// free text that made cinemas.js drop its own "Type" column entirely,
// just normalized here instead of dropped, since it's genuinely useful
// for matching "entire apartment" vs "homestay" vs "private room"
// requests). The general rule applied: use the first word/phrase in the
// source's own "Type of Stay" text. One deliberate exception: "Aesthetic
// Clean Private Room" is tagged 'private-room' rather than 'guesthouse',
// since "private room" (a single room in a shared property) is the more
// specific and informative distinction for that one entry — it's the
// only listing in this whole table that is genuinely a private-room
// booking rather than an entire guesthouse/home.
const homestays = [
  { name: 'The Cozy Zoo Road Apartment', area: 'Zoo Road', rank: 1, stayType: 'entire-place', rating: 4.94, reviewCount: 215,
    highlight: 'A central, well-established Airbnb — 2 bedrooms, with parking.' },

  { name: 'Florence Littoral Boutique BnB', area: 'Kharguli', rank: 2, stayType: 'boutique', rating: 4.88, reviewCount: 225,
    highlight: 'A premium boutique stay with Brahmaputra views and a balcony.' },

  { name: 'Cupid Homestay', area: 'Chandmari', rank: 3, stayType: 'homestay', rating: 4.92, reviewCount: 116,
    highlight: 'A central homestay with a strong review base — 2 bedrooms.' },

  { name: 'The Westin Quarters', area: 'Kamakhya / West Guwahati', rank: 4, stayType: 'serviced-apartment', rating: 4.89, reviewCount: 155,
    highlight: 'A serviced apartment useful for Kamakhya Temple visitors, with a mountain view.' },

  { name: '1-room Standalone Riverview House', area: 'Uzan Bazaar', rank: 5, stayType: 'guesthouse', rating: 4.90, reviewCount: 81,
    highlight: 'A riverfront/hillock-setting guesthouse with its own garden.' },

  { name: "Praptee's 2.0", area: 'Kamakhya-access area', rank: 6, stayType: 'entire-place', rating: 4.92, reviewCount: 83,
    highlight: 'A whole-home stay good for couples or small families, with easy Kamakhya access.' },

  { name: 'Aabir Home Stay', area: 'Hengrabari / Ganeshguri', rank: 7, stayType: 'homestay', rating: 4.9, reviewCount: 127,
    highlight: 'A homestay with strong review volume in a central residential location.' },

  { name: 'Arbour The Homestay', area: 'Sundarpur / Zoo Road side', rank: 8, stayType: 'homestay', rating: 4.8, reviewCount: 73,
    highlight: 'An established, well-reviewed homestay.' },

  { name: 'Park Abode Boutique Guest House', area: 'Hatigaon', rank: 9, stayType: 'guesthouse', rating: 4.8, reviewCount: 214,
    highlight: 'A boutique guesthouse with a strong Google review base.' },

  { name: "Palika's Inn – Studio Room", area: 'Fancy Bazaar', rank: 10, stayType: 'guesthouse', rating: 4.88, reviewCount: 41,
    highlight: 'A central studio-room stay, useful for railway/Paltan Bazaar/Pan Bazaar access.' },

  { name: 'Happy Hill Homestay', area: 'Uzan Bazaar', rank: 11, stayType: 'homestay', rating: 4.88, reviewCount: 67,
    highlight: 'A hillside homestay with balcony views, near the Navagraha Temple.' },

  { name: 'Guava Sauce Homestay', area: 'Paltan Bazaar', rank: 12, stayType: 'entire-place', rating: 4.89, reviewCount: 101,
    highlight: 'An established apartment/homestay with strong reviews.' },

  { name: 'Sona Stays – Zoo Road', area: 'Zoo Road', rank: 13, stayType: 'entire-place', rating: 4.93, reviewCount: 15,
    highlight: 'An excellent-rated apartment, though based on a small review sample.' },

  { name: 'The Nest Guest House', area: 'Ganeshguri', rank: 14, stayType: 'guesthouse', rating: 4.9, reviewCount: 85,
    highlight: 'A strong, well-reviewed guesthouse option in Ganeshguri.' },

  { name: 'Mysaa Stay', area: 'Ganeshguri', rank: 15, stayType: 'homestay', rating: 4.86, reviewCount: 63,
    highlight: 'A 1BHK homestay with a private kitchen and a garden/lounge, in a central city location.' },

  { name: 'Dibyalay – The Essence of Home', area: 'Bhangagarh / Kharghuli side', rank: 16, stayType: 'homestay', rating: 4.8, reviewCount: 237,
    highlight: 'A homestay with a large review base, a river view, and its own private entrance.' },

  { name: 'MG Guest House', area: 'Guwahati', rank: 17, stayType: 'guesthouse', rating: 4.93, reviewCount: 28,
    highlight: 'A local guesthouse that also offers an ethnic-food option.' },

  { name: 'Cordial Host Studio Apartment', area: 'Guwahati', rank: 18, stayType: 'studio', rating: 5.0, reviewCount: 34,
    highlight: 'An excellent-rated studio apartment, though based on a small review sample.' },

  { name: 'Hill-View Homestay', area: 'Guwahati hills', rank: 19, stayType: 'guesthouse', rating: 4.81, reviewCount: 210,
    highlight: 'A guesthouse/homestay with Brahmaputra and hill views, and strong review volume.' },

  { name: 'Open Space Contemporary yet Cozy', area: 'Bhetapara', rank: 20, stayType: 'guesthouse', rating: 4.83, reviewCount: 99,
    highlight: 'A large private guesthouse space with parking.' },

  { name: 'Saanj Studio – Nook', area: 'Airport side', rank: 21, stayType: 'studio', rating: 4.86, reviewCount: 36,
    highlight: 'A studio stay roughly 6 km from the airport — a useful pre/post-flight option.' },

  { name: 'Aesthetic Clean Private Room', area: 'Geetanagar', rank: 22, stayType: 'private-room', rating: 4.92, reviewCount: 26,
    highlight: 'A high-rated, budget-style private room.' },

  { name: 'House India: Uzanbazar Guesthouses – Marimba', area: 'Uzan Bazaar', rank: 23, stayType: 'homestay', rating: 4.79, reviewCount: 216,
    highlight: 'A central, heritage-style homestay/guesthouse with excellent review volume.' },

  { name: 'LifeForHome H2', area: 'Kamakhya-access area', rank: 24, stayType: 'entire-place', rating: 4.94, reviewCount: 16,
    highlight: 'A whole-home stay roughly 4 km from Kamakhya Temple, though based on a small review sample.' },

  { name: 'LifeForHome H3', area: 'Kamakhya-access area', rank: 25, stayType: 'entire-place', rating: 4.91, reviewCount: 33,
    highlight: 'A whole-home stay roughly 4 km from Kamakhya Temple.' },
];

const HOTEL_NAME_KEYWORDS = [
  { pattern: /\bnovotel\b/, name: 'Novotel Guwahati GS Road' },
  { pattern: /arista/, name: 'Arista by Ambition' },
  { pattern: /gateway\s?grandeur/, name: 'Hotel Gateway Grandeur' },
  { pattern: /radisson/, name: 'Radisson Blu Hotel, Guwahati' },
  { pattern: /kiranshree/, name: 'Kiranshree Grand' },
  { pattern: /rajashree\s?inn/, name: 'Hotel Rajashree Inn' },
  { pattern: /hotel\s?jaysha|\bjaysha\b/, name: 'Hotel Jaysha' },
  { pattern: /pohor\s?regency/, name: 'Hotel Pohor Regency' },
  { pattern: /shanti\s?regency/, name: 'Hotel Shanti Regency' },
  { pattern: /hotel\s?nilachal|\bnilachal\b/, name: 'Hotel Nilachal' },
  { pattern: /hotel\s?dynasty/, name: 'Hotel Dynasty' },
  { pattern: /vishwaratna/, name: 'Vishwaratna Hotel' },
  { pattern: /hotel\s?nandan/, name: 'Hotel Nandan' },
  { pattern: /hotel\s?atithi/, name: 'Hotel Atithi' },
  { pattern: /daaysco/, name: 'Hotel Daaysco Oley Allo' },
  { pattern: /contour\s?hotel/, name: 'The Contour Hotel' },
  { pattern: /swagatam/, name: 'Swagatam Inn' },
  { pattern: /mayflower/, name: 'Mayflower Hotel' },
  { pattern: /hotel\s?president/, name: 'Hotel President' },
  { pattern: /\bthe\s?ornate\b/, name: 'The Ornate' },
  { pattern: /baruah\s?bhavan/, name: 'Baruah Bhavan Guest House' },
  { pattern: /\bvivanta\b/, name: 'Vivanta Guwahati' },
  { pattern: /hotel\s?palacio/, name: 'Hotel Palacio' },
  { pattern: /lily\s?hotel/, name: 'The Lily Hotel' },
  { pattern: /ratnamouli/, name: 'Ratnamouli Palace' },
  { pattern: /\bgreenwood\b/, name: 'The Greenwood' },
  { pattern: /royale\s?de\s?casa/, name: 'Hotel Royale de Casa' },
  { pattern: /guwahati\s?address/, name: 'The Guwahati Address' },
  { pattern: /palm\s?suites/, name: 'The Palm Suites' },
  { pattern: /royal\s?palace/, name: 'Hotel Royal Palace' },
  { pattern: /treebo/, name: 'Treebo Urban Oasis Inn' },
  { pattern: /alohi\s?grand/, name: 'Hotel Alohi Grand' },
  { pattern: /rosemary/, name: "Rosemary's Nest" },
];

const HOTEL_AREA_KEYWORDS = [
  { pattern: /gs\s?road/, area: 'GS Road' },
  { pattern: /airport/, area: 'Airport' },
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  { pattern: /kamakhya/, area: 'Kamakhya' },
  { pattern: /maligaon/, area: 'Maligaon' },
  { pattern: /fancy\s?bazaar/, area: 'Fancy Bazaar' },
  { pattern: /paltan\s?bazaar|railway\s?station|train\s?station/, area: 'Paltan Bazaar' },
  { pattern: /pan\s?bazaar/, area: 'Pan Bazaar' },
  { pattern: /ulubari/, area: 'Ulubari' },
  { pattern: /khanapara/, area: 'Khanapara' },
  { pattern: /beltola/, area: 'Beltola' },
  { pattern: /zoo\s?road|tiniali/, area: 'Zoo Road' },
  { pattern: /six\s?mile/, area: 'Six Mile' },
  { pattern: /uzan\s?bazaar/, area: 'Uzan Bazaar' },
];

// Deliberately doesn't include a bare "stay" trigger — "a 3 day stay in
// Guwahati" is a common, totally unrelated way to describe a trip's
// length, and even "stay in/near <place>" phrasing false-positives on it
// (confirmed directly: "planning a 3 day stay in Guwahati" wrongly
// matched during testing). A genuine "where can I stay near Kamakhya"
// question is still caught two other ways: the fixed "where...stay"
// phrase below, or simply because "Kamakhya" is already a real
// HOTEL_AREA_KEYWORDS match on its own, independent of this trigger.
const HOTEL_TRIGGER =
  /\bhotels?\b|\baccommodations?\b|\blodging\b|where\s?(should|can|to)\s?i\s?stay|\bcheck[\s-]?in\b/;

// Casual phrasing that signals "I need somewhere to sleep" without using
// any category-specific word at all (no "hotel"/"resort"/"homestay"/
// "airbnb") — found missing during live testing: "just a room to crash
// in near the railway station" got the full off-topic decline, because
// none of the three categories' own triggers fired and their candidate
// lists all came back empty. Shared across hotels/resorts/homestays
// equally, since a genuinely generic "place to stay" question should
// reasonably surface a blend of all three, not favor one over the others.
const GENERAL_STAY_TRIGGER =
  /place\s?to\s?stay|somewhere\s?to\s?(stay|sleep)|spend\s+(a|the)\s+night|\bovernight\b|room\s?to\s?crash|crash\s?(for|the)?\s?(the\s)?night|\bcrash\s?(here|there)?\b/;

// Recognizes the most common trigger words from the OTHER category files
// (restaurants, cinemas, temples, shops, attractions, sports, hospitals,
// transport) — NOT to do any of their matching, just to recognize "this
// message is clearly about something else." Used only to defer when this
// category's own match is nothing more than a shared area name — found
// necessary after a real reported bug: "shopping in Fancy Bazaar" was
// also surfacing real hotels and homestays, since "Fancy Bazaar" is a
// genuine area tag in both accommodations.js and shops.js, and neither
// file had any awareness the other existed. Nearly every Guwahati
// locality (GS Road, Christian Basti, Beltola, Six Mile, Zoo Road...)
// appears in multiple category files, so this is a general architectural
// gap, not a one-off — this trigger closes it for the whole class rather
// than just the one reported case.
const OTHER_CATEGORY_TRIGGER =
  /\brestaurants?\b|\bcafes?\b|\bfood\b|\bcuisine\b|\bcinemas?\b|\bmovies?\b|\bfilms?\b|\btemples?\b|\bmandirs?\b|\bshops?\b|\bshopping\b|\bmarkets?\b|\bmalls?\b|\bbazaars?\b|\battractions?\b|\bsightseeing\b|\bwildlife\b|\bsports?\b|\bstadiums?\b|\bhospitals?\b|\bclinics?\b|\bcruise\b|\bferry\b/;

const RESORT_NAME_KEYWORDS = [
  { pattern: /mayfair|spring\s?valley/, name: 'Mayfair Spring Valley Resort, Guwahati' },
  { pattern: /brahmaputra\s?jungle/, name: 'Brahmaputra Jungle Resort' },
  { pattern: /aarian\s?woods/, name: 'Aarian Woods Boutique Resort' },
  { pattern: /dichang/, name: 'Dichang Resort' },
  { pattern: /ryka\s?tranquil/, name: 'Ryka Tranquil Resort' },
  { pattern: /segun\s?bagan/, name: 'Segun Bagan Resort' },
  { pattern: /georgie'?s\s?retreat/, name: "Georgie's Retreat Eco Camp" },
  { pattern: /hiyas/, name: 'HIYAS Retreat' },
  { pattern: /luit\s?greens/, name: 'Luit Greens An Eco Retreat' },
  { pattern: /panacea/, name: 'Panacea-The Village' },
  { pattern: /twilight/, name: 'Twilight - A Riverside Resort' },
  { pattern: /khamrenga/, name: 'Khamrenga Lake View Resort' },
  { pattern: /gog'?s\s?tree\s?house/, name: "Gog's Tree House Eco Villa" },
  { pattern: /pankhiraj/, name: 'Pankhiraj Resort' },
  { pattern: /nirvana\s?green/, name: 'Nirvana Green Resort - Pobitora' },
  { pattern: /arya\s?eco/, name: 'Arya Eco Resort' },
  { pattern: /rhino\s?(&|and)\s?river/, name: 'Rhino & River Wildlife Retreat & Spa' },
  { pattern: /maibong/, name: 'Maibong Eco Resort' },
  { pattern: /chanaka/, name: 'Chanaka Eco Camp' },
  { pattern: /pk'?s\s?eco\s?retreat/, name: "PK's Eco Retreat" },
];

const CLUSTER_KEYWORDS = [
  { pattern: /sonapur|tepesia|tapesia/, cluster: 'Sonapur / Tepesia' },
  { pattern: /chandrapur/, cluster: 'Chandrapur' },
  { pattern: /pobitora|mayong/, cluster: 'Pobitora / Mayong' },
  { pattern: /amsing|jorabat/, cluster: 'Amsing / Jorabat' },
];

const EXPERIENCE_KEYWORDS = [
  { pattern: /wildlife|\brhino\b|safari/, experience: 'wildlife-resort' },
  { pattern: /\beco\b|eco[\s-]?friendly/, experience: 'eco-resort' },
  { pattern: /\bnature\b|natural|jungle/, experience: 'nature-resort' },
  { pattern: /\bluxury\b|\bpremium\b/, experience: 'luxury-resort' },
  { pattern: /riverside|\briver\b/, experience: 'riverside-resort' },
  { pattern: /\blake\b/, experience: 'lake-view-resort' },
  { pattern: /\bfamily\b|\bkids\b/, experience: 'family-resort' },
  { pattern: /\bboutique\b/, experience: 'boutique-resort' },
  { pattern: /\bvillage\b/, experience: 'village-resort' },
];

const RESORT_TRIGGER = /\bresorts?\b|\bgetaway\b|weekend\s?trip|\bretreats?\b/;

const HOMESTAY_NAME_KEYWORDS = [
  { pattern: /cozy\s?zoo\s?road/, name: 'The Cozy Zoo Road Apartment' },
  { pattern: /florence\s?littoral/, name: 'Florence Littoral Boutique BnB' },
  { pattern: /cupid\s?homestay/, name: 'Cupid Homestay' },
  { pattern: /westin\s?quarters/, name: 'The Westin Quarters' },
  { pattern: /riverview\s?house/, name: '1-room Standalone Riverview House' },
  { pattern: /praptee/, name: "Praptee's 2.0" },
  { pattern: /aabir/, name: 'Aabir Home Stay' },
  { pattern: /arbour\s?the\s?homestay/, name: 'Arbour The Homestay' },
  { pattern: /park\s?abode/, name: 'Park Abode Boutique Guest House' },
  { pattern: /palika'?s\s?inn/, name: "Palika's Inn – Studio Room" },
  { pattern: /happy\s?hill/, name: 'Happy Hill Homestay' },
  { pattern: /guava\s?sauce/, name: 'Guava Sauce Homestay' },
  { pattern: /sona\s?stays/, name: 'Sona Stays – Zoo Road' },
  { pattern: /the\s?nest\s?guest\s?house/, name: 'The Nest Guest House' },
  { pattern: /mysaa/, name: 'Mysaa Stay' },
  { pattern: /dibyalay/, name: 'Dibyalay – The Essence of Home' },
  { pattern: /\bmg\s?guest\s?house\b/, name: 'MG Guest House' },
  { pattern: /cordial\s?host/, name: 'Cordial Host Studio Apartment' },
  { pattern: /hill-?view\s?homestay/, name: 'Hill-View Homestay' },
  { pattern: /open\s?space\s?contemporary/, name: 'Open Space Contemporary yet Cozy' },
  { pattern: /saanj\s?studio/, name: 'Saanj Studio – Nook' },
  { pattern: /aesthetic\s?clean/, name: 'Aesthetic Clean Private Room' },
  { pattern: /marimba|uzanbazar\s?guesthouses/, name: 'House India: Uzanbazar Guesthouses – Marimba' },
  { pattern: /lifeforhome\s?h2/, name: 'LifeForHome H2' },
  { pattern: /lifeforhome\s?h3/, name: 'LifeForHome H3' },
];

const HOMESTAY_AREA_KEYWORDS = [
  { pattern: /zoo\s?road/, area: 'Zoo Road' },
  { pattern: /kharguli/, area: 'Kharguli' },
  { pattern: /chandmari/, area: 'Chandmari' },
  { pattern: /kamakhya/, area: 'Kamakhya' },
  { pattern: /uzan\s?bazaar/, area: 'Uzan Bazaar' },
  { pattern: /hengrabari|ganeshguri/, area: 'Ganeshguri' },
  { pattern: /sundarpur/, area: 'Sundarpur' },
  { pattern: /hatigaon/, area: 'Hatigaon' },
  { pattern: /fancy\s?bazaar/, area: 'Fancy Bazaar' },
  { pattern: /paltan\s?bazaar|railway\s?station|train\s?station/, area: 'Paltan Bazaar' },
  { pattern: /bhangagarh/, area: 'Bhangagarh' },
  { pattern: /bhetapara/, area: 'Bhetapara' },
  { pattern: /\bairport\b/, area: 'Airport' },
  { pattern: /geetanagar/, area: 'Geetanagar' },
];

const STAYTYPE_KEYWORDS = [
  { pattern: /entire\s?(place|home|apartment)/, type: 'entire-place' },
  { pattern: /private\s?room/, type: 'private-room' },
  { pattern: /\bhomestay\b/, type: 'homestay' },
  { pattern: /\bguest\s?house\b|\bguesthouse\b/, type: 'guesthouse' },
  { pattern: /\bboutique\b/, type: 'boutique' },
  { pattern: /\bstudio\b/, type: 'studio' },
  { pattern: /serviced\s?apartment/, type: 'serviced-apartment' },
];

const AIRBNB_TRIGGER = /\bairbnb\b|\bhomestays?\b|\bguest\s?houses?\b|\bguesthouses?\b/;

const TOP_N_HOMESTAY = 5;

function matchKeywords(text, table, field) {
  const matched = [];
  for (const entry of table) {
    if (entry.pattern.test(text)) matched.push(entry[field]);
  }
  return matched;
}

function matchKeywordSet(text, table, field) {
  const matched = new Set();
  for (const entry of table) {
    if (entry.pattern.test(text)) matched.add(entry[field]);
  }
  return matched;
}

// A category's "own signal" is any sign the visitor was asking about
// THAT specific kind of stay, by name or by its own trigger words —
// deliberately excluding a bare shared area-name match, since an area
// name (e.g. "Zoo Road") isn't specific to any one category on its own.
function hasHotelSignal(text) {
  return HOTEL_TRIGGER.test(text) || matchKeywords(text, HOTEL_NAME_KEYWORDS, 'name').length > 0;
}
function hasResortSignal(text) {
  return (
    RESORT_TRIGGER.test(text) ||
    matchKeywords(text, RESORT_NAME_KEYWORDS, 'name').length > 0 ||
    matchKeywordSet(text, EXPERIENCE_KEYWORDS, 'experience').size > 0
  );
}
function hasHomestaySignal(text) {
  return (
    AIRBNB_TRIGGER.test(text) ||
    matchKeywords(text, HOMESTAY_NAME_KEYWORDS, 'name').length > 0 ||
    matchKeywordSet(text, STAYTYPE_KEYWORDS, 'type').size > 0
  );
}

// A named hotel always narrows to just that one. Otherwise, an area match
// only counts on its own (with no "hotel" word anywhere) if no OTHER
// accommodation category was explicitly asked for instead — found via
// live testing that "hotels near Zoo Road" was also surfacing homestays,
// purely because "Zoo Road" happens to be a shared area tag between the
// two categories, even though the visitor specifically said "hotels."
// Requiring the OTHER category to have no signal of its own before this
// one defers to it keeps a genuinely generic "places to stay near Zoo
// Road" question working (nothing else has a signal either, so this
// still matches), while a category-specific ask no longer bleeds into
// its neighbors just because an area name happens to be shared.
function getRelevantHotels(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, HOTEL_NAME_KEYWORDS, 'name');
  const matchedAreas = matchKeywords(text, HOTEL_AREA_KEYWORDS, 'area');
  const ownSignal = hasHotelSignal(text) || GENERAL_STAY_TRIGGER.test(text);

  if (!ownSignal && matchedAreas.length === 0) return [];
  if (matchedNames.length > 0) {
    return hotels.filter((h) => matchedNames.includes(h.name));
  }
  // Compares against siblings' SPECIFIC signal only (not their own
  // GENERAL_STAY_TRIGGER match) — otherwise a query like "spend a night
  // in nature" would make every category's ownSignal true via the shared
  // generic phrase, and hotels/homestays would wrongly fire their vague
  // fallback even though resorts already has the real, specific "nature"
  // signal that should claim this one (confirmed via testing: this exact
  // case regressed before this comment was added, and was fixed by
  // checking hasHotelSignal here instead of ownSignal).
  if (!hasHotelSignal(text) && (hasResortSignal(text) || hasHomestaySignal(text) || OTHER_CATEGORY_TRIGGER.test(text))) {
    return [];
  }

  if (matchedAreas.length > 0) {
    return hotels.filter((h) => matchedAreas.some((area) => h.areaTags.includes(area)));
  }

  return hotels.filter((h) => h.localityRank === 1);
}

// Same shape as getRelevantHotels above, including the sibling-deference
// rule. An experience-type match (e.g. "wildlife resort", or just
// "nature" on its own) and/or a cluster match (e.g. "Pobitora") narrow
// independently, same AND-combination model used elsewhere in this
// project. A genuinely vague "resorts near Guwahati?" falls back to the
// cluster-rank-1 pick from each of the 4 remaining clusters (The
// Greenwood's original Khanapara/GS Road cluster has no other entries —
// it was merged into hotels, see the file-level comment above).
function getRelevantResorts(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, RESORT_NAME_KEYWORDS, 'name');
  const matchedClusters = matchKeywords(text, CLUSTER_KEYWORDS, 'cluster');
  const matchedExperiences = matchKeywordSet(text, EXPERIENCE_KEYWORDS, 'experience');
  const ownSignal = hasResortSignal(text) || GENERAL_STAY_TRIGGER.test(text);

  if (!ownSignal && matchedClusters.length === 0) return [];
  if (matchedNames.length > 0) {
    return resorts.filter((r) => matchedNames.includes(r.name));
  }
  // See the matching comment in getRelevantHotels above — compares
  // against siblings' specific signal only, not their GENERAL_STAY_TRIGGER
  // match, so this category's own specific signal (e.g. "nature") still
  // wins even when the shared generic phrase ("spend a night") also
  // happens to be present in the same message.
  if (!hasResortSignal(text) && (hasHotelSignal(text) || hasHomestaySignal(text) || OTHER_CATEGORY_TRIGGER.test(text))) {
    return [];
  }

  let results = resorts;
  let filterApplied = false;

  if (matchedExperiences.size > 0) {
    results = results.filter((r) => r.experienceTypes.some((e) => matchedExperiences.has(e)));
    filterApplied = true;
  }
  if (matchedClusters.length > 0) {
    results = results.filter((r) => matchedClusters.includes(r.cluster));
    filterApplied = true;
  }

  if (!filterApplied) {
    return resorts.filter((r) => r.clusterRank === 1);
  }
  return results;
}

// Same shape again. A stay-type match (e.g. "homestay", "entire
// apartment") and/or an area match narrow independently. A genuinely
// vague "Airbnb in Guwahati?" falls back to the top 5 by rating (this
// table has no natural tiering of its own, unlike hotels/resorts, so
// this mirrors restaurants.js's TOP_N pattern instead).
function getRelevantHomestays(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, HOMESTAY_NAME_KEYWORDS, 'name');
  const matchedAreas = matchKeywords(text, HOMESTAY_AREA_KEYWORDS, 'area');
  const matchedTypes = matchKeywordSet(text, STAYTYPE_KEYWORDS, 'type');
  const ownSignal = hasHomestaySignal(text) || GENERAL_STAY_TRIGGER.test(text);

  if (!ownSignal && matchedAreas.length === 0) return [];
  if (matchedNames.length > 0) {
    return homestays.filter((h) => matchedNames.includes(h.name));
  }
  // See the matching comment in getRelevantHotels above.
  if (!hasHomestaySignal(text) && (hasHotelSignal(text) || hasResortSignal(text) || OTHER_CATEGORY_TRIGGER.test(text))) {
    return [];
  }

  let results = homestays;
  let filterApplied = false;

  if (matchedTypes.size > 0) {
    results = results.filter((h) => matchedTypes.has(h.stayType));
    filterApplied = true;
  }
  if (matchedAreas.length > 0) {
    results = results.filter((h) => matchedAreas.some((area) => h.area.toLowerCase().includes(area.toLowerCase())));
    filterApplied = true;
  }

  if (!filterApplied) {
    return [...homestays].sort((a, b) => b.rating - a.rating).slice(0, TOP_N_HOMESTAY);
  }
  return results;
}

module.exports = { hotels, resorts, homestays, getRelevantHotels, getRelevantResorts, getRelevantHomestays };
