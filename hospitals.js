// A hand-verified directory of Guwahati hospitals, transcribed from a
// "Guwahati Hospitals" research document (30 hospitals, September 2026).
// Same "mini RAG" idea as every other category file: getRelevantHospitals()
// below only returns the entries that actually match what the visitor
// asked about.
//
// This is the first category in the app where a wrong or overconfident
// answer carries real safety stakes, not just inconvenience — three
// things follow from that, agreed with the person running this chatbot
// before any of this was built:
//   1. The system prompt always includes a brief "call 108 for a genuine
//      emergency" line whenever hospital data is part of a reply — never
//      just a hospital name/address as if that's a complete answer.
//   2. The source document's own honesty distinction between plain
//      "24×7", "24×7 listed" (found listed, not independently verified),
//      and "Verify"/"Verify clinical hours" (genuinely unconfirmed) is
//      kept as real, distinct data — never collapsed into one confident
//      "open 24/7" fact.
//   3. Matching is a pure directory lookup on a hospital's own specialty
//      words ("cardiology", "eye hospital") — deliberately NEVER on a
//      described symptom ("chest pain"), which would edge into medical
//      triage. This app does not diagnose or triage.
//
// `specialties` holds only the REAL matchable specialty words hand-
// extracted from each hospital's own "Key Specialities" text — generic
// filler in that source text ("35 departments", "multispeciality",
// "newer tertiary facility") is never turned into a fake matchable tag;
// it stays in `highlight` (close to verbatim) for context only.
//
// `ownership` is genuinely null for 4 entries (Sri Sankaradeva
// Nethralaya, Pragjyoti Eye Care, Institute of Human Reproduction, ASG
// Eye Hospital) — the source's own "Type" column never states
// Private/Government for these, unlike every other row, so it's left
// unknown rather than assumed.
//
// No day/order fields — going to a hospital isn't a leisure itinerary
// stop, same reasoning already applied to accommodations.js/transport.js.
const hospitals = [
  { name: 'Gauhati Medical College & Hospital (GMCH)', area: 'Bhangagarh',
    ownership: 'Government', tier: 'tertiary-referral', typeDescription: 'Government Teaching / Tertiary',
    emergency: '24x7', specialties: ['trauma', 'critical-care'],
    highlight: 'Broad tertiary care across 35 departments and 12 super-specialties; trauma; critical care.' },

  { name: 'Narayana Hospital, Guwahati', area: 'Amingaon',
    ownership: 'Private', tier: 'tertiary-super-speciality', typeDescription: 'Private Tertiary / Super-Speciality',
    emergency: '24x7', specialties: ['cardiac', 'oncology', 'neuro', 'gastro', 'orthopaedics', 'critical-care'],
    highlight: 'Cardiac; oncology; neurosciences; gastro; orthopaedics; critical care.' },

  { name: 'Apollo Hospitals, Guwahati', area: 'Christian Basti / GS Road',
    ownership: 'Private', tier: 'tertiary-super-speciality', typeDescription: 'Private Tertiary / Multispeciality',
    emergency: '24x7', specialties: ['cardiac', 'oncology', 'neuro', 'nephrology', 'gastro', 'orthopaedics', 'urology', 'transplant', 'critical-care'],
    highlight: 'Cardiac; oncology; neurology; nephrology; gastro; orthopaedics; urology; transplants; critical care.' },

  { name: 'Apollo Excelcare Hospital', area: 'Paschim Boragaon',
    ownership: 'Private', tier: 'tertiary-super-speciality', typeDescription: 'Private Tertiary / Multispeciality',
    emergency: '24x7', specialties: ['cardiac', 'oncology', 'neuro', 'nephrology', 'gastro', 'urology', 'orthopaedics', 'transplant', 'critical-care'],
    highlight: 'Cardiac; oncology; neurology; nephrology; gastro; urology; orthopaedics; transplants; critical care.' },

  { name: 'GNRC Hospitals – Dispur Unit', area: 'Dispur',
    ownership: 'Private', tier: 'tertiary-super-speciality', typeDescription: 'Private Super-Speciality / Neuroscience-led',
    emergency: '24x7', specialties: ['neuro', 'stroke', 'trauma', 'emergency'],
    highlight: 'Neurosciences; stroke; trauma; emergency; multispeciality — a neuroscience-led super-speciality unit.' },

  { name: 'GNRC Medical – North Guwahati', area: 'Amingaon',
    ownership: 'Private', tier: 'tertiary-super-speciality', typeDescription: 'Private Tertiary / Multispeciality',
    emergency: '24x7', specialties: ['neuro', 'emergency'],
    highlight: 'Neurosciences; emergency; multispeciality.' },

  { name: 'Nemcare Hospital', area: 'Bhangagarh',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Multispeciality / Tertiary',
    emergency: '24x7', specialties: ['cardiac', 'neuro', 'oncology', 'gastro', 'surgery', 'paediatrics', 'critical-care'],
    highlight: 'Cardiology/CTVS; neuroscience; oncology; GI; surgery; paediatrics; critical care.' },

  { name: 'Ayursundra Superspecialty Hospital', area: 'Ahom Gaon / Garchuk',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Super-Speciality',
    emergency: '24x7', specialties: ['cardiac', 'neuro', 'gastro', 'oncology', 'orthopaedics', 'women-child'],
    highlight: 'Cardiology/CTVS; neuro; GI; oncology; orthopaedics; women/child.' },

  { name: 'Hayat Hospital', area: 'Lal Ganesh / Odalbakra',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Multispeciality',
    emergency: '24x7', specialties: ['emergency', 'critical-care', 'surgery'],
    highlight: 'Multispeciality care; emergency; critical care; surgery; medicine.' },

  { name: 'Down Town Hospital', area: 'GS Road / Bormotoria',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Multispeciality',
    emergency: '24x7', specialties: ['surgery', 'gastro', 'nephrology', 'orthopaedics', 'diabetes'],
    highlight: 'Medicine; surgery; gastro; nephrology; orthopaedics; diabetes.' },

  { name: 'Medicity Guwahati Super Speciality Hospital', area: 'Sarumotoria / GS Road',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Super-Speciality',
    emergency: '24x7', specialties: [],
    highlight: 'Super-speciality services; a newer tertiary facility — exact department mix not itemised in the source.' },

  { name: 'Health City Hospital', area: 'Khanapara',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Multispeciality',
    emergency: '24x7', specialties: ['surgery', 'critical-care'],
    highlight: 'Multispeciality care; surgical/medical care; critical care.' },

  { name: 'Guwahati Metro Hospital', area: 'Khanapara',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Multispeciality',
    emergency: '24x7', specialties: [],
    highlight: 'General multispeciality hospital.' },

  { name: 'KGMT Multispeciality Hospital', area: 'Hatigarh',
    ownership: 'Private', tier: 'tertiary-multispeciality', typeDescription: 'Private Multispeciality',
    emergency: '24x7', specialties: [],
    highlight: 'General multispeciality hospital.' },

  { name: 'Arya Hospital', area: 'Rehabari',
    ownership: 'Private', tier: 'general-multispeciality', typeDescription: 'Private Multispeciality / General',
    emergency: '24x7', specialties: ['emergency'],
    highlight: 'General hospital; emergency care; laboratory services.' },

  { name: 'Dispur Hospital', area: 'Ganeshguri / Dispur',
    ownership: 'Private', tier: 'general-multispeciality', typeDescription: 'Private Multispeciality',
    emergency: '24x7', specialties: ['surgery'],
    highlight: 'General multispeciality and surgical care.' },

  { name: 'Pratiksha Hospital', area: 'Borbari / VIP Road',
    ownership: 'Private', tier: 'women-child', typeDescription: 'Private Super-Speciality; Women & Child',
    emergency: '24x7', specialties: ['fertility', 'women-child', 'paediatrics', 'orthopaedics', 'ent', 'oncology'],
    highlight: 'IVF; obstetrics/gynaecology; fetal medicine; paediatrics/neonatology; orthopaedics; ENT; oncology.' },

  { name: 'Neotia Bhagirathi Woman & Child Care Centre', area: 'Beltola',
    ownership: null, tier: 'women-child', typeDescription: 'Super-Speciality Women & Child',
    emergency: '24x7', specialties: ['women-child', 'paediatrics'],
    highlight: 'Women and child healthcare; obstetrics/gynaecology; paediatrics/neonatology.' },

  { name: 'North East Cancer Hospital & Research Institute', area: 'Amerigog / Jorabat',
    ownership: 'Private', tier: 'cancer-specialty', typeDescription: 'Private Cancer Specialty',
    emergency: '24x7-listed', specialties: ['oncology'],
    highlight: 'Cancer diagnosis and treatment; oncology-focused.' },

  { name: 'Sri Sankaradeva Nethralaya', area: 'Beltola',
    ownership: null, tier: 'eye-specialty', typeDescription: 'Specialist Eye Hospital',
    emergency: 'verify-clinical-hours', specialties: ['eye'],
    highlight: 'Ophthalmology; eye surgery; eye diagnostics.' },

  { name: 'Pragjyoti Eye Care & Research Centre', area: 'Hatigarh / Zoo-Narengi',
    ownership: null, tier: 'eye-specialty', typeDescription: 'Specialist Eye Hospital',
    emergency: 'verify', specialties: ['eye'],
    highlight: 'Eye care and ophthalmic treatment.' },

  { name: 'Orion Hospitals – Multispeciality & Advanced Urology Centre', area: 'Six Mile',
    ownership: 'Private', tier: 'urology-specialty', typeDescription: 'Private Multispeciality / Urology',
    emergency: '24x7-listed', specialties: ['urology'],
    highlight: 'Advanced urology; multispeciality care.' },

  { name: 'Institute of Human Reproduction (Goenka Nursing Home)', area: 'Santipur / Bharalumukh',
    ownership: null, tier: 'fertility-specialty', typeDescription: 'Fertility / Reproductive Medicine',
    emergency: 'verify', specialties: ['fertility'],
    highlight: 'IVF and reproductive medicine.' },

  { name: 'Marwari Hospitals', area: 'Athgaon',
    ownership: 'Private/Charitable', tier: 'general-institutional', typeDescription: 'Private / Charitable General',
    emergency: '24x7', specialties: [],
    highlight: 'General hospital and medical care.' },

  { name: 'Swagat Super Speciality Surgical Institute & Hospital', area: 'Maligaon',
    ownership: 'Private', tier: 'surgical-specialty', typeDescription: 'Private Surgical / Multispeciality',
    emergency: 'verify', specialties: ['surgery'],
    highlight: 'Surgical care; super-speciality surgical services.' },

  { name: 'Gate Hospital', area: 'Noonmati / Mathgharia',
    ownership: 'Private', tier: 'general-institutional', typeDescription: 'Private Hospital',
    emergency: '24x7-listed', specialties: [],
    highlight: 'General hospital services.' },

  { name: 'Agile Hospitals', area: 'Jayanagar / Beltola',
    ownership: 'Private', tier: 'general-institutional', typeDescription: 'Private General / Multispeciality',
    emergency: '24x7', specialties: [],
    highlight: 'General hospital services.' },

  { name: 'Mirza Multispeciality Hospital', area: 'Borjhar / Airport-side',
    ownership: 'Private', tier: 'general-institutional', typeDescription: 'Private Multispeciality',
    emergency: '24x7-listed', specialties: [],
    highlight: 'Multispeciality hospital.' },

  { name: 'Dreams Superspeciality Hospital', area: 'Beltola Tiniali',
    ownership: 'Private', tier: 'general-institutional', typeDescription: 'Private Super-Speciality',
    emergency: '24x7-listed', specialties: [],
    highlight: 'Super-speciality hospital — its exact service mix is not itemised in the source, so verify before relying on a specific department.' },

  { name: 'ASG Eye Hospital – Guwahati', area: 'GS Road / Downtown',
    ownership: null, tier: 'general-institutional', typeDescription: 'Specialist Eye Hospital',
    emergency: 'verify', specialties: ['eye'],
    highlight: 'Ophthalmology and eye surgery.' },
];

