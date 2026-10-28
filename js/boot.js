/* Boot: loads HTML partials into #app-main, then starts everything. */

const PARTIALS = ['landing', 'lobby', 'form', 'celebration'];

async function loadPartials() {
  const main = document.getElementById('app-main');
  for (const name of PARTIALS) {
    const res = await fetch('partials/' + name + '.html');
    if (!res.ok) throw new Error('Failed to load partial: ' + name);
    const html = await res.text();
    main.insertAdjacentHTML('beforeend', html);
  }
}

async function boot() {
  try {
    await loadPartials();
  } catch (err) {
    console.error(err);
    document.getElementById('app-main').innerHTML =
      '<div class="card" style="max-width:420px;margin:40px auto;text-align:center;">' +
      '<h2 style="margin:0 0 8px;">Could not load the app</h2>' +
      '<p class="muted small" style="margin:0;">Serve this folder over HTTP (e.g. <code>npx serve .</code>) or deploy to Vercel — fetch does not work on <code>file://</code>.</p>' +
      '</div>';
    return;
  }

  initTheme();
  initLanding();
  initLobby();
  initName();
  initSignature();
  initFingerprint();
  initPickers();
  initBracelet();
  initCelebration();

  const params = new URLSearchParams(location.search);
  const room = params.get('room');
  if (room) joinRoom(room);
}

boot();
