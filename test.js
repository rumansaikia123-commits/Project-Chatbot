// Automated tests for this app's "matcher" functions — the
// getRelevantX() functions in each data file (restaurants.js, venues.js,
// sweets.js, transport.js, etc.) that decide which real, hand-verified
// entries are relevant to a visitor's message.
//
// What's a test, for anyone new to this: each `test(...)` block below
// runs a matcher function against a made-up message and checks
// ("asserts") that the result is what we already know it should be.
// `assert.equal(a, b)` fails loudly (and stops here with a red error) if
// `a` isn't exactly `b` — that's what catches a regression.
//
// Run this with: npm test  (or: node --test)
//
// Why this file exists: every real bug this project has hit in its
// keyword-matching logic (missing a plural like "cafes", missing a
// synonym like "samosa") was only ever caught by starting a live server,
// sending it a real message, and waiting for a real Gemini reply — slow,
// and costs real API tokens for something that's actually 100%
// deterministic. These matcher functions take a string in and return an
// array out, with no randomness and no network call, so they can be
// checked instantly and for free instead.
//
// IMPORTANT SCOPE NOTE: this only tests whether the right DATA reaches
// the prompt — it does NOT test whether Gemini's final reply actually
// uses that data correctly. That's the model's own behavior, which has
// real randomness (proven directly this session: the exact same message
// got a correct answer 2 out of 3 times). A live server check is still
// the right way to verify anything about the actual chatbot reply — this
// file is an addition to that, not a replacement for it.

const test = require('node:test');
const assert = require('node:assert/strict');

const { getRelevantRestaurants } = require('./restaurants');
const { getRelevantVenues } = require('./venues');
const { getRelevantParks } = require('./parks');
const { getRelevantTemples } = require('./temples');
const { getRelevantCinemas } = require('./cinemas');
const { getRelevantShops } = require('./shops');
const { getRelevantAttractions } = require('./attractions');
const { getRelevantHotels, getRelevantResorts, getRelevantHomestays, hotels } = require('./accommodations');
const { getRelevantSpectatorVenues, getRelevantSportsFacilities, getRelevantGamingVenues, sportsFacilities } = require('./sports');
const { getRelevantHospitals } = require('./hospitals');
const { getRelevantSweetShops, sweetShops } = require('./sweets');
const {
  getRelevantTransportHubs,
  getRelevantCabServices,
  getRelevantSelfDriveServices,
  getRelevantDestinations,
  getRelevantTwoWheelerRentals,
  getRelevantRvRentals,
  selfDriveServices,
  twoWheelerRentals,
} = require('./transport');
const { restaurants } = require('./restaurants');

// A message with nothing to do with this app, reused everywhere below to
// confirm a matcher stays quiet (returns []) rather than firing on
// everything.
const UNRELATED = 'Tell me about Kamakhya Temple';

// ----- Baseline smoke tests: every category responds to its own bare
// trigger word, and stays empty for something unrelated. This alone
// would have caught most of this project's real regex/keyword bugs. -----

test('restaurants: bare "best cafes" (plural) returns real matches', () => {
  assert.equal(getRelevantRestaurants('best cafes').length, 10);
});
test('restaurants: unrelated message returns none', () => {
  assert.equal(getRelevantRestaurants(UNRELATED).length, 0);
});

test('venues: bare "bars" (plural) returns real matches', () => {
  assert.equal(getRelevantVenues('bars').length, 10);
});
test('venues: bare "night clubs" (plural) returns real matches', () => {
  assert.equal(getRelevantVenues('night clubs').length, 10);
});
test('venues: unrelated message returns none', () => {
  assert.equal(getRelevantVenues('best cafes for breakfast').length, 0);
});

test('parks: a specific activity ("boating") returns a real match', () => {
  assert.equal(getRelevantParks('boating in a park').length, 1);
});
test('parks: a vague "tell me about parks" returns none (asks a clarifying question instead)', () => {
  assert.equal(getRelevantParks('tell me about parks').length, 0);
});