const NAME_KEYWORDS = [
  { pattern: /\bgmch\b|gauhati\s?medical\s?college/, name: 'Gauhati Medical College & Hospital (GMCH)' },
  { pattern: /narayana/, name: 'Narayana Hospital, Guwahati' },
  { pattern: /apollo\s?excelcare/, name: 'Apollo Excelcare Hospital' },
  { pattern: /apollo\s?hospitals?/, name: 'Apollo Hospitals, Guwahati' },
  { pattern: /gnrc.{0,15}dispur|dispur.{0,15}gnrc/, name: 'GNRC Hospitals – Dispur Unit' },
  { pattern: /gnrc.{0,20}north\s?guwahati|gnrc\s?medical/, name: 'GNRC Medical – North Guwahati' },
  { pattern: /nemcare/, name: 'Nemcare Hospital' },
  { pattern: /ayursundra/, name: 'Ayursundra Superspecialty Hospital' },
  { pattern: /hayat\s?hospital/, name: 'Hayat Hospital' },
  { pattern: /down\s?town\s?hospital/, name: 'Down Town Hospital' },
  { pattern: /medicity/, name: 'Medicity Guwahati Super Speciality Hospital' },
  { pattern: /health\s?city/, name: 'Health City Hospital' },
  { pattern: /guwahati\s?metro\s?hospital/, name: 'Guwahati Metro Hospital' },
  { pattern: /kgmt/, name: 'KGMT Multispeciality Hospital' },
  { pattern: /arya\s?hospital/, name: 'Arya Hospital' },
  { pattern: /dispur\s?hospital/, name: 'Dispur Hospital' },
  { pattern: /pratiksha/, name: 'Pratiksha Hospital' },
  { pattern: /neotia|bhagirathi/, name: 'Neotia Bhagirathi Woman & Child Care Centre' },
  { pattern: /north\s?east\s?cancer/, name: 'North East Cancer Hospital & Research Institute' },
  { pattern: /sankaradeva\s?nethralaya|sri\s?sankaradeva/, name: 'Sri Sankaradeva Nethralaya' },
  { pattern: /pragjyoti/, name: 'Pragjyoti Eye Care & Research Centre' },
  { pattern: /orion\s?hospitals?/, name: 'Orion Hospitals – Multispeciality & Advanced Urology Centre' },
  { pattern: /human\s?reproduction|goenka\s?nursing/, name: 'Institute of Human Reproduction (Goenka Nursing Home)' },
  { pattern: /marwari\s?hospitals?/, name: 'Marwari Hospitals' },
  { pattern: /swagat\s?super\s?speciality/, name: 'Swagat Super Speciality Surgical Institute & Hospital' },
  { pattern: /gate\s?hospital/, name: 'Gate Hospital' },
  { pattern: /agile\s?hospitals?/, name: 'Agile Hospitals' },
  { pattern: /mirza\s?multispeciality/, name: 'Mirza Multispeciality Hospital' },
  { pattern: /dreams\s?superspeciality/, name: 'Dreams Superspeciality Hospital' },
  { pattern: /asg\s?eye/, name: 'ASG Eye Hospital – Guwahati' },
];

