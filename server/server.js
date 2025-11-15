const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const cors = require('cors');
const Database = require('./database');
const apiRoutes = require('./routes/api');

// 初始化 Express 应用
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 初始化数据库
const db = new Database();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static(path.join(__dirname, '../public')));

// API 路由
app.use('/api', apiRoutes(db));

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============ WebSocket 处理 ============

// 存储连接的客户端
const clients = new Map();

wss.on('connection', (ws, req) => {
    console.log('新的 WebSocket 连接');

    let sessionId = null;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'init':
                    // 初始化连接
                    sessionId = data.sessionId;
                    clients.set(sessionId, ws);

                    // 更新在线状态
                    await db.updateOnlineUser(sessionId, data.username, data.country);

                    // 发送当前在线用户数
                    broadcastOnlineCount();

                    ws.send(JSON.stringify({
                        type: 'init_success',
                        sessionId
                    }));
                    break;

                case 'ping':
                    // 心跳包
                    if (sessionId) {
                        await db.updateOnlineUser(sessionId, data.username, data.country);
                    }
                    ws.send(JSON.stringify({ type: 'pong' }));
                    break;

                case 'spin':
                    // 广播旋转事件
                    if (sessionId) {
                        await db.recordSpin(sessionId, data.speed, data.duration);

                        // 广播给所有客户端
                        broadcast({
                            type: 'spin_event',
                            username: data.username || 'Anonymous',
                            country: data.country,
                            speed: data.speed
                        });

                        // 更新全局统计
                        const globalStats = await db.getGlobalStats();
                        broadcast({
                            type: 'stats_update',
                            stats: globalStats
                        });
                    }
                    break;

                case 'chat':
                    // 聊天消息
                    if (sessionId && data.message) {
                        const chatMessage = await db.addChatMessage(sessionId, data.message);

                        // 广播聊天消息
                        broadcast({
                            type: 'chat_message',
                            id: chatMessage.id,
                            username: chatMessage.username,
                            message: chatMessage.message,
                            created_at: chatMessage.created_at
                        });
                    }
                    break;

                case 'request_leaderboard':
                    // 请求排行榜
                    const leaderboardType = data.leaderboardType || 'daily';
                    let leaderboard;

                    if (leaderboardType === 'daily') {
                        leaderboard = await db.getDailyLeaderboard(50);
                    } else if (leaderboardType === 'all-time') {
                        leaderboard = await db.getAllTimeLeaderboard(50);
                    } else if (leaderboardType === 'speed') {
                        leaderboard = await db.getSpeedLeaderboard(50);
                    }

                    ws.send(JSON.stringify({
                        type: 'leaderboard_update',
                        leaderboardType,
                        data: leaderboard
                    }));
                    break;

                case 'request_events':
                    // 请求事件列表
                    const events = await db.getActiveEvents();
                    ws.send(JSON.stringify({
                        type: 'events_update',
                        events
                    }));
                    break;

                default:
                    console.log('未知消息类型:', data.type);
            }
        } catch (error) {
            console.error('处理 WebSocket 消息失败:', error);
        }
    });

    ws.on('close', () => {
        console.log('WebSocket 连接关闭');
        if (sessionId) {
            clients.delete(sessionId);
            broadcastOnlineCount();
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket 错误:', error);
    });
});

// 广播消息给所有客户端
function broadcast(data) {
    const message = JSON.stringify(data);
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// 广播在线用户数
async function broadcastOnlineCount() {
    try {
        const stats = await db.getGlobalStats();
        broadcast({
            type: 'online_count',
            count: stats.online_users,
            countries: stats.unique_countries
        });
    } catch (error) {
        console.error('广播在线用户数失败:', error);
    }
}

// ============ 定时任务 ============

// 每分钟清理不活跃用户
setInterval(async () => {
    try {
        await db.cleanupInactiveUsers();
        broadcastOnlineCount();
    } catch (error) {
        console.error('清理不活跃用户失败:', error);
    }
}, 60000);

// 每小时清理旧数据
setInterval(async () => {
    try {
        await db.cleanupOldData();
    } catch (error) {
        console.error('清理旧数据失败:', error);
    }
}, 3600000);

// 每10秒广播全局统计
setInterval(async () => {
    try {
        const globalStats = await db.getGlobalStats();
        const todayStats = await db.getTodayStats();

        broadcast({
            type: 'stats_update',
            stats: {
                ...globalStats,
                today: todayStats
            }
        });
    } catch (error) {
        console.error('广播统计数据失败:', error);
    }
}, 10000);

// ============ 错误处理 ============

app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({ error: '未找到资源' });
});

// ============ 启动服务器 ============

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║                                        ║
║   🐱 Spinning Cat Server 已启动！     ║
║                                        ║
║   服务器地址: http://localhost:${PORT}    ║
║   WebSocket: ws://localhost:${PORT}       ║
║                                        ║
╚════════════════════════════════════════╝
    `);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');

    // 关闭 WebSocket 服务器
    wss.close(() => {
        console.log('✓ WebSocket 服务器已关闭');
    });

    // 关闭数据库连接
    db.close();

    // 关闭 HTTP 服务器
    server.close(() => {
        console.log('✓ HTTP 服务器已关闭');
        process.exit(0);
    });
});

module.exports = { app, server, wss, db };
