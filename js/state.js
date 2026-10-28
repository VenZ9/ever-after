/* Global app state + shared helpers */

const state = {
  mode: null,
  roomCode: null,
  peer: null,
  conn: null,
  peerConnected: false,
  peerDisconnected: false,
  peerState: null,
  connectAttempts: 0,
  myState: {
    name:'', signed:false, fp:false, date:'', time:'', bracelet:false, complete:false
  }
};

const WRIST = { x: 50, y: 78 };
const SNAP_RADIUS = 20;

function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function buildRoomUrl(code) {
  return location.origin + location.pathname + '?room=' + encodeURIComponent(code);
}

function progressCount(s) {
  let n = 0;
  if (s.name && s.name.trim()) n++;
  if (s.signed)   n++;
  if (s.fp)       n++;
  if (s.date)     n++;
  if (s.time)     n++;
  if (s.bracelet) n++;
  return n;
}

function isComplete(s) { return progressCount(s) === 6; }

let sendTimer = null;
function scheduleSend() {
  state.myState.complete = isComplete(state.myState);
  updateMyProgress();
  if (sendTimer) clearTimeout(sendTimer);
  sendTimer = setTimeout(() => {
    sendToPeer({ type: 'state', state: state.myState });
    checkBothComplete();
  }, 120);
}

function checkBothComplete() {
  if (state.myState.complete && state.peerState && state.peerState.complete) {
    showCelebration();
  }
}
