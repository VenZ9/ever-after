/* Bracelet drag onto the wrist */

function initBracelet() {
  const stage = document.getElementById('stage');
  const bracelet = document.getElementById('bracelet');
  if (!stage || !bracelet) return;

  let dragging = false;
  let worn = false;

  const placeInitial = () => {
    bracelet.style.left = '20%';
    bracelet.style.top = '18%';
  };
  placeInitial();
  window.addEventListener('resize', () => { if (!worn) placeInitial(); });

  const stageRect = () => stage.getBoundingClientRect();

  const setPos = (clientX, clientY) => {
    const r = stageRect();
    const xPct = ((clientX - r.left) / r.width) * 100;
    const yPct = ((clientY - r.top) / r.height) * 100;
    bracelet.style.left = xPct + '%';
    bracelet.style.top = yPct + '%';
  };

  const isOverWrist = () => {
    const r = stageRect();
    const br = bracelet.getBoundingClientRect();
    const bx = ((br.left + br.width / 2) - r.left) / r.width * 100;
    const by = ((br.top + br.height / 2) - r.top) / r.height * 100;
    return Math.hypot(bx - WRIST.x, by - WRIST.y) <= SNAP_RADIUS;
  };

  const snapToWrist = () => {
    worn = true;
    bracelet.classList.add('worn');
    bracelet.classList.remove('dragging');
    bracelet.style.left = WRIST.x + '%';
    bracelet.style.top = WRIST.y + '%';
    state.myState.bracelet = true;
    scheduleSend();
  };

  const onMove = (e) => {
    if (!dragging) return;
    setPos(e.clientX, e.clientY);
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    bracelet.classList.remove('dragging');
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    if (isOverWrist()) snapToWrist();
  };

  bracelet.addEventListener('pointerdown', (e) => {
    if (worn) return;
    e.preventDefault();
    dragging = true;
    bracelet.classList.add('dragging');
    setPos(e.clientX, e.clientY);
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
  });
}
