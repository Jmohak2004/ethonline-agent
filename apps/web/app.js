// Add SVG gradient definition to body
document.body.insertAdjacentHTML('afterbegin', `
<svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00d2ff" />
      <stop offset="100%" stop-color="#7a28cb" />
    </linearGradient>
  </defs>
</svg>
`);

// Setup Agents
const agents = [
    { name: "WhaleWatcher Pro", role: "Onchain Flow Tracking" },
    { name: "MarketMind", role: "RSI & Momentum" },
    { name: "NewsScout", role: "Event Catalysts" },
    { name: "SentimentAgent", role: "Social Volume" },
    { name: "RiskGuardian", role: "TEE Stop-Loss limits" }
];

const agentList = document.getElementById('agent-list');
agents.forEach(a => {
    const el = document.createElement('div');
    el.className = 'agent-card';
    el.innerHTML = `
        <div class="agent-header">
            <div class="agent-name">${a.name}</div>
            <div class="status-dot"></div>
        </div>
        <div class="agent-role">${a.role}</div>
    `;
    agentList.appendChild(el);
});

// Setup Live Feed Simulation
const feedContainer = document.getElementById('live-feed');
const easList = document.getElementById('eas-list');
const confidenceText = document.getElementById('confidence-text');
const confidenceCircle = document.getElementById('confidence-circle');
const signalText = document.getElementById('signal-text');

const events = [
    { type: 'info', msg: "WhaleWatcher detected $1.2M USDC moving to Coinbase." },
    { type: 'buy', msg: "MarketMind signals STRONG BUY on ETH. RSI-14 at 38 (Oversold)." },
    { type: 'info', msg: "NewsScout: EIP-7702 finalized. Catalyst positive." },
    { type: 'info', msg: "RiskGuardian verified max trade limits ($20.00). Approved." },
    { type: 'buy', msg: "Swarm Consensus Reached. Executing 0.005 ETH swap via Uniswap v3." },
    { type: 'sell', msg: "SentimentAgent detects 15% drop in social volume. Neutral." },
    { type: 'info', msg: "Aave v3 Auto-Yield processed 0.0001 USDC rewards." }
];

let eventIndex = 0;
function addFeedItem() {
    const ev = events[eventIndex % events.length];
    const el = document.createElement('div');
    el.className = \`feed-item \${ev.type}\`;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    el.innerHTML = `
        <div class="feed-meta">
            <span>System Log</span>
            <span>${time}</span>
        </div>
        <div class="feed-content">${ev.msg}</div>
    `;
    
    feedContainer.prepend(el);
    if(feedContainer.children.length > 8) {
        feedContainer.removeChild(feedContainer.lastChild);
    }
    
    // Randomize confidence slightly
    const conf = Math.floor(82 + Math.random() * 12);
    confidenceText.textContent = conf + '%';
    confidenceCircle.setAttribute('stroke-dasharray', \`\${conf}, 100\`);
    
    if (conf > 90) signalText.textContent = "STRONG BUY (ETH)";
    else if (conf < 85) signalText.textContent = "ACCUMULATE (ETH)";
    else signalText.textContent = "HOLD (ETH)";

    // Add fake EAS attestation occasionally
    if (Math.random() > 0.6) {
        addEAS();
    }
    
    eventIndex++;
    setTimeout(addFeedItem, 3000 + Math.random() * 4000);
}

function addEAS() {
    const uid = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const el = document.createElement('div');
    el.className = 'eas-item';
    
    const time = new Date().toLocaleTimeString();
    el.innerHTML = `
        <span>Attestation at ${time}</span>
        \${uid.substring(0,14)}...\${uid.substring(uid.length-10)}
    `;
    
    easList.prepend(el);
    if(easList.children.length > 5) {
        easList.removeChild(easList.lastChild);
    }
}

// Start simulation
setTimeout(addFeedItem, 1000);
addEAS();
