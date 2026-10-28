/* Theme, screens, landing wiring, progress + peer UI */

function setScreen(name) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('active', s.id === 'screen-' + name);
  });
  const cel = document.getElementById('celebration');
  if (cel) cel.hidden = (name !== 'celebration');
}

function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  document.getElementById('themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    redrawSignature();
  });
}

function initLanding() {
  document.getElementById('createRoomBtn').addEventListener('click', createHost);
  document.getElementById('showJoinBtn').addEventListener('click', () => {
    const f = document.getElementById('joinForm');
    f.style.display = f.style.display === 'none' ? 'block' : 'none';
  });
  
  // Force uppercase, letters and numbers only
  document.getElementById('joinCodeInput').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  });

  document.getElementById('joinRoomBtn').addEventListener('click', () => {
    const code = document.getElementById('joinCodeInput').value.trim();
    if (code.length === 6) {
      joinRoom(code);
    } else {
      alert("Please enter a valid 6-letter code.");
    }
  });
  
  document.getElementById('joinCodeInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('joinRoomBtn').click();
  });
}

function initLobby() {
  // Cleaned up: Copy Link button is removed from the UI
}

function updateMyProgress() {
  const el = document.getElementById('myProgress');
  if (el) el.textContent = progressCount(state.myState) + ' / 6';
}

function updatePeerUI() {
  const dot = document.getElementById('peerDot');
  const status = document.getElementById('peerStatus');
  const bar = document.getElementById('peerBarFill');
  const pill = document.getElementById('peerProgressPill');
  if (!dot || !status) return;

  if (state.peerDisconnected) {
    dot.className = 'dot bad';
    status.textContent = 'The other person disconnected.';
    status.className = 'status is-bad';
    bar.style.width = '0%';
    pill.textContent = '—';
    return;
  }
  if (!state.peerConnected) {
    dot.className = 'dot wait';
    status.textContent = 'Connecting to your partner...';
    status.className = 'status is-wait';
    bar.style.width = '0%';
    pill.textContent = '—';
    return;
  }
  dot.className = 'dot live';

  if (!state.peerState) {
    status.textContent = 'Waiting for the other person to complete';
    status.className = 'status is-wait';
    bar.style.width = '0%';
    pill.textContent = '0 / 6';
    return;
  }
  const n = progressCount(state.peerState);
  bar.style.width = Math.round(n / 6 * 100) + '%';
  pill.textContent = n + ' / 6';

  if (state.peerState.complete) {
    status.textContent = 'Your partner is ready.';
    status.className = 'status is-ok';
  } else {
    status.textContent = 'Waiting for the other person to complete';
    status.className = 'status is-wait';
  }
}

function updateAllUI() {
  updateMyProgress();
  updatePeerUI();
    }
