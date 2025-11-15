// ==================== Configuration ====================
const CONFIG = {
    WS_URL: `ws://${window.location.hostname}:${window.location.port || 3000}`,
    API_URL: '/api',
    PING_INTERVAL: 10000,
    STATS_UPDATE_INTERVAL: 5000
};

// ==================== Game State ====================
const gameState = {
    sessionId: null,
    username: null,
    country: null,
    isSpinning: false,
    currentSpeed: 0,
    maxSpeed: 0,
    rotation: 0,
    userSpins: 0,
    totalSpins: 0,
    topSpeed: 0,
    raveMode: false,
    speedMultiplier: 1.0,
    soundEnabled: false,
    currentTheme: 'light',
    ws: null,
    connected: false,
    lastTime: Date.now(),
    spinStartTime: 0
};

// ==================== DOM Elements ====================
const elements = {
    // Cat elements
    catSpinner: document.getElementById('catSpinner'),
    catContainer: document.getElementById('catContainer'),
    catImage: document.getElementById('catImage'),

    // Controls
    spinButton: document.getElementById('spinButton'),
    speedSlider: document.getElementById('speedSlider'),
    speedMultiplier: document.getElementById('speedMultiplier'),
    raveMode: document.getElementById('raveMode'),
    soundEnabled: document.getElementById('soundEnabled'),
    musicSelect: document.getElementById('musicSelect'),

    // Display
    currentSpeed: document.getElementById('currentSpeed'),
    totalSpins: document.getElementById('totalSpins'),
    userSpins: document.getElementById('userSpins'),
    topSpeed: document.getElementById('topSpeed'),
    countryInfo: document.getElementById('countryInfo'),

    // Terminal
    terminal: document.getElementById('terminal'),

    // Theme
    themeOptions: document.querySelectorAll('.theme-option'),

    // Navigation
    navTabBtns: document.querySelectorAll('.nav-tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),

    // Modal
    cookieModal: document.getElementById('cookieModal'),
    cookieSettings: document.getElementById('cookieSettings'),
    closeModal: document.getElementById('closeModal'),
    saveCookies: document.getElementById('saveCookies'),

    // Chat
    chatInput: document.getElementById('chatInput'),
    chatSend: document.getElementById('chatSend'),
    chatMessages: document.getElementById('chatMessages'),

    // Particle canvas
    particleCanvas: document.getElementById('particleCanvas')
};

// ==================== Initialization ====================
function init() {
    addTerminalLine('Initializing Spinning Cat...');

    // Generate or get session ID
    gameState.sessionId = getOrCreateSessionId();
    addTerminalLine(`Session ID: ${gameState.sessionId.substring(0, 8)}...`);

    // Detect country
    detectCountry();

    // Load saved data
    loadGameData();

    // Setup event listeners
    setupEventListeners();

    // Connect WebSocket
    connectWebSocket();

    // Start animation loop
    startAnimationLoop();

    // Load stats from server
    updateStatsFromServer();

    // Initialize particle canvas
    initParticleCanvas();

    addTerminalLine('System ready!');
}

// ==================== Session Management ====================
function getOrCreateSessionId() {
    let sessionId = localStorage.getItem('spinningCatSessionId');
    if (!sessionId) {
        sessionId = generateUUID();
        localStorage.setItem('spinningCatSessionId', sessionId);
    }
    return sessionId;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ==================== Data Loading/Saving ====================
function loadGameData() {
    const saved = localStorage.getItem('spinningCatData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameState.username = data.username || `User${Math.floor(Math.random() * 10000)}`;
            gameState.currentTheme = data.theme || 'light';
            applyTheme(gameState.currentTheme);
        } catch (e) {
            console.error('Failed to load saved data:', e);
        }
    } else {
        gameState.username = `User${Math.floor(Math.random() * 10000)}`;
    }
}

function saveGameData() {
    const data = {
        username: gameState.username,
        theme: gameState.currentTheme
    };
    localStorage.setItem('spinningCatData', JSON.stringify(data));
}

// ==================== Event Listeners ====================
function setupEventListeners() {
    // Spin button - mouse events
    elements.spinButton.addEventListener('mousedown', startSpinning);
    elements.spinButton.addEventListener('mouseup', stopSpinning);
    elements.spinButton.addEventListener('mouseleave', stopSpinning);

    // Spin button - touch events
    elements.spinButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startSpinning();
    });
    elements.spinButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopSpinning();
    });

    // Speed slider
    if (elements.speedSlider) {
        elements.speedSlider.addEventListener('input', (e) => {
            gameState.speedMultiplier = parseFloat(e.target.value);
            elements.speedMultiplier.textContent = gameState.speedMultiplier.toFixed(1);
        });
    }

    // Rave mode
    if (elements.raveMode) {
        elements.raveMode.addEventListener('change', (e) => {
            gameState.raveMode = e.target.checked;
            if (gameState.raveMode) {
                elements.catContainer.classList.add('rave-mode');
                addTerminalLine('Rave mode activated!');
            } else {
                elements.catContainer.classList.remove('rave-mode');
                addTerminalLine('Rave mode deactivated');
            }
        });
    }

    // Sound toggle
    if (elements.soundEnabled) {
        elements.soundEnabled.addEventListener('change', (e) => {
            gameState.soundEnabled = e.target.checked;
            addTerminalLine(gameState.soundEnabled ? 'Sound enabled' : 'Sound disabled');
        });
    }

    // Theme options
    elements.themeOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            elements.themeOptions.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Navigation tabs
    elements.navTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });

    // Cookie modal
    if (elements.cookieSettings) {
        elements.cookieSettings.addEventListener('click', () => {
            elements.cookieModal.classList.add('active');
        });
    }

    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', () => {
            elements.cookieModal.classList.remove('active');
        });
    }

    if (elements.saveCookies) {
        elements.saveCookies.addEventListener('click', () => {
            elements.cookieModal.classList.remove('active');
            addTerminalLine('Cookie preferences saved');
        });
    }

    // Chat
    if (elements.chatSend) {
        elements.chatSend.addEventListener('click', sendChatMessage);
    }

    if (elements.chatInput) {
        elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(e) {
    // Space - toggle spin
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        if (gameState.isSpinning) {
            stopSpinning();
        } else {
            startSpinning();
        }
    }
}