const AREA_KEYWORDS = [
  { pattern: /bhangagarh/, area: 'Bhangagarh' },
  { pattern: /amingaon/, area: 'Amingaon' },
  { pattern: /christian\s?basti/, area: 'Christian Basti' },
  { pattern: /gs\s?road/, area: 'GS Road' },
  { pattern: /paschim\s?boragaon|boragaon/, area: 'Paschim Boragaon' },
  { pattern: /\bdispur\b/, area: 'Dispur' },
  { pattern: /ahom\s?gaon|garchuk/, area: 'Ahom Gaon' },
  { pattern: /lal\s?ganesh|odalbakra/, area: 'Lal Ganesh' },
  { pattern: /bormotoria/, area: 'Bormotoria' },
  { pattern: /sarumotoria/, area: 'Sarumotoria' },
  { pattern: /khanapara/, area: 'Khanapara' },
  { pattern: /hatigarh/, area: 'Hatigarh' },
  { pattern: /rehabari/, area: 'Rehabari' },
  { pattern: /ganeshguri/, area: 'Ganeshguri' },
  { pattern: /borbari|vip\s?road/, area: 'Borbari' },
  { pattern: /beltola\s?tiniali/, area: 'Beltola Tiniali' },
  { pattern: /\bbeltola\b/, area: 'Beltola' },
  { pattern: /amerigog|jorabat/, area: 'Jorabat' },
  { pattern: /zoo.narengi/, area: 'Zoo-Narengi' },
  { pattern: /six\s?mile/, area: 'Six Mile' },
  { pattern: /santipur|bharalumukh/, area: 'Bharalumukh' },
  { pattern: /athgaon/, area: 'Athgaon' },
  { pattern: /maligaon/, area: 'Maligaon' },
  { pattern: /noonmati|mathgharia/, area: 'Noonmati' },
  { pattern: /jayanagar/, area: 'Jayanagar' },
  { pattern: /borjhar|airport.side/, area: 'Borjhar' },
  { pattern: /downtown/, area: 'Downtown' },
];

