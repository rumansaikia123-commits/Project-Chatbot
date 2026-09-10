// A hand-researched directory of Guwahati restaurants, compiled from Zomato
// CSV/PDF exports and deduplicated by hand. Each restaurant has a locality
// ("area"), a list of cuisines, an approximate cost for two (INR, or null
// if no source gave one), and a rating out of 5. Same "mini RAG" idea as
// venues.js: instead of sending this whole list to Gemini on every message,
// getRelevantRestaurants() below only returns the restaurants that actually
// match what the visitor asked about.
//
// Two entries (Terra Mayaa, The Maroon Room) already exist in venues.js as
// nightlife venues. A third (Abacus Brewing Co & Kitchen) turned up here
// too while transcribing this list. For all three, the rating and area
// below are taken from venues.js (not the newer restaurant source data),
// so the bot never shows two different ratings for the same place
// depending on whether someone asked about food or nightlife.

const restaurants = [
  // ----- ABC / Bhangagarh -----
  { name: 'The Barbeque Company', area: 'ABC, Bhangagarh (Exotica Arcade)', cuisines: ['North Indian', 'Buffet', 'BBQ'],
    costForTwo: 1000, rating: 4.3,
    highlight: 'Highly popular live buffet with grills.',
    address: '2nd Floor, Exotica Arcade, GS Rd, ABC, Guwahati, Assam 781005' },

  // ----- Ambari / Uzan Bazar -----
  { name: 'Lush - The Café', area: 'Ambari, Uzan Bazar', cuisines: ['Continental', 'Cafe'],
    costForTwo: 800, rating: 4.4,
    highlight: 'High-ranking aesthetic café concept.',
    address: 'GNB Rd, Ambari, near District Library, Guwahati, Assam 781001' },

  // ----- Beltola -----
  { name: 'JholoeKiya', area: 'Beltola', cuisines: ['North Indian', 'Chinese'],
    costForTwo: 1000, rating: 4.3,
    highlight: 'Flat 15% OFF dining discount on Zomato.',
    address: 'Survey, Beltola Tiniali, Guwahati, Assam 781028' },

  // ----- Christian Basti -----
  { name: 'Pirates of Grill', area: 'Christian Basti', cuisines: ['Buffet', 'North Indian', 'Chinese'],
    costForTwo: 1900, rating: 4.0,
    highlight: 'Flat 10% off via Swiggy Dineout pre-booking.',
    address: '2nd Floor, Central Mall, GS Rd, Christian Basti, Guwahati, Assam 781005' },
  { name: 'Red Hot Chilli Pepper', area: 'Christian Basti (Ganeshguri)', cuisines: ['Chinese', 'Pan-Asian'],
    costForTwo: 1500, rating: 4.3,
    highlight: 'Top-rated premium Chinese dine-out venue.',
    address: '2nd Floor, Central Mall, GS Rd, Christian Basti, Guwahati, Assam 781005' },
  { name: 'Lama by Yeti', area: 'Christian Basti', cuisines: ['Tibetan'],
    costForTwo: null, rating: 4.5,
    highlight: 'Awarded Best Ethnic Cuisine — Tibetan/Oriental specialties.' },
  // Abacus is also a venues.js nightlife venue — rating/area matched to that entry.
  { name: 'Abacus Brewing Co & Kitchen', area: 'Khanapara, Hotel Palacio, GS Road', cuisines: ['Asian', 'Continental', 'Modern Indian'],
    costForTwo: 2000, rating: 4.9,
    highlight: 'Craft brewery — reviewers call the live music the best in the city. Also a nightlife pick.',
    address: 'GS Road, Christian Basti, Guwahati, Assam' },

  // ----- Dighalipukhuri / Uzan Bazar -----
  { name: '11th Avenue Cafe Bistro', area: 'Dighalipukhuri, Uzan Bazar', cuisines: ['Continental', 'Italian', 'Cafe'],
    costForTwo: 700, rating: 4.2,
    highlight: 'Highly-rated youth hub and aesthetic café space.',
    address: 'Tayabullah Rd, Dighalipukhuri East, Uzan Bazar, Guwahati, Assam 781001' },

  // ----- Dispur / Tarun Nagar -----
  { name: 'Chakkranosh', area: 'Ulubari, BK Kakati Road', cuisines: ['North Indian', 'Mughlai', 'Biryani', 'Asian'],
    costForTwo: 900, rating: 4.6,
    highlight: 'Top-rated gourmet Indian in Ulubari.',
    address: 'BK Kakati Road, Ulubari, Guwahati, Assam' },
  // The Maroon Room is also a venues.js nightlife venue — rating/area matched to that entry.
  { name: 'The Maroon Room', area: 'Dispur', cuisines: ['Japanese', 'Italian', 'Continental'],
    costForTwo: 2500, rating: 4.6,
    highlight: "Guwahati's only restaurant with live entertainment every night — also a top nightlife pick.",
    address: '4th Floor, Subham Buildwell, GS Rd, Christian Basti, Guwahati, Assam 781006' },
  // Terra Mayaa is also a venues.js nightlife venue — rating/area matched to that entry.
  { name: 'Terra Mayaa Restaurant And Lounge', area: 'Christian Basti, Anil Plaza II', cuisines: ['Continental', 'Italian', 'Asian'],
    costForTwo: 1800, rating: 4.3,
    highlight: 'Open-air rooftop deck with full bar and panoramic views — also a nightlife pick.',
    address: '6th Floor, Anil Plaza II, GS Road, Christian Basti, Guwahati, Assam' },

  // ----- Fancy Bazaar -----
  { name: 'Tandoor', area: 'Fancy Bazaar (Dynasty Hotel)', cuisines: ['Mughlai', 'North Indian', 'Kebab'],
    costForTwo: 1200, rating: 4.2,
    highlight: 'Flat 10% off on walk-in dining through Swiggy.',
    address: 'Hotel Dynasty, SS Rd, Fancy Bazaar, Guwahati, Assam 781001' },

  // ----- Ganeshguri -----
  { name: 'Mising Kitchen', area: 'Ganeshguri', cuisines: ['Assamese', 'North Eastern'],
    costForTwo: 600, rating: 4.4,
    highlight: 'Top-voted ethnic cuisine spot on Zomato; Mising local specialties.',
    address: 'Hengrabari Rd, near Ganesh Mandir, Ganeshguri, Guwahati, Assam 781006' },
  { name: 'Yoko Sizzlers', area: 'Ganeshguri (City Center Mall)', cuisines: ['Continental', 'Sizzlers'],
    costForTwo: 1400, rating: 4.6,
    highlight: 'Famous multi-cuisine premium casual dining.',
    address: '3rd Floor, City Centre Mall, GS Rd, Christian Basti, Guwahati, Assam 781005' },
  { name: 'Gams Delicacy', area: 'Ganeshguri', cuisines: ['Assamese', 'Tribal'],
    costForTwo: 600, rating: 4.1,
    highlight: 'Classic spot for local Assamese and tribal culinary authenticity.',
    address: 'Krishna Market, GS Rd, Ganeshguri, Guwahati, Assam 781006' },

  // ----- Jalukbari -----
  { name: 'The Great Kabab Factory', area: 'Jalukbari (Radisson Blu)', cuisines: ['North Indian', 'Mughlai', 'Kebab'],
    costForTwo: null, rating: 4.3,
    highlight: 'Flat 10% OFF on Zomato; Mughlai kebabs.' },

  // ----- Khanapara -----
  { name: 'Aroma: Modern Dining', area: 'Khanapara', cuisines: ['Multi-Cuisine', 'Italian', 'Assamese'],
    costForTwo: 1200, rating: 4.3,
    highlight: 'Flat 10% OFF active walk-in offer on Zomato.',
    address: 'GS Rd, near Khanapara Flyover, Khanapara, Guwahati, Assam 781022' },
  { name: 'Dine Way Platz', area: 'Khanapara', cuisines: ['North Indian', 'Chinese', 'Continental'],
    costForTwo: 1200, rating: 4.2,
    highlight: 'Premium fine-dining framework on Swiggy.',
    address: 'Jayanagar, Khanapara, Guwahati, Assam 781022' },

  // ----- Lachit Nagar -----
  // phone/reviewCount added (2026-09-08): confirmed the same real place
  // as "Aminia Restaurant - Guwahati" in a specialty-restaurants source
  // (same rating, same area) — enriched in place rather than added as a
  // second entry.
  { name: 'Aminia Restaurant', area: 'Lachit Nagar', phone: '+91 70990 14300', reviewCount: 3389, cuisines: ['Mughlai', 'North Indian', 'Biryani'],
    costForTwo: 800, rating: 4.1,
    highlight: 'Popular for authentic Kolkata-style biryani.',
    address: 'GS Rd, near Lachit Nagar, Ulubari, Guwahati, Assam 781007' },

  // ----- Paltan Bazaar -----
  // 'North Indian'/'South Indian' removed from cuisines (2026-09-08):
  // real bug reported, a plain "north indian food" question was
  // surfacing this mithai/street-food shop among actual sit-down North
  // Indian restaurants. Same reasoning already applied to this exact
  // entry's 'Chinese' tag above (see the note near TOP_N/wantsProperMeal)
  // — a sweets shop that also sells a few north/south Indian snack items
  // isn't the same as an actual North/South Indian restaurant. Now only
  // matches a mithai/chaat/street-food-specific question, as intended.
  { name: 'Kiranshree Sweets', area: 'Paltan Bazaar', cuisines: ['Mithai', 'Street Food'],
    costForTwo: 400, rating: 4.3,
    highlight: '30% OFF on delivery; popular for mithai and street food.',
    address: 'Paltan Bazaar, Near Railway Station, Guwahati, Assam' },
  { name: 'The Masala Wok', area: 'Paltan Bazaar', cuisines: ['North Indian'],
    costForTwo: null, rating: 4.6,
    highlight: 'Top delivery choice for combo platters.' },

  // ----- Rehabari -----
  { name: 'Urban Desi Kitchen', area: 'Rehabari', cuisines: ['North Indian', 'Pure Veg'],
    costForTwo: 800, rating: 4.8,
    highlight: 'Top-rated pure vegetarian family restaurant.',
    address: 'Rehabari Rd, near Bilpar, Rehabari, Guwahati, Assam 781008' },

  // ----- Six Mile -----
  { name: 'The Square', area: 'Six Mile (Novotel)', cuisines: ['Asian', 'Continental', 'French'],
    costForTwo: 3000, rating: 4.0,
    highlight: 'Flat 30% OFF active reservation deal on Zomato.',
    address: 'Novotel Guwahati, GS Rd, Downtown, Six Mile, Guwahati, Assam 781006' },
  { name: 'Malt', area: 'Six Mile (Novotel)', cuisines: ['North Indian', 'Finger Food'],
    costForTwo: 2500, rating: 4.1,
    highlight: 'Flat 50% off pre-bookings via Swiggy Dineout.',
    address: 'Novotel Guwahati, GS Rd, Downtown, Six Mile, Guwahati, Assam 781006' },
  { name: 'Confucius', area: 'Six Mile', cuisines: ['Chinese', 'Thai'],
    costForTwo: 1100, rating: 4.5,
    highlight: 'Top-tier delivery and casual dining; authentic Chinese & Thai.',
    address: 'GS Rd, opposite Pantaloons, Six Mile, Guwahati, Assam 781022' },

  // ----- Sundarpur -----
  // phone/reviewCount added (2026-09-08): confirmed the same real place
  // as "Honey's Buffet Biryani & More" in a specialty-restaurants source
  // (same rating, same area) — enriched in place rather than added as a
  // second entry.
  { name: "Honey's Buffet Biryani", area: 'Sundarpur', phone: '+91 93655 62537', reviewCount: 112, cuisines: ['North Indian', 'Biryani', 'Buffet'],
    costForTwo: null, rating: 4.8,
    highlight: 'Highest-rated buffet biryani spot.' },

  // ----- Ulubari / Zoo Tiniali -----
  { name: 'Khorikaa', area: 'Ulubari, South Sarania', cuisines: ['Assamese'],
    costForTwo: 500, rating: 4.0,
    highlight: 'Legendary traditional Assamese thali destination.',
    address: '1st Floor, Bora Service Station, GS Rd, Ulubari, Guwahati, Assam 781007' },
  { name: 'Piazza', area: 'Ulubari', cuisines: ['Italian', 'Continental'],
    costForTwo: 1200, rating: 4.4,
    highlight: 'Celebrated casual dining and café space; gourmet pizza.',
    address: 'Dr B Baruah Rd, Ulubari, Guwahati, Assam 781007' },
  { name: 'Barbeque Nation', area: 'Ulubari', cuisines: ['North Indian', 'BBQ', 'Kebab'],
    costForTwo: 1600, rating: 4.5,
    highlight: 'Pre-bookable live buffet with BBQ grills and desserts.',
    address: '2nd Floor, Adityam Building, Shillong Rd, Ulubari, Guwahati, Assam' },
  { name: 'The Guwahati Address', area: 'Zoo Tiniali', cuisines: ['Chinese', 'Assamese', 'Bengali', 'North Indian', 'Asian'],
    costForTwo: 1200, rating: 4.1,
    highlight: 'Highly rated menu and ambience.',
    address: '45/46, RG Baruah Road, Zoo Tiniali, Guwahati, Assam' },

  // ----- Cafes (from a dedicated "best cafes" source; costs given as ranges
  // in that source have been converted to their midpoint) -----
  { name: "Daphne's Cafe", area: 'Machkhowa', cuisines: ['Cafe', 'Italian'],
    costForTwo: 1250, rating: 4.6,
    highlight: '3-story layout, Brahmaputra River sunset views, wood-fired pizza.' },
  // Also a venues.js nightlife pick (lounge-bar) — it's a cafe by day, bar by night.
  { name: 'Leaf Deck Café Bar', area: 'Chandmari', cuisines: ['Cafe', 'Bar'],
    costForTwo: 800, rating: 4.8,
    highlight: 'Cafe cum bar, handcrafted cocktails, all-day happy hours.' },
  { name: 'Balcony Cafe', area: 'Dighalipukhuri East', cuisines: ['Cafe'],
    costForTwo: 300, rating: 4.8,
    highlight: "Assam's first pink-themed cafe, very pocket-friendly." },
  { name: 'The October Cafe', area: 'Uzan Bazar', cuisines: ['Cafe'],
    costForTwo: 100, rating: 4.6,
    highlight: 'Cozy workspace vibe, highly affordable specialty coffee.' },
  { name: 'Cafe Aera', area: 'Bormotoria (GS Road)', cuisines: ['Cafe', 'Italian'],
    costForTwo: 300, rating: 4.5,
    highlight: 'Wood-fired pizza, hearty pastas, and relaxed workspace ambiance.' },
  // No alcohol served — a cafe with live entertainment, not a nightlife venue.
  { name: 'Guwahati Heights', area: 'Uzan Bazar', cuisines: ['Cafe'],
    costForTwo: 400, rating: 4.6,
    highlight: 'Live music, karaoke nights, and open mic events (no alcohol served).' },
  { name: 'Pause.', area: 'Rajgarh', cuisines: ['Cafe'],
    costForTwo: 300, rating: 4.9,
    highlight: 'Chef-driven comfort food, slow specialty coffee brewing.' },
  { name: 'Irish Republica Cafe', area: 'Lachit Nagar', cuisines: ['Cafe', 'Irish'],
    costForTwo: 1000, rating: 4.8,
    highlight: 'Traditional Irish warmth combined with modern quick bites.' },
  { name: 'Uptown Escape Cafe', area: 'GS Road (ABC)', cuisines: ['Cafe'],
    costForTwo: 1000, rating: 4.3,
    highlight: 'Great breakfast menu, fresh smoothies, and free Wi-Fi.' },
  { name: 'Brew & Chill', area: 'Fatasil Hills', cuisines: ['Cafe'],
    costForTwo: 300, rating: 4.8,
    highlight: 'Relaxed weekend hangout spot with scenic view vibes.' },
  { name: 'Cafe Rivea', area: 'Uzan Bazar', cuisines: ['Cafe'],
    costForTwo: 300, rating: 4.4,
    highlight: 'Excellent morning breakfast and riverside cafe vibes.' },
  { name: 'Bagan: Poolside Café (Greenwood)', area: 'Khanapara', cuisines: ['Cafe', 'Continental'],
    costForTwo: 1150, rating: 4.4,
    highlight: 'Luxury resort poolside dining, gourmet burgers & pizzas.' },
  { name: 'Dockyard by Cafe Bellevue', area: 'Kharghuli Hills', cuisines: ['Cafe'],
    costForTwo: 600, rating: 4.2,
    highlight: 'Panoramic hilltop views overlooking the Brahmaputra River.' },
  { name: 'Revolver Cafe', area: 'Uzan Bazar', cuisines: ['Cafe'],
    costForTwo: 700, rating: 4.5,
    highlight: 'Specialty coffee & matcha bar, artisanal burgers.' },
  { name: 'The HideOut Café', area: 'Borbari (VIP Road)', cuisines: ['Cafe', 'Tibetan'],
    costForTwo: 300, rating: 4.1,
    highlight: 'Garden-themed cafe, fresh multi-cuisine breakfast and momos.' },
  { name: 'The Atrangi House', area: 'Dighalipukhuri', cuisines: ['Cafe', 'Bakery', 'Continental'],
    costForTwo: 300, rating: 4.7,
    highlight: 'Fusion bakery, continental food, and quirky aesthetic design.' },
  { name: 'CAFE UZAN', area: 'Uzan Bazar (Latasil)', cuisines: ['Cafe'],
    costForTwo: 300, rating: 4.5,
    highlight: 'Cozy local cafe near Latasil, popular for casual coffee and affordable bites.' },
  { name: 'BiteBae Cafe', area: 'Uzan Bazar (Latasil)', cuisines: ['Cafe'],
    costForTwo: 150, rating: 4.7,
    highlight: 'Highly rated budget-friendly cafe with a casual hangout atmosphere.' },
  { name: 'Cafe Karma', area: 'Uzan Bazar (Dighalipukhuri East)', cuisines: ['Cafe'],
    costForTwo: 400, rating: 4.3,
    highlight: 'Popular casual cafe near Dighalipukhuri, suitable for relaxed meals and evening hangouts.' },
  { name: 'Velle Vista by Cafe Bellevue', area: 'Uzan Bazar (Umananda Ghat)', cuisines: ['Cafe'],
    costForTwo: 300, rating: 4.2,
    highlight: 'Riverside cafe above RiverRun with views toward the Brahmaputra and Umananda Ghat.' },
  { name: 'The Corner Café', area: 'Uzan Bazar (Ambari)', cuisines: ['Cafe'],
    costForTwo: 300, rating: 4.2,
    highlight: 'Long-running neighbourhood cafe offering multi-cuisine food and casual seating.' },
  { name: 'The Bean Journal Boutique Café', area: 'Uzan Bazar (Latasil)', cuisines: ['Cafe', 'Asian', 'Mediterranean', 'Italian'],
    costForTwo: 400, rating: 4.2,
    highlight: 'Boutique cafe known for coffee, desserts and a broad Asian, Mediterranean and Italian menu.' },
  { name: 'Craftery - Boutique Cafe', area: 'Uzan Bazar', cuisines: ['Cafe', 'Italian', 'Continental'],
    costForTwo: 700, rating: 4.4,
    highlight: 'Boutique-style cafe serving coffee, Italian and continental food in an aesthetic setting.' },
  { name: 'Café Choco Craze', area: 'Uzan Bazar (Latasil)', cuisines: ['Cafe', 'Bakery'],
    costForTwo: 300, rating: 4.3,
    highlight: 'Affordable cafe focused on chocolate, beverages, snacks and casual dining.' },

  // ----- Specialty cuisines added 2026-09-08 (Biryani/South
  // Indian/Bengali/Rajasthani), from a dedicated source-checked
  // directory. No cost-for-two data in this source (costForTwo: null
  // throughout). `lowConfidence: true` is set on exactly the entries
  // whose rating the source itself flagged as uncertain — a
  // food-delivery-app rating rather than Google's, or (Shri Balaji)
  // literally "Current rating to verify" with no numeric rating given
  // at all, the first null-rating restaurant in this app.
  { name: 'Bikkgane Biryani', area: 'Basistha', phone: '+91 89023 77220', reviewCount: 126, cuisines: ['Biryani'],
    costForTwo: null, rating: 4.6,
    highlight: 'Hyderabadi-style biryani, including chicken, mutton, and veg options.' },
  { name: 'Pakkhtun Biryani', area: 'Nabin Nagar / Zoo Tiniali', phone: '+91 60029 16233', reviewCount: 364, cuisines: ['Biryani', 'Mughlai'],
    costForTwo: null, rating: 4.3,
    highlight: 'Mughlai-style biryani with chicken and mutton options.' },
  { name: 'Zaika Muradabadi & Hyderabadi', area: 'Guwahati', phone: null, reviewCount: null, cuisines: ['Biryani', 'Mughlai'],
    costForTwo: null, rating: 4.3, lowConfidence: true,
    highlight: 'Muradabadi and Hyderabadi biryani, plus other Mughlai dishes.' },
  { name: 'Kolkata Arsalan Biryani', area: 'Guwahati', phone: null, reviewCount: null, cuisines: ['Biryani'],
    costForTwo: null, rating: 4.3, lowConfidence: true,
    highlight: 'Kolkata-style biryani — chicken, mutton, egg, and aloo biryani.' },

  { name: 'Upsouth', area: 'Bhangagarh', phone: '+91 87240 75958', reviewCount: 1800, cuisines: ['South Indian'],
    costForTwo: null, rating: 4.9,
    highlight: 'Top-rated South Indian spot — dosa, idli, vada, uttapam, and filter coffee.' },
  { name: 'Kerala Bhavan', area: 'Paltan Bazaar', phone: '+91 98644 48950', reviewCount: 2018, cuisines: ['South Indian'],
    costForTwo: null, rating: 4.7,
    highlight: 'Real Kerala cuisine alongside classic South Indian dosa, idli, and vada.' },
  { name: 'BLR Express', area: 'Uzan Bazar / Latasil', phone: '+91 70025 53087', reviewCount: 1712, cuisines: ['South Indian'],
    costForTwo: null, rating: 4.7,
    highlight: 'Bengaluru-style South Indian dishes.' },
  { name: 'Kattha Katte', area: 'Uzan Bazar / Latasil', phone: null, reviewCount: 974, cuisines: ['South Indian'],
    costForTwo: null, rating: 4.6,
    highlight: 'Popular South Indian breakfast and meals spot.' },
  { name: 'Chennai Kitchen', area: 'Christian Basti', phone: '+91 90859 00009', reviewCount: 5870, cuisines: ['South Indian'],
    costForTwo: null, rating: 4.1,
    highlight: "One of the city's most-reviewed South Indian spots." },
  { name: 'Dosa Corner', area: 'Guwahati', phone: null, reviewCount: null, cuisines: ['South Indian'],
    costForTwo: null, rating: 3.9, lowConfidence: true,
    highlight: 'Masala, plain, and rava dosa varieties, plus uttapam.' },
  { name: 'Chennai Banana Leaf', area: 'Uzan Bazar', phone: null, reviewCount: null, cuisines: ['South Indian'],
    costForTwo: null, rating: 3.8, lowConfidence: true,
    highlight: 'South Indian meals served banana-leaf style.' },
  { name: 'Namma Chennai Dosa Express', area: 'Zoo Tiniali', phone: null, reviewCount: null, cuisines: ['South Indian'],
    costForTwo: null, rating: 3.3, lowConfidence: true,
    highlight: 'Quick-service South Indian dosa spot.' },
  { name: 'Shri Balaji South Indian Hot Chips', area: 'Six Mile', phone: null, reviewCount: null, cuisines: ['South Indian'],
    costForTwo: null, rating: null, lowConfidence: true,
    highlight: 'South Indian snacks and hot chips, alongside dosa, idli, and vada.' },

  { name: 'Ranna Ghor', area: 'Paltan Bazaar', phone: '+91 86383 04936', reviewCount: 338, cuisines: ['Bengali'],
    costForTwo: null, rating: 4.7,
    highlight: 'Bengali-style home cooking — fish, meat, and rice meals.' },
  { name: 'Khaddo Roshik', area: 'Lal Ganesh / Lokhra Tiniali', phone: '+91 60032 42790', reviewCount: 962, cuisines: ['Bengali'],
    costForTwo: null, rating: 4.5,
    highlight: 'Traditional Bengali fish curries and rice meals.' },
  { name: 'UTSOB Purely Bengali Simply Delicious', area: 'Lachit Nagar / Ulubari', phone: '+91 76638 85566', reviewCount: 114, cuisines: ['Bengali'],
    costForTwo: null, rating: 4.4,
    highlight: 'A purely Bengali menu — fish and meat dishes.' },
  { name: 'The Rajbari', area: 'Lal Ganesh / Lokhra', phone: '+91 93959 87966', reviewCount: 1749, cuisines: ['Bengali'],
    costForTwo: null, rating: 4.3,
    highlight: 'Traditional Bengali cuisine and fish dishes.' },
  { name: 'Suruchi Hotel', area: 'Paltan Bazaar', phone: null, reviewCount: 283, cuisines: ['Bengali'],
    costForTwo: null, rating: 4.1,
    highlight: 'Bengali-style meals — fish and rice dishes.' },

  { name: 'Rajasthani DHANI', area: 'Jorabat', phone: '+91 70141 37808', reviewCount: 1304, cuisines: ['Rajasthani', 'Pure Veg'],
    costForTwo: null, rating: 4.0,
    highlight: 'Traditional Rajasthani thali, including dal baati churma.' },
  { name: 'Rajasthani Dhaba Pure Veg', area: 'Pator Kuchi', phone: '+91 70739 86970', reviewCount: 274, cuisines: ['Rajasthani', 'Pure Veg'],
    costForTwo: null, rating: 4.0,
    highlight: 'Rajasthani and North Indian vegetarian dishes, including dal baati.' },
];