test('temples: naming one ("Kamakhya") returns a real match', () => {
  assert.equal(getRelevantTemples('Kamakhya Temple').length, 1);
});
test('temples: unrelated message returns none', () => {
  assert.equal(getRelevantTemples('best cafes').length, 0);
});

test('cinemas: bare "movies" returns real matches', () => {
  assert.equal(getRelevantCinemas('movies to watch').length, 4);
});

test('shops: bare "shopping malls" returns real matches', () => {
  assert.equal(getRelevantShops('shopping malls').length, 7);
});

test('attractions: "what should I see" returns real matches', () => {
  assert.equal(getRelevantAttractions('what should I see').length, 10);
});

test('hotels: bare "hotels" returns real matches', () => {
  assert.equal(getRelevantHotels('hotels in guwahati').length, 11);
});
test('resorts: bare "resort getaway" returns real matches', () => {
  assert.equal(getRelevantResorts('weekend resort getaway').length, 4);
});
test('homestays: bare "homestay airbnb" returns real matches', () => {
  assert.equal(getRelevantHomestays('homestay airbnb').length, 7);
});

test('spectator venues: "watch a cricket match" returns real matches', () => {
  assert.equal(getRelevantSpectatorVenues('watch a cricket match').length, 3);
});
test('sports facilities: "book a badminton court" returns real matches', () => {
  assert.equal(getRelevantSportsFacilities('book a badminton court').length, 7);
});
test('gaming venues: "bowling alley" returns real matches', () => {
  assert.equal(getRelevantGamingVenues('bowling alley').length, 3);
});

test('hospitals: "hospital with cardiology" returns real matches', () => {
  assert.equal(getRelevantHospitals('hospital with cardiology').length, 5);
});

test('transport hubs: "how do I travel to guwahati" returns real matches', () => {
  assert.equal(getRelevantTransportHubs('how do I travel to guwahati').length, 8);
});
test('transport hubs: unrelated message returns none', () => {
  assert.equal(getRelevantTransportHubs('best cafes').length, 0);
});
test('cab services: bare "I need a cab" returns real matches', () => {
  assert.equal(getRelevantCabServices('I need a cab').length, 8);
});
test('self-drive: bare "self drive car rental" returns real matches', () => {
  assert.equal(getRelevantSelfDriveServices('self drive car rental').length, 5);
});
test('destinations: naming one ("Shillong from Guwahati") returns a real match', () => {
  assert.equal(getRelevantDestinations('how to go to shillong from guwahati').length, 1);
});
test('destinations: unrelated message returns none', () => {
  assert.equal(getRelevantDestinations('best cafes').length, 0);
});

// ----- Real regression tests: specific bugs this project actually hit
// live, encoded here so they can never silently come back. -----

test('REGRESSION (samosa bug): sweets.js recognizes samosa/singara/pakora/etc, not just "sweets"/"mithai"', () => {
  const matches = getRelevantSweetShops('samosa in GS road').map((s) => s.name);
  assert.deepEqual(matches.sort(), ['MISTIMUKH', 'Makhan Bhog'].sort());
});
test('REGRESSION (samosa bug): restaurants.js Street Food cuisine recognizes samosa too', () => {
  const matches = getRelevantRestaurants('samosa in GS road').map((r) => r.name);
  assert.deepEqual(matches, ['Kiranshree Sweets']);
});

test('REGRESSION (Kiranshree over-broad cuisine tags): "north indian food" does NOT include the mithai shop', () => {
  const matches = getRelevantRestaurants('north indian food').map((r) => r.name);
  assert.ok(!matches.includes('Kiranshree Sweets'), 'Kiranshree Sweets should not appear for a plain North Indian food question');
});
test('REGRESSION (Kiranshree over-broad cuisine tags): sweets/street-food questions still find it', () => {
  assert.deepEqual(getRelevantRestaurants('mithai shop').map((r) => r.name), ['Kiranshree Sweets']);
  assert.deepEqual(getRelevantRestaurants('street food').map((r) => r.name), ['Kiranshree Sweets']);
});

