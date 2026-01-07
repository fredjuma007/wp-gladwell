document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('gladwell-root');
  if (!root) return;

  root.innerHTML = `
    <div class="gladwell-box">
      <div id="g-out"></div>
      <input id="g-in" placeholder="Ask Gladwell…" />
      <button id="g-send">Send</button>
    </div>
  `;

  const outDiv = document.getElementById('g-out');
  const input = document.getElementById('g-in');
  const button = document.getElementById('g-send');

  button.onclick = async () => {
    const msg = input.value.trim();
    if (!msg) return;

    outDiv.innerHTML += `<p><strong>You:</strong> ${msg}</p>`;
    input.value = '';

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
        outDiv.innerHTML += `<p><strong>Gladwell:</strong> ${json.data.reply}</p>`;
      } else {
        const errorMsg = json.data || 'Sorry, could not respond.';
        outDiv.innerHTML += `<p><strong>Error:</strong> ${errorMsg}</p>`;
      }

      outDiv.scrollTop = outDiv.scrollHeight;
    } catch (err) {
      outDiv.innerHTML += `<p><strong>Gladwell:</strong> Error contacting API.</p>`;
    }
  };
});
