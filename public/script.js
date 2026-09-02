// This runs in the visitor's browser. It handles:
// - remembering the conversation while the tab is open
// - sending messages to our backend server
// - displaying replies

const messagesEl = document.getElementById('messages');
const formEl = document.getElementById('chat-form');
const inputEl = document.getElementById('chat-input');

// The full conversation so far, kept only in this browser tab's memory.
// This is what lets the chatbot "remember" earlier messages, e.g. "what about day 2".
const conversation = [];

// Escapes any HTML in the AI's reply first (so it can never inject real tags),
// then turns the now-safe text's basic markdown (headings, bullet lists, bold)
// into real formatting. Because escaping always runs first, none of this can
// be used to sneak in HTML — only the specific tags added below ever appear.
function formatBotReply(text) {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    // "### Heading" -> bold line (a full heading style would look too heavy inside a small chat bubble)
    .replace(/^#{1,6}\s+(.+)$/gm, '<strong>$1</strong>')
    // "* item" or "- item" at the start of a line -> a real bullet character
    .replace(/^[*-]\s+/gm, '• ')
    // "**bold**" -> actual bold text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function addMessageToPage(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `message ${sender}`;

  if (sender === 'bot') {
    bubble.innerHTML = formatBotReply(text);
  } else {
    bubble.textContent = text;
  }

  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

// Builds one visual "card" per recommendation (restaurant, nightlife
// venue, or park), using the structured data the server now sends (name/
// area/etc. as real fields, not text to parse). Everything here uses
// createElement + textContent rather than innerHTML, so even though this
// data ultimately passed through the AI, it can never be interpreted as
// HTML — same safety idea as formatBotReply's escaping, just done a
// different way since we're building real elements instead of one string.
//
// Shared between restaurants (field "cuisines"), nightlife venues (field
// "tags"), and parks (field "activities") — `tagField` says which
// property to read for that row of labels, so one function draws all
// three kinds of card instead of writing near-identical versions of each.
//
// Parks don't have a rating or a per-two cost the way restaurants/venues
// do (source data has no star rating, and entry fees are descriptive text
// like "₹60, free 5-10 AM" rather than a clean number) — recognized by the
// presence of `entryFee`, and shown as an entry-fee + days-off row instead
// of the usual rating + cost row.
function addRecommendationCards(recommendations, tagField) {
  if (!recommendations || recommendations.length === 0) return;

  const container = document.createElement('div');
  container.className = 'recommendation-cards';

  for (const rec of recommendations) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';

    const name = document.createElement('div');
    name.className = 'rec-name';
    name.textContent = rec.name;
    card.appendChild(name);

    const meta = document.createElement('div');
    meta.className = 'rec-meta';

    if ('entryFee' in rec) {
      const entryFee = document.createElement('span');
      entryFee.className = 'rec-cost';
      entryFee.textContent = rec.entryFee;
      meta.appendChild(entryFee);

      const daysOff = document.createElement('span');
      daysOff.className = 'rec-cost';
      daysOff.textContent = rec.daysOff === 'None' ? 'open daily' : `closed ${rec.daysOff}`;
      meta.appendChild(daysOff);
    } else {
      const rating = document.createElement('span');
      rating.className = 'rec-rating';
      rating.textContent = rec.rating != null ? `★ ${rec.rating}` : 'unrated';
      meta.appendChild(rating);

      const cost = document.createElement('span');
      cost.className = 'rec-cost';
      cost.textContent = rec.costForTwo != null ? `~₹${rec.costForTwo} for two` : 'price not listed';
      meta.appendChild(cost);
    }

    card.appendChild(meta);

    const area = document.createElement('div');
    area.className = 'rec-area';
    area.textContent = rec.area;
    card.appendChild(area);

    const tags = rec[tagField];
    if (tags && tags.length > 0) {
      const tagsEl = document.createElement('div');
      tagsEl.className = 'rec-cuisines';
      tagsEl.textContent = tags.join(', ');
      card.appendChild(tagsEl);
    }

    if (rec.highlight) {
      const highlight = document.createElement('div');
      highlight.className = 'rec-highlight';
      highlight.textContent = rec.highlight;
      card.appendChild(highlight);
    }

    container.appendChild(card);
  }

  messagesEl.appendChild(container);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault(); // stops the page from reloading, which is the browser's default for forms

  const userText = inputEl.value.trim();
  if (!userText) return;

  // Show the visitor's own message immediately
  addMessageToPage(userText, 'user');
  conversation.push({ role: 'user', content: userText });

  inputEl.value = '';
  inputEl.disabled = true;

  // Show a temporary "thinking" bubble while we wait for Claude's reply
  const thinkingBubble = addMessageToPage('Thinking...', 'bot thinking');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: conversation }),
    });

    if (!response.ok) {
      throw new Error('Server error');
    }

    const data = await response.json();

    thinkingBubble.remove();
    addMessageToPage(data.reply, 'bot');
    addRecommendationCards(data.restaurantRecommendations, 'cuisines');
    addRecommendationCards(data.nightlifeRecommendations, 'tags');
    addRecommendationCards(data.parkRecommendations, 'activities');
    conversation.push({ role: 'assistant', content: data.reply });
  } catch (error) {
    thinkingBubble.remove();
    addMessageToPage('Sorry, something went wrong. Please try again.', 'bot');
    console.error(error);
  } finally {
    inputEl.disabled = false;
    inputEl.focus();
  }
});