test('REGRESSION (ABC/Bhangagarh area split): a bare "Bhangagarh" search finds Upsouth (not just the ABC-labeled entries)', () => {
  const matches = getRelevantRestaurants('restaurants in bhangagarh').map((r) => r.name);
  assert.ok(matches.includes('Upsouth'), 'Upsouth should match a bare Bhangagarh search');
  assert.ok(matches.includes('The Barbeque Company'), 'existing ABC-labeled entries should still match too (no regression)');
});

test('specialty restaurants (2026-09-08): "rajasthani" finds both new entries', () => {
  const matches = getRelevantRestaurants('rajasthani food').map((r) => r.name).sort();
  assert.deepEqual(matches, ['Rajasthani DHANI', 'Rajasthani Dhaba Pure Veg'].sort());
});

test('specialty restaurants (2026-09-08): a lowConfidence-flagged entry still matches by cuisine', () => {
  const matches = getRelevantRestaurants('south indian food').map((r) => r.name);
  assert.ok(matches.includes('Shri Balaji South Indian Hot Chips'), 'a lowConfidence entry should still be returned by its cuisine, not excluded');
});

test('specialty restaurants (2026-09-08): the 2 enriched duplicate entries still match by cuisine, with real phone/reviewCount now attached', () => {
  const aminia = restaurants.find((r) => r.name === 'Aminia Restaurant');
  const honeys = restaurants.find((r) => r.name === "Honey's Buffet Biryani");
  assert.equal(aminia.phone, '+91 70990 14300');
  assert.equal(aminia.reviewCount, 3389);
  assert.equal(honeys.phone, '+91 93655 62537');
  assert.equal(honeys.reviewCount, 112);
  assert.ok(getRelevantRestaurants('biryani').map((r) => r.name).includes('Aminia Restaurant'));
});

test('sweets.js: a bare "sweets" question returns all 20, sorted by curated reference rank (not star rating)', () => {
  const matches = getRelevantSweetShops('sweets');
  assert.equal(matches.length, 20);
  assert.equal(matches[0].name, 'Govindam Sweets'); // referenceRank 1
  assert.equal(matches[0].referenceRank, 1);
});

test('sweets.js: "chaats" alone narrows to ONLY the shops that really serve chaats', () => {
  const matches = getRelevantSweetShops('chaats');
  assert.equal(matches.length, 10);
  assert.ok(matches.every((s) => s.chaats === true), 'every match should have chaats === true');
});

test('sweets.js: chaats + area is a real AND-filter, not an OR (a chaats-less shop in that area is excluded)', () => {
  // MISTIMUKH is in Lachit Nagar but chaats: false, so a combined
  // "chaats near Ganeshguri" should NOT loosely fall back to every
  // chaats shop city-wide, or every shop in that area regardless of
  // chaats — it should narrow on both at once.
  const matches = getRelevantSweetShops('chaats near Ganeshguri');
  assert.deepEqual(matches.map((s) => s.name), ['Bhartiya Jalpan']);
});

test('sweets.js: an area spanning multiple shops (Lachit Nagar) matches all of them, including a multi-locality entry', () => {
  const matches = getRelevantSweetShops('sweet shop in Lachit Nagar').map((s) => s.name).sort();
  assert.deepEqual(matches, ['Ashok Sweets', 'MISTIMUKH'].sort());
});

test('sweets.js: named-shop matching disambiguates "Ashok Sweets" from "Ashok Sweets & Namkeen"', () => {
  assert.deepEqual(getRelevantSweetShops('Ashok Sweets').map((s) => s.name), ['Ashok Sweets']);
  assert.deepEqual(getRelevantSweetShops('Ashok Sweets and Namkeen').map((s) => s.name), ['Ashok Sweets & Namkeen']);
});

test('sweets.js: unrelated message returns none', () => {
  assert.equal(getRelevantSweetShops(UNRELATED).length, 0);
});

