// This is the chatbot's backend server.
// It runs privately (never seen by visitors) and does one job:
// receive a message from the webpage, ask Gemini for a reply, send that reply back.

require('dotenv').config(); // loads secret values from .env into process.env

const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const buildSystemPrompt = require('./systemPrompt');
const { getRelevantVenues } = require('./venues');
const { getRelevantRestaurants } = require('./restaurants');

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

    // Look at everything the visitor has said so far (not just their latest
    // message) for nightlife/food keywords. A single message is too narrow:
    // once someone asks "where's good coffee" and the bot asks a follow-up
    // question, their next reply is often something short like "any area" or
    // "give me a list" — which mentions no food words at all. Checking only
    // that latest message would wrongly conclude the topic isn't food-related
    // anymore and drop the real data, even though the conversation clearly
    // hasn't moved on.
    const allVisitorText = messages
      .filter((message) => message.role !== 'assistant')
      .map((message) => message.content)
      .join(' ');
    const relevantVenues = getRelevantVenues(allVisitorText);
    const relevantRestaurants = getRelevantRestaurants(allVisitorText);

    const response = await ai.models.generateContent({
      // gemini-3.6-flash does an invisible "thinking" step that was eating
      // almost the entire maxOutputTokens budget, cutting real replies short.
      // flash-lite skips that step, and its free tier allows far more
      // requests per day, which matters for an app real people will use.
      model: 'gemini-3.5-flash-lite',
      contents,
      config: {
        systemInstruction: buildSystemPrompt(todayInIndia, relevantVenues, relevantRestaurants),
        maxOutputTokens: 2048,
        // Without this, the model's default randomness made it ignore real,
        // correctly-provided venue/restaurant data surprisingly often —
        // e.g. claiming "no bars on hand" despite 15 being listed right in
        // its own instructions. Confirmed via repeated side-by-side testing:
        // near-total failure at the default temperature, 5/5 correct at 0.2.
        // Lower temperature makes replies a little more uniform in phrasing,
        // but that's a small trade for actually using the data it's given.
        temperature: 0.2,
      },
    });

    res.json({ reply: response.text });
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