// Deliberately specialty-vocabulary only — real department/specialty
// words a visitor might name directly ("cardiology", "eye hospital").
// Never symptom words ("chest pain", "can't breathe") — that would edge
// toward inferring a diagnosis, which this app must never do. Confirmed
// explicitly with the person running this chatbot before building this.
const SPECIALTY_KEYWORDS = [
  { pattern: /cardiac|cardiology|\bheart\b|\bctvs\b/, specialty: 'cardiac' },
  { pattern: /\bcancer\b|oncolog/, specialty: 'oncology' },
  { pattern: /\bneuro/, specialty: 'neuro' },
  { pattern: /\bstroke\b/, specialty: 'stroke' },
  { pattern: /gastro|\bgi\b|digestive|stomach/, specialty: 'gastro' },
  { pattern: /orthop(a)?edic/, specialty: 'orthopaedics' },
  { pattern: /urolog/, specialty: 'urology' },
  { pattern: /nephrolog|\bkidney\b/, specialty: 'nephrology' },
  { pattern: /transplant/, specialty: 'transplant' },
  { pattern: /\btrauma\b/, specialty: 'trauma' },
  { pattern: /\bemergency\b|\ber\b|casualty/, specialty: 'emergency' },
  { pattern: /paediatric|pediatric|\bchild(ren)?\b/, specialty: 'paediatrics' },
  { pattern: /obstetric|gynaecolog|gynecolog|maternity|pregnan|\bwomen\b/, specialty: 'women-child' },
  { pattern: /fertility|\bivf\b|reproductive/, specialty: 'fertility' },
  { pattern: /\beye\b|ophthalmolog|\bvision\b/, specialty: 'eye' },
  { pattern: /\bent\b|ear.nose.throat/, specialty: 'ent' },
  { pattern: /surger(y|ies)|surgical/, specialty: 'surgery' },
  { pattern: /diabet/, specialty: 'diabetes' },
  { pattern: /critical\s?care|\bicu\b|intensive\s?care/, specialty: 'critical-care' },
];