test('two-wheeler rentals: bare "bike rental" returns all 19', () => {
  assert.equal(getRelevantTwoWheelerRentals('bike rental').length, 19);
});
test('two-wheeler rentals: comma-delimited area ("Navodaya Nagar") matches every shop listing it', () => {
  // Oneride Bike Rental ("Basistha Chariali, Navodaya Nagar") AND
  // Zoom Bike ("Navodaya Nagar") should both match.
  assert.equal(getRelevantTwoWheelerRentals('bike rental in Navodaya Nagar').length, 2);
});
test('two-wheeler rentals: slash-delimited area ("VIP Road") matches every shop listing it', () => {
  // Canopy Northeast ("Six Mile, VIP Road") AND JAOBOL Bike & Car Rental
  // ("Bormotoria / VIP Road") should both match — proves BOTH real
  // delimiters this source mixes ("/" and ",") are handled.
  assert.equal(getRelevantTwoWheelerRentals('scooter rental in VIP Road').length, 2);
});

test('RV rentals: bare "caravan rental" returns both real businesses', () => {
  assert.equal(getRelevantRvRentals('caravan rental').length, 2);
});
test('RV rentals: named match ("Bharat Caravans") narrows to just that one', () => {
  assert.deepEqual(getRelevantRvRentals('Bharat Caravans').map((r) => r.name), ['Bharat Caravans - NorthEast']);
});
test('RV rentals: area match ("Bhangagarh") narrows to just Bharat Caravans', () => {
  assert.deepEqual(getRelevantRvRentals('caravan rental in Bhangagarh').map((r) => r.name), ['Bharat Caravans - NorthEast']);
});

// ----- Data-consistency checks: the same real place must show the same
// rating everywhere it appears, or visitors see two different numbers
// for the same business depending on which question they asked. -----

test('DATA SYNC: Ahija Self Drive has the same rating/reviewCount in both selfDriveServices and twoWheelerRentals', () => {
  const asCar = selfDriveServices.find((s) => s.name === 'Ahija Self Drive');
  const asBike = twoWheelerRentals.find((r) => r.name === 'Ahija Self Drive');
  assert.equal(asCar.rating, asBike.rating);
  assert.equal(asCar.reviewCount, asBike.reviewCount);
});

test('DATA SYNC: Kiranshree Sweets has the same rating in both restaurants.js and sweets.js', () => {
  const asRestaurant = restaurants.find((r) => r.name === 'Kiranshree Sweets');
  const asSweetShop = sweetShops.find((s) => s.name === 'Kiranshree Sweets');
  assert.equal(asRestaurant.rating, asSweetShop.rating);
});

// ----- Swimming venues (2026-09-09): real bugs found and fixed while
// researching where to swim in Guwahati. -----

test('REGRESSION (bare "swim" bug): "where can I swim" is no longer empty', () => {
  assert.ok(getRelevantSportsFacilities('where can I swim').length > 0);
  assert.ok(getRelevantSportsFacilities('where can I go for a swim').length > 0);
});

test('REGRESSION (Beltola area fix): a bare "Beltola" search still finds the pre-existing Arena 28 entry', () => {
  const matches = getRelevantSportsFacilities('football turf in Beltola').map((f) => f.name);
  assert.deepEqual(matches, ['Arena 28']);
});

test('swimming venues: named lookups narrow correctly', () => {
  assert.deepEqual(getRelevantSportsFacilities('Marlin Aquatics').map((f) => f.name), ['Marlin Aquatics']);
  assert.deepEqual(getRelevantSportsFacilities('Radisson Blu').map((f) => f.name), ['Radisson Blu Hotel, Guwahati']);
});

test('swimming venues: area search finds every entry listing that locality, including compound areas', () => {
  const khanapara = getRelevantSportsFacilities('swimming in Khanapara').map((f) => f.name).sort();
  assert.deepEqual(khanapara, ['Hotel Palacio', 'The Greenwood', 'Vivanta Guwahati'].sort());
  const beltola = getRelevantSportsFacilities('swimming in Beltola').map((f) => f.name).sort();
  assert.deepEqual(beltola, ['Ratnamouli Palace', 'The Greenwood'].sort());
});

