/* PeerJS setup — host + guest flows, connection handlers, sync */

function showFatal(msg) {
  setScreen('landing');
  const hero = document.querySelector('.hero');
  if (!hero) return;
  let el = hero.querySelector('.fatal-msg');
  if (!el) {
    el = document.createElement('p');
    el.className = 'fatal-msg muted small';
    el.style.cssText = 'margin-top:18px;color:var(--bad);font-weight:800;';
    hero.appendChild(el);
  }
  el.textContent = msg;
}

function createHost() {
  state.mode = 'host';
  state.roomCode = generateRoomCode();
  state.peer = new Peer(state.roomCode, { debug: 0 });

  state.peer.on('open', () => showLobby());
  state.peer.on('connection', onIncomingConnection);
  state.peer.on('error', (err) => {
    if (err.type === 'unavailable-id') {
      try { state.peer.destroy(); } catch(e){}
      createHost();
    } else {
      console.error('Peer error:', err);
      showFatal('Connection error. Please refresh and try again.');
    }
  });
}

function showLobby() {
  setScreen('lobby');
  const url = buildRoomUrl(state.roomCode);
  
  // Display the single 6-letter code
  document.getElementById('codeDisplay').textContent = state.roomCode;

  // Render QR code directly into the wrap div
  const qrWrap = document.getElementById('qrWrap');
  qrWrap.innerHTML = '';
  new QRCode(qrWrap, {
    text: url,
    width: 180,
    height: 180,
    colorDark: "#12303f",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function joinRoom(code) {
  state.mode = 'guest';
  state.roomCode = code;
  state.peer = new Peer({ debug: 0 });

  state.peer.on('open', () => {
    setScreen('form');
    updateAllUI();
    attemptConnect();
  });
  state.peer.on('error', (err) => {
    console.error('Peer error:', err);
    showFatal('Could not open a connection. Please refresh.');
  });
}

function attemptConnect() {
  if (state.connectAttempts >= 4) {
    showFatal('Could not reach that room. Check the code or ask the host to try again.');
    return;
  }
  state.connectAttempts++;

  const c = state.peer.connect(state.roomCode, { reliable: true });
  state.conn = c;
  let opened = false;
  let errored = false;

  const timer = setTimeout(() => {
    if (!opened && !errored) {
      try { c.close(); } catch(e){}
      attemptConnect();
    }
  }, 6000);

  c.on('open', () => { opened = true; clearTimeout(timer); onConnOpen(); });
  c.on('error', () => {
    if (opened) return;
    errored = true; clearTimeout(timer);
    try { c.close(); } catch(e){}
    setTimeout(attemptConnect, 400);
  });
  c.on('data', onConnData);
  c.on('close', () => { if (opened) onConnClose(); });
}

function onIncomingConnection(conn) {
  if (state.conn && state.conn.open) {
    try { conn.close(); } catch(e){}
    return;
  }
  state.conn = conn;
  conn.on('open', onConnOpen);
  conn.on('data', onConnData);
  conn.on('close', onConnClose);
  conn.on('error', () => {});
}

function onConnOpen() {
  state.peerConnected = true;
  state.peerDisconnected = false;
  state.connectAttempts = 0;
  setScreen('form');
  updateAllUI();
  sendToPeer({ type: 'hello' });
  sendToPeer({ type: 'state', state: state.myState });
}

function onConnData(msg) {
  if (!msg || typeof msg !== 'object') return;
  if (msg.type === 'state') {
    state.peerState = msg.state;
    updatePeerUI();
    checkBothComplete();
  } else if (msg.type === 'hello') {
    sendToPeer({ type: 'state', state: state.myState });
  }
}

function onConnClose() {
  state.peerConnected = false;
  state.peerDisconnected = true;
  state.conn = null;
  updatePeerUI();
}

function sendToPeer(msg) {
  if (state.conn && state.conn.open) {
    try { state.conn.send(msg); } catch(e){}
  }
                         }
