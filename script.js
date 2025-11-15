// 游戏状态
const gameState = {
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
    acceleration: 0
};

// DOM 元素
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

// 初始化
function init() {
    loadGameData();
    setupEventListeners();
    updateStats();
    startAnimationLoop();
    simulateOnlineUsers();
    addTerminalLine('系统初始化完成 ✓');
    addTerminalLine('猫猫已准备就绪 🐱');
}

// 加载游戏数据
function loadGameData() {
    const savedData = localStorage.getItem('spinningCatData');
    if (savedData) {
        const data = JSON.parse(savedData);
        gameState.totalSpins = data.totalSpins || 0;
        gameState.maxSpeed = data.maxSpeed || 0;
        gameState.currentTheme = data.theme || 'light';
        applyTheme(gameState.currentTheme);
    }
}

// 保存游戏数据
function saveGameData() {
    const data = {
        totalSpins: gameState.totalSpins,
        maxSpeed: gameState.maxSpeed,
        theme: gameState.currentTheme
    };
    localStorage.setItem('spinningCatData', JSON.stringify(data));
}

// 设置事件监听器
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
        playRemix(gameState.currentRemix);
    });

    // 语言选择
    elements.langSelect.addEventListener('change', (e) => {
        addTerminalLine(`🌍 语言已切换: ${e.target.options[e.target.selectedIndex].text}`);
    });
}

// 开始旋转
function startSpinning() {
    if (gameState.isSpinning) return;

    gameState.isSpinning = true;
    gameState.lastTime = Date.now();
    elements.spinButton.classList.add('active');

    addTerminalLine('开始旋转... 🔄');

    if (gameState.soundMode) {
        playSound('spin');
    }
}

// 停止旋转
function stopSpinning() {
    if (!gameState.isSpinning) return;

    gameState.isSpinning = false;
    elements.spinButton.classList.remove('active');

    // 增加旋转次数
    if (gameState.currentSpeed > 10) {
        gameState.sessionSpins++;
        gameState.totalSpins++;
        updateStats();
        saveGameData();

        addTerminalLine(`完成旋转 #${gameState.totalSpins} - 速度: ${Math.round(gameState.currentSpeed)} RPM`);

        if (gameState.totalSpins % 10 === 0) {
            addTerminalLine(`🎊 里程碑达成: ${gameState.totalSpins} 次旋转！`);
            createCelebrationParticles();
        }
    }
}

// 动画循环
function startAnimationLoop() {
    function animate() {
        const now = Date.now();
        const deltaTime = (now - gameState.lastTime) / 1000;
        gameState.lastTime = now;

        if (gameState.isSpinning) {
            // 加速
            const baseAcceleration = gameState.turboMode ? 800 : 400;
            gameState.acceleration = baseAcceleration;
            gameState.currentSpeed += gameState.acceleration * deltaTime;

            // 最大速度限制
            const maxSpeed = gameState.turboMode ? 1000 : 500;
            if (gameState.currentSpeed > maxSpeed) {
                gameState.currentSpeed = maxSpeed;
            }
        } else {
            // 减速
            const deceleration = 200;
            gameState.currentSpeed -= deceleration * deltaTime;
            if (gameState.currentSpeed < 0) {
                gameState.currentSpeed = 0;
            }
        }

        // 更新旋转
        if (gameState.currentSpeed > 0) {
            const rotationSpeed = gameState.currentSpeed * 6; // 转换为度/秒
            gameState.rotation += rotationSpeed * deltaTime;
            gameState.rotation %= 360;

            elements.cat.style.transform = `rotate(${gameState.rotation}deg)`;
        }

        // 更新最高速度
        if (gameState.currentSpeed > gameState.maxSpeed) {
            gameState.maxSpeed = gameState.currentSpeed;
            saveGameData();
        }

        // 更新显示
        elements.currentSpeed.textContent = Math.round(gameState.currentSpeed);

        // 狂欢模式粒子效果
        if (gameState.partyMode && gameState.isSpinning && Math.random() < 0.1) {
            createParticle();
        }

        requestAnimationFrame(animate);
    }

    animate();
}

// 应用主题
function applyTheme(theme) {
    gameState.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);

    // 更新主题切换按钮图标
    const icons = { light: '☀️', dark: '🌙', rainbow: '🌈' };
    elements.themeToggle.textContent = icons[theme] || '🌙';

    addTerminalLine(`主题已切换: ${theme}`);
    saveGameData();
}