test('DATA SYNC: each new hotel swimming entry has the same rating as its real accommodations.js hotel listing', () => {
  const pairs = [
    'Novotel Guwahati GS Road',
    'Vivanta Guwahati',
    'Ratnamouli Palace',
    'Arista by Ambition',
    'Kiranshree Grand',
    'The Greenwood',
    'Vishwaratna Hotel',
    'Hotel Palacio',
  ];
  for (const name of pairs) {
    const asHotel = hotels.find((h) => h.name === name);
    const asFacility = sportsFacilities.find((f) => f.name === name);
    assert.ok(asHotel, `${name} should exist in accommodations.js hotels`);
    assert.ok(asFacility, `${name} should exist in sports.js sportsFacilities`);
    assert.equal(asHotel.rating, asFacility.rating, `${name} rating should match between the two files`);
  }
  // Radisson Blu is named slightly differently between the two files
  // ("Radisson Blu Hotel, Guwahati" vs "Radisson Blu Hotel"-style
  // entries elsewhere) — checked separately by exact real names.
  const radissonHotel = hotels.find((h) => h.name === 'Radisson Blu Hotel, Guwahati');
  const radissonFacility = sportsFacilities.find((f) => f.name === 'Radisson Blu Hotel, Guwahati');
  assert.equal(radissonHotel.rating, radissonFacility.rating);
});

test('REGRESSION (GS Road area fix): found live right after deploying — "swimming in GS Road" was empty', () => {
  const matches = getRelevantSportsFacilities('Where can I go swimming in GS road?').map((f) => f.name).sort();
  assert.deepEqual(matches, ['Arista by Ambition', 'Novotel Guwahati GS Road'].sort());
});
test('REGRESSION (GS Road area fix): Christian Basti narrows correctly, and the pre-existing Timezone gaming venue still matches both', () => {
  assert.deepEqual(getRelevantSportsFacilities('swimming in Christian Basti').map((f) => f.name), ['Arista by Ambition']);
  assert.deepEqual(getRelevantGamingVenues('arcade in city center mall').map((g) => g.name), ['Timezone – City Center Mall']);
});

// Found via the verify-phrasing skill's stress test (2026-09-09), before
// any user hit it live — "dip" is a common, unambiguous colloquial
// synonym for swimming that the original word list missed.
test('REGRESSION (swim synonym): "fancy a dip" / "go for a dip" are recognized as swimming', () => {
  assert.ok(getRelevantSportsFacilities('fancy a dip').length > 0);
  assert.ok(getRelevantSportsFacilities('want to go for a dip today').length > 0);
});
test('swimming: a bare "pool" is deliberately NOT matched (genuinely ambiguous — GeT TaggED\'s activities include real billiards \'pool\')', () => {
  assert.equal(getRelevantSportsFacilities('any pools nearby').length, 0);
});
test('"learn swimming" correctly defers to spectatorVenues (Association/Government-run), not sportsFacilities', () => {
  assert.equal(getRelevantSportsFacilities('learn swimming').length, 0);
  const spectator = getRelevantSpectatorVenues('learn swimming').map((v) => v.name);
  assert.ok(spectator.includes('Dr. Zakir Hussain Aquatic Complex'));
});

// REGRESSION (billiards 'pool' had no keyword at all): found while
// testing the new swimming-vs-billiards clarifying question — picking
// "the pool/billiards table game" led nowhere, since GeT TaggED's real
// 'pool' activity had zero keyword mapping to it before this fix.
test('gaming venues: "pool table" and "billiards" both find GeT TaggED', () => {
  assert.deepEqual(getRelevantGamingVenues('pool table near me').map((g) => g.name), ['GeT TaggED']);
  assert.deepEqual(getRelevantGamingVenues('billiards in Guwahati').map((g) => g.name), ['GeT TaggED']);
});
test('gaming venues: a bare "pool" still resolves to nothing on the gaming side either, preserving the ambiguity for the clarifying question', () => {
  assert.equal(getRelevantGamingVenues('any pools nearby').length, 0);
});
// KNOWN, DEFERRED GAP (found the same session, left for later per direct
// decision): any gaming activity phrased as "play X" — not just
// billiards — gets wrongly deferred to sportsFacilities before the
// activity match is checked, since the generic word "play" triggers
// FACILITY_TRIGGER first. "pool table"/"billiards" alone (above) work
// correctly; "play pool" does not. This is a broader pre-existing
// pattern, not specific to this fix — intentionally not asserted here,
// noted for whenever that broader fix happens.
