// ============ 配置 ============

const CONFIG = {
    WS_URL: `ws://${window.location.hostname}:${window.location.port || 3000}`,
    API_URL: `/api`,
    PING_INTERVAL: 10000, // 10秒
    STATS_UPDATE_INTERVAL: 5000 // 5秒
};

// ============ 游戏状态 ============

const gameState = {
    sessionId: null,
    username: null,
    country: null,
    isSpinning: false,
    spinCount: 0,
    sessionSpins: 0,
    totalSpins: 0,
    currentSpeed: 0,
    maxSpeed: 0,
    rotation: 0,
    lastTime: 0,
    partyMode: false,
    turboMode: false,
    soundMode: false,
    currentTheme: 'light',
    currentRemix: 'none',
    acceleration: 0,
    ws: null,
    connected: false
};

// ============ DOM 元素 ============

const elements = {
    cat: document.getElementById('cat'),
    catWrapper: document.getElementById('catWrapper'),
    spinButton: document.getElementById('spinButton'),
    currentSpeed: document.getElementById('currentSpeed'),
    sessionSpins: document.getElementById('sessionSpins'),
    totalSpins: document.getElementById('totalSpins'),
    maxSpeed: document.getElementById('maxSpeed'),
    partyMode: document.getElementById('partyMode'),
    turboMode: document.getElementById('turboMode'),
    soundMode: document.getElementById('soundMode'),
    themeButtons: document.querySelectorAll('.theme-btn'),
    themeToggle: document.getElementById('themeToggle'),
    remixSelect: document.getElementById('remixSelect'),
    langSelect: document.getElementById('langSelect'),
    terminal: document.getElementById('terminal'),
    userCount: document.getElementById('userCount'),
    particles: document.getElementById('particles')
};

// ============ 初始化 ============

function init() {
    // 生成或获取 session ID
    gameState.sessionId = getOrCreateSessionId();

    // 检测国家
    detectCountry();

    // 加载游戏数据
    loadGameData();

    // 设置事件监听器
    setupEventListeners();

    // 连接 WebSocket
    connectWebSocket();

    // 启动动画循环
    startAnimationLoop();

    // 更新统计
    updateStatsFromServer();

    addTerminalLine('系统初始化完成 ✓');
    addTerminalLine(`Session ID: ${gameState.sessionId.substring(0, 8)}...`);
    addTerminalLine('正在连接服务器...');
}

// ============ Session 管理 ============

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

// ============ WebSocket 连接 ============

function connectWebSocket() {
    try {
        gameState.ws = new WebSocket(CONFIG.WS_URL);

        gameState.ws.onopen = () => {
            console.log('WebSocket 连接成功');
            gameState.connected = true;
            addTerminalLine('✓ 服务器连接成功');

            // 发送初始化消息
            sendWSMessage({
                type: 'init',
                sessionId: gameState.sessionId,
                username: gameState.username,
                country: gameState.country
            });

            // 开始心跳
            startHeartbeat();
        };

        gameState.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleWSMessage(data);
            } catch (error) {
                console.error('处理 WebSocket 消息失败:', error);
            }
        };

        gameState.ws.onclose = () => {
            console.log('WebSocket 连接关闭');
            gameState.connected = false;
            addTerminalLine('⚠ 服务器连接断开');

            // 5秒后重连
            setTimeout(() => {
                addTerminalLine('尝试重新连接...');
                connectWebSocket();
            }, 5000);
        };

        gameState.ws.onerror = (error) => {
            console.error('WebSocket 错误:', error);
            addTerminalLine('✗ 连接错误');
        };
    } catch (error) {
        console.error('创建 WebSocket 连接失败:', error);
        addTerminalLine('✗ 无法连接到服务器');
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
            addTerminalLine('✓ 初始化成功');
            break;

        case 'pong':
            // 心跳响应
            break;

        case 'spin_event':
            // 其他用户旋转事件
            if (Math.random() < 0.1) { // 10% 概率显示
                addTerminalLine(`🌍 ${data.username} 旋转速度: ${Math.round(data.speed)} RPM`);
            }
            break;

        case 'stats_update':
            updateGlobalStats(data.stats);
            break;

        case 'online_count':
            elements.userCount.textContent = `${data.count} 人在线 (${data.countries} 个国家)`;
            break;

        case 'chat_message':
            // 聊天消息（可以扩展聊天UI）
            addTerminalLine(`💬 ${data.username}: ${data.message}`);
            break;

        case 'leaderboard_update':
            updateLeaderboard(data.leaderboardType, data.data);
            break;

        case 'events_update':
            updateEvents(data.events);
            break;

        default:
            console.log('未知消息类型:', data.type);
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

// ============ API 调用 ============

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
        console.error('API 调用失败:', error);
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
        gameState.totalSpins = data.stats.total_spins;
        gameState.maxSpeed = data.stats.max_speed;
        updateStats();
    }

    // 通过 WebSocket 广播
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
        gameState.maxSpeed = data.max_speed || 0;
        updateStats();
    }

    // 定期更新
    setInterval(async () => {
        const globalData = await apiCall('/stats/global');
        if (globalData) {
            updateGlobalStats(globalData);
        }
    }, CONFIG.STATS_UPDATE_INTERVAL);
}

