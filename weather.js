// Guwahati's live weather, fetched from Open-Meteo — a free weather API
// that needs no signup, no API key, and no credit card (unlike Google
// Maps, which requires a card on file even for its free tier). This is
// this app's first genuinely LIVE data source: every other category
// (temples, restaurants, transport, etc.) is a hand-verified static
// file; this one calls a real API at the moment a visitor asks.
//
// Same "only compute what's relevant" shape as every other category's
// getRelevantX() function, except async, since it makes a real network
// call instead of filtering a local array.

const GUWAHATI_LAT = 26.1445;
const GUWAHATI_LON = 91.7362;

// A visitor asking about weather, temperature, rain, heat, cold, or a
// forecast is the trigger — same shape as every other category's
// keyword trigger.
const WEATHER_TRIGGER = /\bweather\b|\btemperature\b|\braining\b|\brain\b|\bforecast\b|\bhow\s?hot\b|\bhow\s?cold\b|\bclimate\b/;

// Hand-verified against Open-Meteo's own WMO weather-code documentation
// (open-meteo.com/en/docs) — never guessed. A code not listed here
// falls back to a generic, honest description rather than a wrong
// specific one.
const WEATHER_CODE_DESCRIPTIONS = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Icy fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Heavy drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  80: 'Rain showers',
  81: 'Moderate showers',
  82: 'Heavy showers',
  95: 'Thunderstorm',
};

// Returns null when the message isn't a weather question at all (the
// normal "empty" case, same as every other category). Returns
// { error: true } specifically when it WAS a weather question but the
// live fetch failed — so the system prompt can tell Gemini to say so
// honestly instead of guessing a plausible-sounding temperature.
async function getRelevantWeather(message) {
  const text = message.toLowerCase();
  if (!WEATHER_TRIGGER.test(text)) return null;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${GUWAHATI_LAT}&longitude=${GUWAHATI_LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return { error: true };

    const data = await res.json();
    return {
      temperatureC: data.current.temperature_2m,
      humidityPercent: data.current.relative_humidity_2m,
      windKph: data.current.wind_speed_10m,
      condition: WEATHER_CODE_DESCRIPTIONS[data.current.weather_code] || 'Changeable conditions',
    };
  } catch {
    // Network hiccup or timeout — never let a live-data failure crash
    // or block the rest of the reply.
    return { error: true };
  }
}

module.exports = { getRelevantWeather };