const HOSPITAL_TRIGGER = /\bhospitals?\b|\bclinics?\b|\bmedical\s?(centre|center)\b|\bdoctors?\b/;

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

// A named hospital always narrows. Otherwise area and specialty
// AND-combine, same model as restaurants.js's cuisine+area matching. A
// genuinely vague "hospitals in Guwahati"/"which hospital should I go
// to" falls back to the tertiary-referral + tertiary-super-speciality
// tier — the natural "most broadly capable" answer for an unqualified
// question, the same fallback role Tier 1 plays in temples.js.
function getRelevantHospitals(message) {
  const text = message.toLowerCase();
  const matchedNames = matchKeywords(text, NAME_KEYWORDS, 'name');
  const matchedAreas = matchKeywords(text, AREA_KEYWORDS, 'area');
  const matchedSpecialties = matchKeywordSet(text, SPECIALTY_KEYWORDS, 'specialty');

  const isHospitalQuestion =
    HOSPITAL_TRIGGER.test(text) || matchedNames.length > 0 || matchedAreas.length > 0 || matchedSpecialties.size > 0;
  if (!isHospitalQuestion) return [];

  if (matchedNames.length > 0) {
    return hospitals.filter((h) => matchedNames.includes(h.name));
  }

  let results = hospitals;
  let filterApplied = false;
  if (matchedSpecialties.size > 0) {
    results = results.filter((h) => h.specialties.some((s) => matchedSpecialties.has(s)));
    filterApplied = true;
  }
  if (matchedAreas.length > 0) {
    results = results.filter((h) => matchedAreas.some((area) => h.area.toLowerCase().includes(area.toLowerCase())));
    filterApplied = true;
  }

  if (!filterApplied) {
    return hospitals.filter((h) => h.tier === 'tertiary-referral' || h.tier === 'tertiary-super-speciality');
  }
  return results;
}

module.exports = { hospitals, getRelevantHospitals };