// ============ 游戏逻辑 ============

function loadGameData() {
    const savedData = localStorage.getItem('spinningCatData');
    if (savedData) {
        const data = JSON.parse(savedData);
        gameState.username = data.username;
        gameState.currentTheme = data.theme || 'light';
        applyTheme(gameState.currentTheme);
    }
}

function saveGameData() {
    const data = {
        username: gameState.username,
        theme: gameState.currentTheme
    };
    localStorage.setItem('spinningCatData', JSON.stringify(data));
}

function setupEventListeners() {
    // 旋转按钮
    elements.spinButton.addEventListener('mousedown', startSpinning);
    elements.spinButton.addEventListener('mouseup', stopSpinning);
    elements.spinButton.addEventListener('mouseleave', stopSpinning);
    elements.spinButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startSpinning();
    });
    elements.spinButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopSpinning();
    });

    // 模式切换
    elements.partyMode.addEventListener('change', (e) => {
        gameState.partyMode = e.target.checked;
        if (gameState.partyMode) {
            elements.catWrapper.classList.add('party-mode');
            addTerminalLine('🎉 狂欢模式已启动！');
            createPartyParticles();
        } else {
            elements.catWrapper.classList.remove('party-mode');
            addTerminalLine('狂欢模式已关闭');
        }
    });

    elements.turboMode.addEventListener('change', (e) => {
        gameState.turboMode = e.target.checked;
        addTerminalLine(gameState.turboMode ? '⚡ 加速模式已启动！' : '加速模式已关闭');
    });

    elements.soundMode.addEventListener('change', (e) => {
        gameState.soundMode = e.target.checked;
        addTerminalLine(gameState.soundMode ? '🔊 音效已开启' : '🔇 音效已关闭');
    });

    // 主题切换
    elements.themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            elements.themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    elements.themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // 混音选择
    elements.remixSelect.addEventListener('change', (e) => {
        gameState.currentRemix = e.target.value;
        addTerminalLine(`🎵 切换到: ${e.target.options[e.target.selectedIndex].text}`);
    });
}

function startSpinning() {
    if (gameState.isSpinning) return;

    gameState.isSpinning = true;
    gameState.lastTime = Date.now();
    gameState.spinStartTime = Date.now();
    elements.spinButton.classList.add('active');

    addTerminalLine('开始旋转... 🔄');
}

