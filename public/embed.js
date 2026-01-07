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

  document.getElementById('g-send').onclick = async () => {
    const msg = document.getElementById('g-in').value;

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
    document.getElementById('g-out').innerHTML += `<p>${json.data}</p>`;
  };
});
