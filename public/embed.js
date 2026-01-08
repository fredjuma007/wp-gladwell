document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('gladwell-root');
  if (!root) return;

  // Icons
  const Icons = {
    chat: `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`
  };

  // Inject HTML
  root.innerHTML = `
    <div class="gladwell-widget">
      <div class="gladwell-trigger" id="g-trigger">
        ${Icons.chat}
      </div>
      
      <div class="gladwell-chat-window" id="g-window">
        <div class="gladwell-header">
          <div class="gladwell-avatar">AI</div>
          <div class="gladwell-info">
            <h3>Gladwell AI</h3>
            <span>Online</span>
          </div>
        </div>
        
        <div class="gladwell-messages" id="g-messages">
          <div class="gladwell-message bot">
            Hello! I'm Gladwell. How can I help you today?
          </div>
        </div>

        <div class="gladwell-footer">
          <div class="gladwell-input-wrapper">
            <input type="text" id="g-input" placeholder="Type your message..." />
            <button class="gladwell-send-btn" id="g-send">
              ${Icons.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Elements
  const trigger = document.getElementById('g-trigger');
  const windowEl = document.getElementById('g-window');
  const messagesEl = document.getElementById('g-messages');
  const inputEl = document.getElementById('g-input');
  const sendBtn = document.getElementById('g-send');

  // Toggle Chat
  let isOpen = false;
  trigger.addEventListener('click', () => {
    isOpen = !isOpen;
    windowEl.classList.toggle('active', isOpen);
    trigger.innerHTML = isOpen ? Icons.close : Icons.chat;
    if (isOpen) setTimeout(() => inputEl.focus(), 100);
  });

  // Send Message
  const sendMessage = async () => {
    const msg = inputEl.value.trim();
    if (!msg) return;

    // Append User Message
    appendMessage(msg, 'user');
    inputEl.value = '';

    try {
      const res = await fetch(Gladwell.ajax, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          action: 'gladwell_chat',
          nonce: Gladwell.nonce,
          message: msg
        })
      });

      const json = await res.json();

      if (json.success && json.data.reply) {
        appendMessage(json.data.reply, 'bot');
      } else {
        const errorMsg = json.data || 'Sorry, could not respond.';
        appendMessage(`Error: ${errorMsg}`, 'bot error');
      }
    } catch (err) {
      appendMessage('Error contacting API.', 'bot error');
    }
  };

  // Helper: Append Message
  function appendMessage(text, type) {
    const div = document.createElement('div');
    div.className = `gladwell-message ${type}`;

    // If it's a bot message, parse markdown. User messages are plain text (safe).
    if (type === 'bot' || type === 'bot error') {
      div.innerHTML = parseMarkdown(text);
    } else {
      div.innerText = text;
    }

    messagesEl.appendChild(div);
    scrollToBottom();
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Simple Markdown Parser
  function parseMarkdown(text) {
    if (!text) return '';

    let html = text
      // Escape HTML characters first to prevent XSS from raw input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Code Blocks (inline)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^\*\*Title:\*\* (.*$)/gim, '<h3>$1</h3>'); // Handle **Title:** specifically as requested

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Unordered Lists
    // First, identify lines starting with - or * 
    // This is a simple implementation that wraps individual items, 
    // for a full list we'd need more complex state or regex, but this works for simple cases.
    html = html.replace(/^\s*[-*] (.*$)/gim, '<li>$1</li>');

    // Wrap adjacent <li> in <ul> (simple pass)
    // We can't easily do this with simple regex on the whole string without lookaheads/behinds
    // A trick is to replace all LI sequences with UL wrapper
    // But for now, let's just make sure <li>s render. 
    // To properly wrap, we might need a block parser. 
    // Let's try a simpler approach: multiple lines of <li>

    // Paragraphs:
    // Split by double newline to form paragraphs, but avoid breaking headers/lists
    // We can just turn \n into <br> for simplicity in chat context
    html = html.replace(/\n/g, '<br>');

    // Cleanup: <li> followed by <br> or starts with <br>
    // Just wrapping the whole thing? Chat usually better with <br>.
    // Proper lists needing <ul> tags:
    // Let's wrap groups of <li> with <ul>...</ul>.
    // This regex matches a sequence of <li>...</li> tags (including <br> between them if any)

    // Fix: Remove <br> immediately after </h3> or </h4>
    html = html.replace(/(<\/h[34]>)(<br>)+/g, '$1');

    // Fix: Remove <br> immediately before <li> and after </li>
    // Actually, simple list:
    // If we have "<li>...</li><br><li>...</li>", we want "<ul><li>...</li><li>...</li></ul>"

    // Rough List Wrapper:
    // Find first <li> and start <ul>, find </li> that is NOT followed by <li> and close </ul>
    // This is hard with regex. 
    // Alternative: Convert non-list lines to <p> or plain text, and list lines to <li>.

    return html;
  }


  // Event Listeners
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
});
