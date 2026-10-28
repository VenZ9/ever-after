/* Celebration screen + confetti */

let confettiStarted = false;
let confettiRAF = null;

function initCelebration() {
  const cel = document.getElementById('celebration');
  if (!cel) return;
  window.addEventListener('resize', () => {
    if (!cel.hidden) resizeConfetti();
  });
}

function showCelebration() {
  const cel = document.getElementById('celebration');
  if (!cel || !cel.hidden) return;

  const myName = state.myState.name || 'Partner A';
  const peerName = (state.peerState && state.peerState.name) || 'Partner B';

  const nameA = document.getElementById('nameA');
  const nameB = document.getElementById('nameB');
  if (state.mode === 'host') {
    nameA.textContent = myName;
    nameB.textContent = peerName;
  } else {
    nameA.textContent = peerName;
    nameB.textContent = myName;
  }

  const dateStr = state.myState.date || (state.peerState && state.peerState.date) || '';
  const timeStr = state.myState.time || (state.peerState && state.peerState.time) || '';
  const meta = document.getElementById('certMeta');
  let metaText = '';
  if (dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    metaText += d.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' });
  }
  if (timeStr) {
    const [hh, mm] = timeStr.split(':').map(Number);
    const dd = new Date(); dd.setHours(hh, mm, 0, 0);
    if (metaText) metaText += ' — ';
    metaText += dd.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
  }
  meta.innerHTML = metaText
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/></svg><span>' + metaText + '</span>'
    : '';

  cel.hidden = false;
  setScreen('celebration');
  startConfetti();
}

function resizeConfetti() {
  const c = document.getElementById('confetti');
  if (!c) return;
  c.width = c.clientWidth;
  c.height = c.clientHeight;
}

function startConfetti() {
  if (confettiStarted) return;
  confettiStarted = true;

  const c = document.getElementById('confetti');
  if (!c) return;
  resizeConfetti();
  const ctx = c.getContext('2d');

  const colors = ['#1cb0f6', '#0e8fc9', '#ffc800', '#58cc02', '#ff4b4b', '#a9d7f2'];
  const particles = [];
  const N = 130;
  for (let i = 0; i < N; i++) {
    particles.push({
      x: Math.random() * c.width,
      y: -20 - Math.random() * c.height,
      vx: (Math.random() - 0.5) * 1.6,
      vy: 1.5 + Math.random() * 2.6,
      size: 5 + Math.random() * 7,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  const tick = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    let alive = 0;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y < c.height + 20) alive++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    if (alive > 0) confettiRAF = requestAnimationFrame(tick);
  };
  confettiRAF = requestAnimationFrame(tick);
                                                 }