// Cuisine keyword lookup — one row per canonical cuisine that actually
// appears in the list above, with common synonyms folded in. Returns the
// set of canonical cuisines the visitor's message seems to be asking for.
const CUISINE_KEYWORDS = [
  // Broadened after a real reported bug: "what's the best local food to
  // try" — an extremely natural way to ask this exact question — matched
  // none of these words, so it fell through to the generic top-rated-
  // overall fallback instead of the 5 real Assamese restaurants that DO
  // exist (Mising Kitchen, Gams Delicacy, Khorikaa, The Guwahati Address,
  // Aroma: Modern Dining) — a visible mismatch between the reply text
  // (accurately describing Khar/Masor Tenga from general knowledge) and
  // the cards shown (generic cafes/bars with no connection to local
  // cuisine). "Local"/"traditional"/"authentic"/"native"/"regional food"
  // are unambiguous synonyms for Assamese cuisine in a Guwahati-only app,
  // so they're folded into this same pattern rather than the generic
  // word "local" being left to mean nothing.
  { pattern: /assames[ea]|local\s?food|traditional\s?(assamese\s?)?food|authentic\s?(assamese\s?)?food|native\s?food|regional\s?(assamese\s?)?(food|cuisine)/, cuisine: 'Assamese' },
  { pattern: /north\s?eastern|\bne\s?cuisine\b/, cuisine: 'North Eastern' },
  { pattern: /\btribal\b/, cuisine: 'Tribal' },
  { pattern: /\bcontinental\b/, cuisine: 'Continental' },
  { pattern: /\bitalian\b|\bpizzas?\b|\bpastas?\b/, cuisine: 'Italian' },
  { pattern: /\bfrench\b/, cuisine: 'French' },
  { pattern: /\bchinese\b/, cuisine: 'Chinese' },
  { pattern: /pan-?asian|\basian\b/, cuisine: 'Asian' },
  { pattern: /\bbengali\b/, cuisine: 'Bengali' },
  { pattern: /north\s?indian/, cuisine: 'North Indian' },
  { pattern: /\bbbqs?\b|barbe?cues?|\bgrills?\b/, cuisine: 'BBQ' },
  { pattern: /\bkebab/, cuisine: 'Kebab' },
  { pattern: /modern\s?indian/, cuisine: 'Modern Indian' },
  { pattern: /south\s?indian|\bdosas?\b|\bidlis?\b/, cuisine: 'South Indian' },
  { pattern: /\bmithai\b|\bsweets?\b/, cuisine: 'Mithai' },
  // Snack item names added after a real bug: "samosa in GS Road" found no
  // match even though Kiranshree Sweets (the one Street Food-tagged entry)
  // genuinely sells them — nothing connected the specific snack name to
  // the cuisine tag. Plurals included from the start, per this project's
  // repeated \bword\b-missing-plurals bug history.
  { pattern: /street\s?food|\bsamosas?\b|\bsingaras?\b|\bpakoras?\b|\bpakodas?\b|\bkachoris?\b|\bvadas?\b/, cuisine: 'Street Food' },
  { pattern: /\bmughlai\b/, cuisine: 'Mughlai' },
  // "biriyani" added 2026-09-09 — an extremely common alternate spelling
  // in India, arguably as common as "biryani" itself; found via the same
  // misspelling-class check as the FOOD_TRIGGER fix above.
  { pattern: /\bbiryanis?\b|\bbiriyanis?\b/, cuisine: 'Biryani' },
  { pattern: /\btibetan\b|\bmomos?\b/, cuisine: 'Tibetan' },
  { pattern: /\bsizzlers?\b/, cuisine: 'Sizzlers' },
  { pattern: /\bbuffets?\b/, cuisine: 'Buffet' },
  { pattern: /finger\s?food/, cuisine: 'Finger Food' },
  { pattern: /pure\s?veg|vegetarian/, cuisine: 'Pure Veg' },
  { pattern: /multi-?cuisine/, cuisine: 'Multi-Cuisine' },
  { pattern: /\bthai\b/, cuisine: 'Thai' },
  { pattern: /\bcaf[eé]s?\b|\bcoffee\b/, cuisine: 'Cafe' },
  { pattern: /\bjapanese\b|\bsushi\b/, cuisine: 'Japanese' },
  { pattern: /\birish\b/, cuisine: 'Irish' },
  { pattern: /\bmediterranean\b/, cuisine: 'Mediterranean' },
  { pattern: /\bbakery\b|\bdessert/, cuisine: 'Bakery' },
  { pattern: /rajasthani\b/, cuisine: 'Rajasthani' },
];

