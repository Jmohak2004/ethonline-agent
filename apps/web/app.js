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

// Setup live feed polling
const feedContainer = document.getElementById('live-feed');
const easList = document.getElementById('eas-list');
const confidenceText = document.getElementById('confidence-text');
const confidenceCircle = document.getElementById('confidence-circle');
const signalText = document.getElementById('signal-text');

let lastEventCount = 0;

async function fetchDashboardFeed() {
    try {
        const response = await fetch('/api/feed');
        if (!response.ok) return;
        const data = await response.json();
        
        if (data.events && data.events.length > 0) {
            // Render only if new events appear (simplistic check)
            if (data.events.length !== lastEventCount) {
                feedContainer.innerHTML = '';
                easList.innerHTML = '';
                
                let latestBuyConf = null;
                
                data.events.forEach(ev => {
                    // Feed Items
                    const el = document.createElement('div');
                    el.className = `feed-item ${ev.type}`;
                    const time = new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    el.innerHTML = `
                        <div class="feed-meta">
                            <span>System Log</span>
                            <span>${time}</span>
                        </div>
                        <div class="feed-content">${ev.msg}</div>
                    `;
                    feedContainer.appendChild(el);
                    
                    // EAS Attestations
                    if (ev.eas) {
                        const easEl = document.createElement('div');
                        easEl.className = 'eas-item';
                        const easTime = new Date(ev.eas.time).toLocaleTimeString();
                        const uid = ev.eas.uid;
                        easEl.innerHTML = `
                            <span>Attestation at ${easTime}</span>
                            ${uid.substring(0,14)}...${uid.substring(uid.length-10)}
                        `;
                        easList.appendChild(easEl);
                        
                        // Fake parse confidence from msg for UI candy
                        if (ev.msg.includes('Confidence:')) {
                            const match = ev.msg.match(/Confidence:\s*([\d.]+)%/);
                            if (match) {
                                latestBuyConf = parseFloat(match[1]);
                            }
                        }
                    }
                });
                
                lastEventCount = data.events.length;
                
                if (latestBuyConf) {
                    const conf = Math.floor(latestBuyConf);
                    confidenceText.textContent = conf + '%';
                    confidenceCircle.setAttribute('stroke-dasharray', `${conf}, 100`);
                    if (conf > 90) signalText.textContent = "STRONG BUY";
                    else if (conf < 85) signalText.textContent = "ACCUMULATE";
                    else signalText.textContent = "HOLD";
                }
            }
        }
    } catch (e) {
        console.error("Dashboard Feed Error:", e);
    }
}

// Start live polling every 5 seconds
fetchDashboardFeed();
setInterval(fetchDashboardFeed, 5000);