// 更新统计信息
function updateStats() {
    elements.sessionSpins.textContent = gameState.sessionSpins;
    elements.totalSpins.textContent = gameState.totalSpins;
    elements.maxSpeed.textContent = Math.round(gameState.maxSpeed);
}

// 添加终端日志
function addTerminalLine(text) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    line.textContent = text;
    elements.terminal.appendChild(line);

    // 保持最多显示 10 行
    while (elements.terminal.children.length > 10) {
        elements.terminal.removeChild(elements.terminal.firstChild);
    }

    // 滚动到底部
    elements.terminal.scrollTop = elements.terminal.scrollHeight;
}

// 创建粒子
function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const colors = ['#ff6b9d', '#c44569', '#4facfe', '#00f2fe', '#feca57', '#ff9ff3'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = '-10px';
    particle.style.animationDuration = (Math.random() * 2 + 2) + 's';

    elements.particles.appendChild(particle);

    // 动画结束后移除
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 4000);
}

// 狂欢模式粒子效果
function createPartyParticles() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createParticle(), i * 100);
    }
}

// 庆祝粒子效果
function createCelebrationParticles() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createParticle(), i * 50);
    }
}

// 播放音效（模拟）
function playSound(soundType) {
    // 这里可以添加实际的音频播放代码
    console.log(`Playing sound: ${soundType}`);
}

// 播放混音（模拟）
function playRemix(remix) {
    // 这里可以添加实际的音乐播放代码
    console.log(`Playing remix: ${remix}`);
}

// 模拟在线用户数
function simulateOnlineUsers() {
    function updateUserCount() {
        const baseUsers = 1337;
        const variance = Math.floor(Math.random() * 200 - 100);
        const userCount = baseUsers + variance;
        elements.userCount.textContent = `${userCount} 人在线`;
    }

    updateUserCount();
    setInterval(updateUserCount, 5000);
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // 空格键开始/停止旋转
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState.isSpinning) {
            stopSpinning();
        } else {
            startSpinning();
        }
    }

    // P 键切换狂欢模式
    if (e.code === 'KeyP') {
        elements.partyMode.checked = !elements.partyMode.checked;
        elements.partyMode.dispatchEvent(new Event('change'));
    }

    // T 键切换加速模式
    if (e.code === 'KeyT') {
        elements.turboMode.checked = !elements.turboMode.checked;
        elements.turboMode.dispatchEvent(new Event('change'));
    }

    // S 键切换音效
    if (e.code === 'KeyS') {
        elements.soundMode.checked = !elements.soundMode.checked;
        elements.soundMode.dispatchEvent(new Event('change'));
    }
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 彩蛋：连续点击 logo 10 次
let logoClickCount = 0;
let logoClickTimer = null;

document.querySelector('.logo').addEventListener('click', () => {
    logoClickCount++;

    if (logoClickTimer) {
        clearTimeout(logoClickTimer);
    }

    logoClickTimer = setTimeout(() => {
        logoClickCount = 0;
    }, 2000);

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

// 导出游戏状态（调试用）
window.spinningCat = {
    getState: () => gameState,
    resetStats: () => {
        gameState.sessionSpins = 0;
        gameState.totalSpins = 0;
        gameState.maxSpeed = 0;
        updateStats();
        saveGameData();
        addTerminalLine('统计数据已重置');
    },
    addSpins: (count) => {
        gameState.totalSpins += count;
        updateStats();
        saveGameData();
        addTerminalLine(`已添加 ${count} 次旋转`);
    }
};

console.log('%c🐱 Spinning Cat v1.0', 'font-size: 20px; font-weight: bold; color: #ff6b9d;');
console.log('%c欢迎来到旋转猫猫！', 'font-size: 14px; color: #c44569;');
console.log('快捷键:');
console.log('  空格键 - 开始/停止旋转');
console.log('  P - 切换狂欢模式');
console.log('  T - 切换加速模式');
console.log('  S - 切换音效');
console.log('\n调试命令:');
console.log('  window.spinningCat.getState() - 获取游戏状态');
console.log('  window.spinningCat.resetStats() - 重置统计');
console.log('  window.spinningCat.addSpins(n) - 添加旋转次数');