// Area keyword lookup — one row per locality actually used above, with
// common alt-spellings. Matched as a substring against each restaurant's
// (sometimes compound, e.g. "Six Mile (Novotel)") area string, not an
// exact match — a plain Set-equality check would miss "Six Mile" matching
// "Six Mile (Novotel)".
const AREA_KEYWORDS = [
  // Split into two rows (2026-09-08): same fix as the Dighalipukhuri/
  // Uzan Bazar split below — was one merged row mapping both "abc" and
  // "bhangagarh" to the single canonical 'ABC, Bhangagarh', but the
  // substring-match filter then failed for a restaurant (Upsouth) whose
  // area is genuinely just "Bhangagarh," not the ABC complex
  // specifically. Existing ABC-labeled entries (e.g. "ABC, Bhangagarh
  // (Exotica Arcade)") still match both rows below, since their area
  // string already contains "bhangagarh" as a substring.
  { pattern: /\babc\b/, area: 'ABC, Bhangagarh' },
  { pattern: /bhangagarh/, area: 'Bhangagarh' },
  { pattern: /\bambari\b/, area: 'Ambari' },
  { pattern: /\bbeltola\b/, area: 'Beltola' },
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  // Split into two rows (was one merged "Dighalipukhuri|Uzan Bazar" row that
  // mapped both to the single canonical name 'Dighalipukhuri' — but the
  // substring-match filter below then failed for any restaurant whose area
  // says "Uzan Bazar" without literally containing the word "Dighalipukhuri",
  // which is true for most of the cafes added later).
  { pattern: /dighalipukhuri/, area: 'Dighalipukhuri' },
  { pattern: /uzan\s?bazar/, area: 'Uzan Bazar' },
  { pattern: /latasil/, area: 'Latasil' },
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /tarun\s?nagar/, area: 'Tarun Nagar' },
  { pattern: /fancy\s?bazaar/, area: 'Fancy Bazaar' },
  { pattern: /ganeshguri/, area: 'Ganeshguri' },
  { pattern: /jalukbari/, area: 'Jalukbari' },
  { pattern: /khanapara/, area: 'Khanapara' },
  { pattern: /lachit\s?nagar/, area: 'Lachit Nagar' },
  { pattern: /paltan\s?bazaar/, area: 'Paltan Bazaar' },
  { pattern: /rehabari/, area: 'Rehabari' },
  { pattern: /six\s?mile|\b6\s?mile\b/, area: 'Six Mile' },
  { pattern: /sundarpur/, area: 'Sundarpur' },
  { pattern: /ulubari|south\s?sarania/, area: 'Ulubari' },
  { pattern: /zoo\s?tiniali|zoo\s?road/, area: 'Zoo Tiniali' },
  { pattern: /machkhowa/, area: 'Machkhowa' },
  { pattern: /chandmari/, area: 'Chandmari' },
  { pattern: /rajgarh/, area: 'Rajgarh' },
  { pattern: /fatasil/, area: 'Fatasil Hills' },
  { pattern: /kharghuli/, area: 'Kharghuli Hills' },
  { pattern: /borbari/, area: 'Borbari' },
  { pattern: /\bbasistha\b/, area: 'Basistha' },
  { pattern: /nabin\s?nagar/, area: 'Nabin Nagar' },
  { pattern: /lal\s?ganesh/, area: 'Lal Ganesh' },
  { pattern: /lokhra/, area: 'Lokhra' },
  { pattern: /\bjorabat\b/, area: 'Jorabat' },
  { pattern: /pator\s?kuchi/, area: 'Pator Kuchi' },
];