// ==================== Spinning Logic ====================
function startSpinning() {
    if (gameState.isSpinning) return;

    gameState.isSpinning = true;
    gameState.spinStartTime = Date.now();
    elements.spinButton.classList.add('active');

    addTerminalLine('Spinning started...');
}

function stopSpinning() {
    if (!gameState.isSpinning) return;

    gameState.isSpinning = false;
    elements.spinButton.classList.remove('active');

    const duration = (Date.now() - gameState.spinStartTime) / 1000;

    if (gameState.currentSpeed > 10 && duration > 0.5) {
        gameState.userSpins++;
        updateStats();

        // Record to server
        recordSpinToServer(gameState.currentSpeed, duration);

        addTerminalLine(`Spin complete - Speed: ${Math.round(gameState.currentSpeed)} RPM, Duration: ${duration.toFixed(1)}s`);

        if (gameState.userSpins % 10 === 0) {
            addTerminalLine(`Milestone: ${gameState.userSpins} spins!`);
            createCelebrationParticles();
        }
    }
}

function startAnimationLoop() {
    function animate() {
        const now = Date.now();
        const deltaTime = (now - gameState.lastTime) / 1000;
        gameState.lastTime = now;

        if (gameState.isSpinning) {
            // Accelerate
            const baseAcceleration = 400;
            const acceleration = baseAcceleration * gameState.speedMultiplier;
            gameState.currentSpeed += acceleration * deltaTime;

            // Cap max speed
            const maxSpeed = 500 * gameState.speedMultiplier;
            if (gameState.currentSpeed > maxSpeed) {
                gameState.currentSpeed = maxSpeed;
            }

            // Update max speed
            if (gameState.currentSpeed > gameState.maxSpeed) {
                gameState.maxSpeed = gameState.currentSpeed;
                gameState.topSpeed = Math.max(gameState.topSpeed, gameState.maxSpeed);
            }
        } else {
            // Decelerate
            const deceleration = 200;
            gameState.currentSpeed -= deceleration * deltaTime;
            if (gameState.currentSpeed < 0) {
                gameState.currentSpeed = 0;
            }
        }

        // Update rotation
        if (gameState.currentSpeed > 0) {
            const rotationSpeed = gameState.currentSpeed * 6;
            gameState.rotation += rotationSpeed * deltaTime;
            gameState.rotation %= 360;

            if (elements.catSpinner) {
                elements.catSpinner.style.transform = `rotate(${gameState.rotation}deg)`;
            }
        }

        // Update display
        if (elements.currentSpeed) {
            elements.currentSpeed.textContent = Math.round(gameState.currentSpeed);
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// ==================== API Calls ====================
async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${CONFIG.API_URL}${endpoint}`, options);
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        return null;
    }
}

async function recordSpinToServer(speed, duration) {
    const data = await apiCall('/spin', 'POST', {
        sessionId: gameState.sessionId,
        speed,
        duration,
        username: gameState.username,
        country: gameState.country
    });

    if (data && data.stats) {
        gameState.totalSpins = data.stats.total_spins || 0;
        gameState.topSpeed = Math.max(gameState.topSpeed, data.stats.max_speed || 0);
        updateStats();
    }

    // Broadcast via WebSocket
    sendWSMessage({
        type: 'spin',
        speed,
        duration,
        username: gameState.username,
        country: gameState.country
    });
}

async function updateStatsFromServer() {
    const data = await apiCall(`/stats/user/${gameState.sessionId}`);
    if (data) {
        gameState.totalSpins = data.total_spins || 0;
        gameState.topSpeed = data.max_speed || 0;
        updateStats();
    }

    // Update global stats periodically
    setInterval(async () => {
        const globalData = await apiCall('/stats/global');
        if (globalData) {
            updateGlobalStats(globalData);
        }
    }, CONFIG.STATS_UPDATE_INTERVAL);
}

function updateStats() {
    if (elements.userSpins) {
        elements.userSpins.textContent = gameState.userSpins;
    }
    if (elements.totalSpins) {
        elements.totalSpins.textContent = gameState.totalSpins;
    }
    if (elements.topSpeed) {
        elements.topSpeed.textContent = Math.round(gameState.topSpeed);
    }
}

function updateGlobalStats(stats) {
    if (stats.total_spins) {
        elements.totalSpins.textContent = stats.total_spins;
    }
}

// ==================== WebSocket ====================
function connectWebSocket() {
    try {
        gameState.ws = new WebSocket(CONFIG.WS_URL);

        gameState.ws.onopen = () => {
            console.log('WebSocket connected');
            gameState.connected = true;
            addTerminalLine('Connected to server');

            // Send init message
            sendWSMessage({
                type: 'init',
                sessionId: gameState.sessionId,
                username: gameState.username,
                country: gameState.country
            });

            // Start heartbeat
            startHeartbeat();
        };

        gameState.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWSMessage(data);
            } catch (error) {
                console.error('Failed to handle WebSocket message:', error);
            }
        };

        gameState.ws.onclose = () => {
            console.log('WebSocket disconnected');
            gameState.connected = false;
            addTerminalLine('Connection lost. Reconnecting...');

            // Reconnect after 5 seconds
            setTimeout(connectWebSocket, 5000);
        };

        gameState.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            addTerminalLine('Connection error');
        };
    } catch (error) {
        console.error('Failed to create WebSocket:', error);
        addTerminalLine('Failed to connect to server');
    }
}

function sendWSMessage(data) {
    if (gameState.ws && gameState.ws.readyState === WebSocket.OPEN) {
        gameState.ws.send(JSON.stringify(data));
    }
}

function handleWSMessage(data) {
    switch (data.type) {
        case 'init_success':
            addTerminalLine('Initialization successful');
            break;

        case 'pong':
            // Heartbeat response
            break;

        case 'spin_event':
            if (Math.random() < 0.1) {
                addTerminalLine(`${data.username} spun at ${Math.round(data.speed)} RPM`);
            }
            break;

        case 'stats_update':
            updateGlobalStats(data.stats);
            break;

        case 'online_count':
            // Update online count if we have a display for it
            addTerminalLine(`${data.count} users online from ${data.countries} countries`);
            break;

        case 'chat_message':
            displayChatMessage(data);
            break;

        case 'leaderboard_update':
            updateLeaderboard(data.leaderboardType, data.data);
            break;

        default:
            console.log('Unknown message type:', data.type);
    }
}

function startHeartbeat() {
    setInterval(() => {
        sendWSMessage({
            type: 'ping',
            username: gameState.username,
            country: gameState.country
        });
    }, CONFIG.PING_INTERVAL);
}

// ==================== Country Detection ====================
async function detectCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        gameState.country = data.country_code || 'Unknown';

        if (elements.countryInfo) {
            elements.countryInfo.innerHTML = `<span>📍 ${data.country_name || 'Unknown'}</span>`;
        }

        addTerminalLine(`Location: ${data.country_name || 'Unknown'}`);
    } catch (error) {
        console.error('Failed to detect country:', error);
        gameState.country = 'Unknown';
        if (elements.countryInfo) {
            elements.countryInfo.innerHTML = '<span>📍 Location unknown</span>';
        }
    }
}

// ==================== Theme Management ====================
function applyTheme(theme) {
    gameState.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    addTerminalLine(`Theme changed to ${theme}`);
    saveGameData();
}

// ==================== Navigation ====================
function switchTab(tabName) {
    // Update buttons
    elements.navTabBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update panels
    elements.tabPanels.forEach(panel => {
        if (panel.getAttribute('data-panel') === tabName) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });
}

// ==================== Chat ====================
function sendChatMessage() {
    if (!elements.chatInput || !elements.chatInput.value.trim()) return;

    const message = elements.chatInput.value.trim();

    // Send to server
    apiCall('/chat/message', 'POST', {
        sessionId: gameState.sessionId,
        message,
        username: gameState.username
    });

    // Send via WebSocket
    sendWSMessage({
        type: 'chat',
        message
    });

    elements.chatInput.value = '';
}

function displayChatMessage(data) {
    if (!elements.chatMessages) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message';
    messageEl.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    elements.chatMessages.appendChild(messageEl);

    // Scroll to bottom
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

function updateLeaderboard(type, data) {
    // Update leaderboard display
    console.log('Leaderboard update:', type, data);
}

// ==================== Terminal ====================
function addTerminalLine(text) {
    if (!elements.terminal) return;

    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.textContent = text;
    elements.terminal.appendChild(line);

    // Keep only last 10 lines
    while (elements.terminal.children.length > 10) {
        elements.terminal.removeChild(elements.terminal.firstChild);
    }

    // Scroll to bottom
    elements.terminal.scrollTop = elements.terminal.scrollHeight;
}

// ==================== Particle Effects ====================
function initParticleCanvas() {
    if (!elements.particleCanvas) return;

    const canvas = elements.particleCanvas;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    const particles = [];

    function createParticle(x, y) {
        particles.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * -4 - 2,
            life: 1,
            decay: Math.random() * 0.02 + 0.01,
            size: Math.random() * 8 + 4,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    // Expose particle creation
    window.createParticles = (count = 20) => {
        const rect = elements.catContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < count; i++) {
            createParticle(centerX, centerY);
        }
    };
}

function createCelebrationParticles() {
    if (window.createParticles) {
        window.createParticles(50);
    }
}

// ==================== Initialize on Load ====================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('%c🐱 Spinning Cat', 'font-size: 24px; font-weight: bold; color: #ff6b9d;');
console.log('%cClone of spinning.cat', 'font-size: 14px; color: #666;');
