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
