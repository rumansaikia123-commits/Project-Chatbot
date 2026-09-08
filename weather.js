// Guwahati's live weather, fetched from OpenWeatherMap's free "classic"
// Current Weather API — a private key tied to your own account (60
// calls/minute, 1,000,000/month, no credit card), not a shared
// anonymous IP pool. Switched from Open-Meteo (this app's original
// choice) after confirming live on Render that Open-Meteo's shared-IP
// free tier was getting rate-limited by other apps' traffic sharing
// that same IP, not this app's own light usage.
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

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// With a private key at 60 calls/minute, this app should never
// realistically hit a 429 — but the retry stays in as a cheap safety
// net, same shape as the Gemini 503 retry logic in server.js. A fresh
// AbortSignal.timeout per attempt, so an early attempt's timer can't
// prematurely abort a later retry.
async function fetchWeatherWithRetry(url, maxRetries = 2, delayMs = 1500) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.status !== 429 || attempt === maxRetries) return res;
    console.error(`Weather API rate-limited (attempt ${attempt + 1} of ${maxRetries + 1}) — retrying in ${delayMs}ms...`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

// Returns null when the message isn't a weather question at all (the
// normal "empty" case, same as every other category). Returns
// { error: true } specifically when it WAS a weather question but the
// live fetch failed — so the system prompt can tell Gemini to say so
// honestly instead of guessing a plausible-sounding temperature.
async function getRelevantWeather(message) {
  const text = message.toLowerCase();
  if (!WEATHER_TRIGGER.test(text)) return null;

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error('Weather fetch failed: OPENWEATHER_API_KEY is not set');
    return { error: true };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${GUWAHATI_LAT}&lon=${GUWAHATI_LON}&appid=${apiKey}&units=metric`;
    const res = await fetchWeatherWithRetry(url);
    if (!res.ok) {
      if (res.status === 401) {
        // The single most common reason for this specific code: a
        // brand-new key that hasn't finished activating yet (can take
        // up to ~2 hours after signup) — worth distinguishing from a
        // genuinely wrong key so it's not mistaken for a typo.
        console.error('Weather fetch failed: HTTP 401 Unauthorized — key may still be activating (can take up to ~2 hours after signup) or is incorrect');
      } else {
        console.error(`Weather fetch failed: HTTP ${res.status} ${res.statusText}`);
      }
      return { error: true };
    }

    const data = await res.json();
    return {
      temperatureC: data.main.temp,
      humidityPercent: data.main.humidity,
      // OpenWeatherMap's "metric" units return wind speed in m/s, not
      // kph — converted here (× 3.6) so the field name stays accurate.
      windKph: Math.round(data.wind.speed * 3.6 * 10) / 10,
      condition: capitalize(data.weather[0].description),
    };
  } catch (error) {
    // Network hiccup or timeout — never let a live-data failure crash
    // or block the rest of the reply. Logged (not swallowed silently)
    // so a real, persistent failure is visible in the hosting
    // platform's own logs.
    console.error('Weather fetch failed:', error.message || error);
    return { error: true };
  }
}

module.exports = { getRelevantWeather };
