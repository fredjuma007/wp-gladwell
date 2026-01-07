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
    div.innerText = text; // Safe text insertion
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // Event Listeners
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
});