function matchCuisines(text) {
  const matched = new Set();
  for (const { pattern, cuisine } of CUISINE_KEYWORDS) {
    if (pattern.test(text)) matched.add(cuisine);
  }
  return matched;
}

function matchAreas(text) {
  const matched = [];
  for (const { pattern, area } of AREA_KEYWORDS) {
    if (pattern.test(text)) matched.push(area);
  }
  return matched;
}

// Turns phrases like "under 1000", "cheap", or "fine dining" into a
// { min?, max? } cost-for-two range. Returns null if nothing budget-related
// was mentioned.
function parseBudgetSignal(text) {
  const under = text.match(/(?:under|below|less than|within|up to)\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/);
  if (under) return { max: Number(under[1]) };

  const around = text.match(/(?:around|about|approx(?:imately)?)\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/);
  if (around) {
    const n = Number(around[1]);
    return { min: Math.round(n * 0.7), max: Math.round(n * 1.3) };
  }

  if (/\bcheap\b|budget[- ]?friendly|\baffordable\b|inexpensive|pocket[- ]?friendly/.test(text)) {
    return { max: 800 };
  }
  if (/\bexpensive\b|fine\s?dining|\bupscale\b|\bsplurge\b|high[- ]?end|\bpricey\b|special (occasion|dinner)/.test(text)) {
    return { min: 1800 };
  }
  return null;
}

