/* Name, signature canvas, fingerprint, date/time pickers */

/* ---- Name ---- */
function initName() {
  const input = document.getElementById('nameInput');
  input.addEventListener('input', () => {
    state.myState.name = input.value;
    scheduleSend();
  });
}

/* ---- Signature ---- */
let signCanvas, signCtx, signDrawing = false, signHasInk = false;

function getInkColor() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? '#eaf6ff' : '#12303f';
}

function initSignature() {
  signCanvas = document.getElementById('signCanvas');
  signCtx = signCanvas.getContext('2d');

  const resize = () => {
    const rect = signCanvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const prev = signHasInk ? signCanvas.toDataURL() : null;
    signCanvas.width = Math.round(rect.width * dpr);
    signCanvas.height = Math.round(rect.height * dpr);
    signCanvas.style.width = rect.width + 'px';
    signCanvas.style.height = rect.height + 'px';
    signCtx.setTransform(1, 0, 0, 1, 0, 0);
    signCtx.scale(dpr, dpr);
    signCtx.lineCap = 'round';
    signCtx.lineJoin = 'round';
    signCtx.lineWidth = 2.6;
    signCtx.strokeStyle = getInkColor();
    if (prev) {
      const img = new Image();
      img.onload = () => signCtx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = prev;
    }
  };
  resize();
  window.addEventListener('resize', resize);

  const pos = (e) => {
    const r = signCanvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  };

  const start = (e) => {
    e.preventDefault();
    signDrawing = true;
    const { x, y } = pos(e);
    signCtx.beginPath();
    signCtx.moveTo(x, y);
  };
  const move = (e) => {
    if (!signDrawing) return;
    e.preventDefault();
    const { x, y } = pos(e);
    signCtx.lineTo(x, y);
    signCtx.stroke();
    if (!signHasInk) {
      signHasInk = true;
      document.getElementById('signBox').classList.add('signed');
      state.myState.signed = true;
      scheduleSend();
    }
  };
  const end = () => { signDrawing = false; };

  signCanvas.addEventListener('mousedown', start);
  signCanvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  signCanvas.addEventListener('touchstart', start, { passive: false });
  signCanvas.addEventListener('touchmove', move, { passive: false });
  signCanvas.addEventListener('touchend', end);

  document.getElementById('clearSign').addEventListener('click', (e) => {
    e.stopPropagation();
    clearSignature();
  });
}

function clearSignature() {
  if (!signCtx) return;
  signCtx.clearRect(0, 0, signCanvas.width, signCanvas.height);
  signHasInk = false;
  document.getElementById('signBox').classList.remove('signed');
  state.myState.signed = false;
  scheduleSend();
}

function redrawSignature() {
  if (signCtx) signCtx.strokeStyle = getInkColor();
}

/* ---- Fingerprint ---- */
const FP_SVG = `
  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round">
    <path d="M50 14c-13 0-24 11-24 24v6"/>
    <path d="M74 38v6c0 13-11 24-24 24h-2"/>
    <path d="M50 28c-7 0-13 6-13 13v18"/>
    <path d="M63 41v16c0 9-7 16-16 16h-3"/>
    <path d="M50 42v14"/>
    <path d="M26 46v-8c0-13 11-24 24-24 8 0 15 4 20 10"/>
    <path d="M24 60c0 8 3 15 8 21"/>
    <path d="M76 60c0 8-3 15-8 21"/>
  </svg>
`;

function initFingerprint() {
  const box = document.getElementById('fpBox');
  const icon = document.getElementById('fpIcon');
  const text = document.getElementById('fpText');
  icon.innerHTML = FP_SVG;

  box.addEventListener('click', () => {
    if (box.classList.contains('done') || box.classList.contains('scanning')) return;
    box.classList.add('scanning');
    text.textContent = 'Scanning...';
    setTimeout(() => {
      box.classList.remove('scanning');
      box.classList.add('done');
      text.textContent = 'Fingerprint added';
      state.myState.fp = true;
      scheduleSend();
    }, 1400);
  });

  document.getElementById('fpReset').addEventListener('click', (e) => {
    e.stopPropagation();
    box.classList.remove('done', 'scanning');
    text.textContent = 'Put your finger here';
    state.myState.fp = false;
    scheduleSend();
  });
}

/* ---- Date / Time ---- */
function initPickers() {
  const dateBox = document.getElementById('dateBox');
  const dateInput = document.getElementById('dateInput');
  const dateValue = document.getElementById('dateValue');

  const timeBox = document.getElementById('timeBox');
  const timeInput = document.getElementById('timeInput');
  const timeValue = document.getElementById('timeValue');

  const openPicker = (input) => {
    if (typeof input.showPicker === 'function') {
      try { input.showPicker(); return; } catch(e){}
    }
    input.focus();
    input.click();
  };

  dateBox.addEventListener('click', () => openPicker(dateInput));
  timeBox.addEventListener('click', () => openPicker(timeInput));

  dateInput.addEventListener('change', () => {
    const v = dateInput.value;
    state.myState.date = v;
    if (v) {
      const d = new Date(v + 'T00:00:00');
      dateValue.textContent = d.toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' });
      dateBox.classList.add('filled');
    } else {
      dateValue.textContent = 'Select date';
      dateBox.classList.remove('filled');
    }
    scheduleSend();
  });

  timeInput.addEventListener('change', () => {
    const v = timeInput.value;
    state.myState.time = v;
    if (v) {
      const [hh, mm] = v.split(':').map(Number);
      const d = new Date();
      d.setHours(hh, mm, 0, 0);
      timeValue.textContent = d.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
      timeBox.classList.add('filled');
    } else {
      timeValue.textContent = 'Select time';
      timeBox.classList.remove('filled');
    }
    scheduleSend();
  });
      }
