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

// Which property holds a card's row of labels (cuisines/tags/activities/
// themes) differs per category — figured out from whichever one is
// actually present, the same way the meta-row below already tells card
// types apart by field presence ('deity' in rec, 'entryFee' in rec).
function getTagField(rec) {
  if ('cuisines' in rec) return 'cuisines';
  if ('tags' in rec) return 'tags';
  if ('activities' in rec) return 'activities';
  if ('themes' in rec) return 'themes';
  return null;
}

// Builds one visual "card" per recommendation (restaurant, nightlife
// venue, park, or temple), using the structured data the server now sends
// (name/area/etc. as real fields, not text to parse). Everything here uses
// createElement + textContent rather than innerHTML, so even though this
// data ultimately passed through the AI, it can never be interpreted as
// HTML — same safety idea as formatBotReply's escaping, just done a
// different way since we're building real elements instead of one string.
//
// Takes a plain list of recommendations — possibly mixed categories, e.g.
// a temple and its nearby restaurant for the same itinerary day — and
// figures out each item's card layout and tag field individually, so one
// function draws every kind of card instead of near-identical versions of
// each.
//
// Parks don't have a rating or a per-two cost the way restaurants/venues
// do (source data has no star rating, and entry fees are descriptive text
// like "₹60, free 5-10 AM" rather than a clean number) — recognized by the
// presence of `entryFee`, and shown as an entry-fee + days-off row instead
// of the usual rating + cost row.
function addRecommendationCards(recommendations) {
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

    if ('bestFor' in rec) {
      const bestFor = document.createElement('span');
      bestFor.className = 'rec-rating';
      bestFor.textContent = rec.bestFor;
      meta.appendChild(bestFor);

      if (rec.tip) {
        const tip = document.createElement('span');
        tip.className = 'rec-cost';
        tip.textContent = rec.tip;
        meta.appendChild(tip);
      }
    } else if ('deity' in rec) {
      const deity = document.createElement('span');
      deity.className = 'rec-rating';
      deity.textContent = rec.deity;
      meta.appendChild(deity);

      if (rec.timings) {
        const timings = document.createElement('span');
        timings.className = 'rec-cost';
        timings.textContent = rec.timings;
        meta.appendChild(timings);
      }

      if (rec.dressCode) {
        const dressCode = document.createElement('span');
        dressCode.className = 'rec-cost';
        dressCode.textContent = rec.dressCode;
        meta.appendChild(dressCode);
      }
    } else if ('entryFee' in rec) {
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

    const tagField = getTagField(rec);
    const tags = tagField ? rec[tagField] : null;
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

function addDayHeading(day) {
  const heading = document.createElement('div');
  heading.className = 'day-heading';
  heading.textContent = `Day ${day}`;
  messagesEl.appendChild(heading);
}

// Renders every recommendation the server returned. Most questions aren't
// itineraries, so the common path is unchanged: separate card groups per
// category, each visually clustered on its own — this keeps a compound
// question like "restaurants and bars in Guwahati" showing two clearly
// distinct clusters instead of one undifferentiated list.
//
// The trigger for the sequenced path is `order`, not `day` — a real
// transcript showed Gemini tagging a genuinely sequential single-day plan
// (temple -> lunch -> film -> night out) with real `order` values (1, 2,
// 3, 4) but leaving `day` null, since the day-tagging rule only strictly
// requires a 2+ day itinerary. Keying off `day` alone meant that case fell
// through to the plain category-clustered path and still showed a later
// activity's card (the night out) before an earlier one's (the film).
// Keying off `order` instead means the sequence renders correctly whether
// or not a day number happens to be present.
function renderRecommendations(data) {
  // Temple first so it visually anchors that day's food picks, the way a
  // real itinerary reads ("visit the temple, then eat nearby").
  const categories = [
    data.templeRecommendations,
    data.restaurantRecommendations,
    data.nightlifeRecommendations,
    data.parkRecommendations,
    data.cinemaRecommendations,
    data.shopRecommendations,
  ];
  const all = categories.flat();
  const hasSequence = all.some((rec) => rec.order != null);

  if (!hasSequence) {
    for (const recommendations of categories) {
      addRecommendationCards(recommendations);
    }
    return;
  }

  const byOrder = (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity);
  const hasDays = all.some((rec) => rec.day != null);

  if (!hasDays) {
    // A real sequence exists, but it's a single day with no day number —
    // one flat list of cards, correctly ordered, no "Day N" heading.
    addRecommendationCards([...all].sort(byOrder));
    return;
  }

  const days = [...new Set(all.filter((rec) => rec.day != null).map((rec) => rec.day))].sort((a, b) => a - b);
  for (const day of days) {
    addDayHeading(day);
    addRecommendationCards(all.filter((rec) => rec.day === day).sort(byOrder));
  }

  // Safety net: anything left untagged (shouldn't normally happen once the
  // model commits to itinerary mode) still gets shown, just without a day heading.
  const untagged = all.filter((rec) => rec.day == null);
  if (untagged.length > 0) addRecommendationCards(untagged.sort(byOrder));
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
    renderRecommendations(data);
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