// Common misspellings added 2026-09-09 (found via the verify-phrasing
// skill, triggered by a real live bug report — "restaurents" returned
// no match at all): restaurants/restaurents/resturants, dining/dinning,
// breakfast/brekfast. This is a different bug shape than the usual
// missing-plural one — genuine common typos, not a missing word form —
// so handled the same way, as explicit alternatives, not a fuzzy-match
// rewrite of this whole file's style.
const FOOD_TRIGGER = /\b(restaurants?|restaurents?|resturants?|food|dining|dinning|dine|eat(?:ing|s)?|cuisine|lunch|dinner|breakfast|brekfast|thali|caf[eé]s?|meal|hungry)\b/;

// Looks at what the visitor actually asked and returns only the matching
// restaurants. Returns [] only when the message isn't food-related at all.
// A broad food question (no cuisine/budget/area given, e.g. "top rated
// restaurants" or just "cafes") no longer returns nothing — it falls
// through to the sort-and-cap step below with zero filters applied, so it
// gets real top-rated picks, the same way a broad "top rated bars" nightlife
// question already gets an immediate real answer instead of a stonewall.
const TOP_N = 10;

function getRelevantRestaurants(message) {
  const text = message.toLowerCase();

  const matchedCuisines = matchCuisines(text);
  const matchedAreas = matchAreas(text);
  const budget = parseBudgetSignal(text);

  // A few cuisines are unlike most others: in casual speech they usually
  // imply "not a regular sit-down restaurant" rather than reinforcing the
  // word "restaurant" (compare "Chinese restaurant," where the two words
  // agree). So a message like "a cafe for breakfast, a restaurant for
  // lunch" mentions both — but narrowing to Cafe-only would then starve the
  // "restaurant" half of the request of every non-cafe option, which is
  // exactly a real bug a user hit. Confirmed the same problem exists for
  // Mithai/Bakery/Street Food too (e.g. "bakery in the morning and a
  // restaurant for dinner" was starved the identical way). Only when one of
  // these is the SOLE matched cuisine (not "cafe and Chinese food", which
  // already works fine via the normal OR-match) and the generic word
  // "restaurant" also appears, treat the cuisine as too narrow to apply and
  // fall through to the broader top-rated pool.
  // "restaurant" itself, and "lunch"/"dinner", are treated as the same
  // strength of signal here — someone asking "where for lunch?" wants a
  // proper sit-down meal just as much as someone who says "restaurant",
  // and both should get the same shop-like-cuisine handling below (unlike
  // "breakfast", which genuinely fits a cafe stop as its default meaning).
  // Misspellings added 2026-09-09: this is a SEPARATE regex from
  // FOOD_TRIGGER above, and got missed when FOOD_TRIGGER was fixed for
  // "restaurents"/"resturant" earlier the same day — a real bug this
  // caused: "restaurents in Guwahati" was recognized as a food question
  // (FOOD_TRIGGER), but not as "wants a proper meal" (this regex still
  // only knew the correct spelling), so the cafe-exclusion filter below
  // never fired and cafes leaked into a plain restaurant request.
  const wantsProperMeal = /\brestaurants?\b|\brestaurents?\b|\bresturants?\b|\blunch\b|\bdinner\b/.test(text);

  const SHOP_LIKE_CUISINES = new Set(['Cafe', 'Mithai', 'Bakery', 'Street Food']);
  const mentionedShopLikeCuisine = [...matchedCuisines].some((c) => SHOP_LIKE_CUISINES.has(c));
  const onlyShopLikeCuisinesMatched =
    matchedCuisines.size > 0 && [...matchedCuisines].every((c) => SHOP_LIKE_CUISINES.has(c));
  if (onlyShopLikeCuisinesMatched && wantsProperMeal) {
    matchedCuisines.clear();
  }

  const isFoodQuestion = FOOD_TRIGGER.test(text) || matchedCuisines.size > 0;
  if (!isFoodQuestion) return [];

  let results = restaurants;
  if (matchedCuisines.size > 0) {
    results = results.filter((r) => r.cuisines.some((c) => matchedCuisines.has(c)));
  }

  // The reverse gap from the fix above: if the visitor wants a proper meal
  // ("restaurant", "lunch", or "dinner") and never mentioned a shop-like
  // cuisine themselves (cafe, bakery, mithai, street food), exclude
  // entries that are ONLY shop-like (e.g. a plain cafe with cuisines:
  // ['Cafe']) from the results. Without this, a highly-rated cafe can win
  // the broad top-rated fallback below and get shown for a plain "lunch"
  // or "restaurant" request — two real bugs users hit (asked for "lunch
  // in a restaurant," got a cafe; a plain "lunch"/"dinner" ask, same
  // issue, confirmed separately). A restaurant that merely also serves
  // something shop-like among other cuisines (e.g. Kiranshree Sweets:
  // North Indian/South Indian/.../Mithai) is untouched — only entries where
  // every listed cuisine is shop-like. An explicit cuisine mention always
  // wins regardless — "a nice cafe for lunch" still returns cafes, since
  // mentionedShopLikeCuisine is true in that case.
  if (wantsProperMeal && !mentionedShopLikeCuisine) {
    results = results.filter((r) => !r.cuisines.every((c) => SHOP_LIKE_CUISINES.has(c)));
  }

  if (budget) {
    results = results.filter(
      (r) => r.costForTwo != null && (!budget.min || r.costForTwo >= budget.min) && (!budget.max || r.costForTwo <= budget.max)
    );
  }
  if (matchedAreas.length > 0) {
    results = results.filter((r) => matchedAreas.some((area) => r.area.toLowerCase().includes(area.toLowerCase())));
  }

  // Sorting and capping every result (not just the broad/unfiltered case)
  // means a narrow match ("Chinese food near Six Mile", 1 result) is
  // unaffected, while a broad one ("cafes", ~27 matches) becomes a concise
  // top-10 "best of" list instead of either nothing or a huge unsorted wall.
  //
  // Real bug reported: "Chinese restaurant in Guwahati?" put Cafe Maya
  // first, purely because it has the highest rating (4.9) among Chinese-
  // tagged places — even though a visitor who explicitly said "restaurant"
  // pictures a sit-down restaurant, not a cafe that happens to also serve
  // Chinese food. First fixed by demoting shop-like places below
  // non-shop-like ones rather than excluding them, since a genuinely
  // cuisine-matched cafe was judged still worth showing, just lower.
  // Later revisited specifically for Cafe Maya and Kiranshree Sweets: on
  // reflection their "Chinese" tag didn't really belong (a cafe/mithai
  // shop with a couple of Chinese-inspired items isn't the same as an
  // actual Chinese restaurant), so that tag was removed from both
  // entries' data directly — they're now excluded from a "Chinese" match
  // entirely, upstream of this ranking step, not just demoted by it.
  // Cafe Maya was later removed from this file entirely (2026-09-09, per
  // direct request), after also being the trigger for a related bug: a
  // separate `wantsProperMeal` regex (used to exclude cafe-only entries
  // from a plain "restaurant"/"lunch"/"dinner" request, a few lines
  // below) hadn't been updated alongside FOOD_TRIGGER's misspelling
  // fixes earlier the same day, so cafes were leaking into a
  // misspelled "restaurents" request — fixed at the same time as the
  // removal. The demotion logic below still stands and still matters
  // for other cafes
  // with a genuinely-tagged real cuisine (e.g. Lush - The Café, Cafe
  // Aera, 11th Avenue Cafe Bistro all carry Continental/Italian/Asian
  // tags and should still rank below a real restaurant for those
  // cuisines, not be excluded outright). A visitor who explicitly asks
  // for a cafe/mithai/bakery/street food (mentionedShopLikeCuisine) is
  // unaffected — this only demotes, never promotes, and only when a
  // "proper meal" was asked for without asking for the shop-like thing
  // directly.
  const isShopLike = (r) => r.cuisines.some((c) => SHOP_LIKE_CUISINES.has(c));
  const sorted = [...results].sort((a, b) => {
    if (wantsProperMeal && !mentionedShopLikeCuisine) {
      const aShopLike = isShopLike(a);
      const bShopLike = isShopLike(b);
      if (aShopLike !== bShopLike) return aShopLike ? 1 : -1;
    }
    return b.rating - a.rating;
  });
  return sorted.slice(0, TOP_N);
}

module.exports = { restaurants, getRelevantRestaurants, parseBudgetSignal };