function stopSpinning() {
    if (!gameState.isSpinning) return;

    gameState.isSpinning = false;
    elements.spinButton.classList.remove('active');

    const duration = (Date.now() - gameState.spinStartTime) / 1000;

    // 记录旋转
    if (gameState.currentSpeed > 10 && duration > 0.5) {
        gameState.sessionSpins++;
        updateStats();

        // 发送到服务器
        recordSpinToServer(gameState.currentSpeed, duration);

        addTerminalLine(`完成旋转 - 速度: ${Math.round(gameState.currentSpeed)} RPM, 时长: ${duration.toFixed(1)}s`);

        if (gameState.sessionSpins % 10 === 0) {
            addTerminalLine(`🎊 里程碑: ${gameState.sessionSpins} 次旋转！`);
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
            const baseAcceleration = gameState.turboMode ? 800 : 400;
            gameState.acceleration = baseAcceleration;
            gameState.currentSpeed += gameState.acceleration * deltaTime;

            const maxSpeed = gameState.turboMode ? 1000 : 500;
            if (gameState.currentSpeed > maxSpeed) {
                gameState.currentSpeed = maxSpeed;
            }
        } else {
            const deceleration = 200;
            gameState.currentSpeed -= deceleration * deltaTime;
            if (gameState.currentSpeed < 0) {
                gameState.currentSpeed = 0;
            }
        }

        if (gameState.currentSpeed > 0) {
            const rotationSpeed = gameState.currentSpeed * 6;
            gameState.rotation += rotationSpeed * deltaTime;
            gameState.rotation %= 360;

            elements.cat.style.transform = `rotate(${gameState.rotation}deg)`;
        }

        elements.currentSpeed.textContent = Math.round(gameState.currentSpeed);

        if (gameState.partyMode && gameState.isSpinning && Math.random() < 0.1) {
            createParticle();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

function applyTheme(theme) {
    gameState.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);

    const icons = { light: '☀️', dark: '🌙', rainbow: '🌈' };
    elements.themeToggle.textContent = icons[theme] || '🌙';

    addTerminalLine(`主题已切换: ${theme}`);
    saveGameData();
}

function updateStats() {
    elements.sessionSpins.textContent = gameState.sessionSpins;
    elements.totalSpins.textContent = gameState.totalSpins;
    elements.maxSpeed.textContent = Math.round(gameState.maxSpeed);
}

function updateGlobalStats(stats) {
    if (stats.today) {
        // 可以更新今日统计显示
    }
}

function updateLeaderboard(type, data) {
    // 更新排行榜显示（可以扩展UI）
    console.log('Leaderboard update:', type, data);
}

function updateEvents(events) {
    // 更新事件显示（可以扩展UI）
    console.log('Events update:', events);
}

// ============ UI 辅助函数 ============

function addTerminalLine(text) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.textContent = text;
    elements.terminal.appendChild(line);

    while (elements.terminal.children.length > 10) {
        elements.terminal.removeChild(elements.terminal.firstChild);
    }

    elements.terminal.scrollTop = elements.terminal.scrollHeight;
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const colors = ['#ff6b9d', '#c44569', '#4facfe', '#00f2fe', '#feca57', '#ff9ff3'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = '-10px';
    particle.style.animationDuration = (Math.random() * 2 + 2) + 's';

    elements.particles.appendChild(particle);

    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 4000);
}

function createPartyParticles() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createParticle(), i * 100);
    }
}

function createCelebrationParticles() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createParticle(), i * 50);
    }
}

// ============ 国家检测 ============

async function detectCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        gameState.country = data.country_code || 'Unknown';
        addTerminalLine(`📍 位置: ${data.country_name || 'Unknown'}`);
    } catch (error) {
        console.error('检测国家失败:', error);
        gameState.country = 'Unknown';
    }
}

// ============ 键盘快捷键 ============

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState.isSpinning) {
            stopSpinning();
        } else {
            startSpinning();
        }
    }

    if (e.code === 'KeyP') {
        elements.partyMode.checked = !elements.partyMode.checked;
        elements.partyMode.dispatchEvent(new Event('change'));
    }

    if (e.code === 'KeyT') {
        elements.turboMode.checked = !elements.turboMode.checked;
        elements.turboMode.dispatchEvent(new Event('change'));
    }

    if (e.code === 'KeyS') {
        elements.soundMode.checked = !elements.soundMode.checked;
        elements.soundMode.dispatchEvent(new Event('change'));
    }
});

// ============ 彩蛋 ============

let logoClickCount = 0;
let logoClickTimer = null;

document.querySelector('.logo').addEventListener('click', () => {
    logoClickCount++;

    if (logoClickTimer) clearTimeout(logoClickTimer);
    logoClickTimer = setTimeout(() => logoClickCount = 0, 2000);

    if (logoClickCount === 10) {
        addTerminalLine('🎉 彩蛋触发！超级狂欢模式！');
        elements.partyMode.checked = true;
        elements.turboMode.checked = true;
        elements.soundMode.checked = true;
        elements.partyMode.dispatchEvent(new Event('change'));
        elements.turboMode.dispatchEvent(new Event('change'));
        elements.soundMode.dispatchEvent(new Event('change'));
        applyTheme('rainbow');
        createCelebrationParticles();
        logoClickCount = 0;
    }
});

// ============ 页面加载初始化 ============

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

console.log('%c🐱 Spinning Cat v2.0', 'font-size: 20px; font-weight: bold; color: #ff6b9d;');
console.log('%c全栈版本 - 支持实时多人在线', 'font-size: 14px; color: #c44569;');
