/* Global app state + word list + shared helpers */

const WORDS = [
  'amber','angel','arrow','autumn','bamboo','beacon','bloom','blue','breeze','butter',
  'candle','cedar','charm','cloud','coral','cosmos','cozy','crimson','crystal','daisy',
  'dawn','dream','dune','dusk','ember','emerald','fable','fern','festive','flame',
  'flora','forest','frost','galaxy','garden','gentle','glow','gold','grace','harbor',
  'harmony','hazel','heart','honey','hope','ivory','jade','jasmine','joy','juniper',
  'kind','lagoon','lantern','lark','lavender','leaf','lily','linden','lotus','lucky',
  'lunar','maple','marble','meadow','melon','mint','mist','moon','morning','moss',
  'nectar','nova','oak','ocean','olive','opal','orange','orchid','peach','pearl',
  'pebble','peony','petal','pine','plum','pond','poppy','prairie','prism','quartz',
  'quiet','rain','raven','ribbon','river','rose','ruby','saffron','sage','sail',
  'sand','sapphire','scarlet','sea','shell','silk','silver','sky','snow','soft',
  'solar','spark','spice','spring','star','stone','storm','summer','sun','sunset',
  'sweet','swift','tea','thistle','tide','tulip','twilight','valley','velvet','violet',
  'warm','water','wave','willow','wind','winter','wish','wonder','yarrow','zephyr'
];

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
  const parts = [];
  for (let i = 0; i < 6; i++) {
    parts.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
  }
  return parts.join('-');
}

function buildRoomUrl(code) {
  return location.origin + location.pathname + '?room=' + encodeURIComponent(code);
}

function formatCodeDisplay(code) {
  return code.split('-').join(' ');
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
