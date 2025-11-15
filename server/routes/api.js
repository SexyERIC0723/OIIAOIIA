const express = require('express');
const router = express.Router();

module.exports = (db) => {
    // ============ 统计 API ============

    // 获取全局统计
    router.get('/stats/global', async (req, res) => {
        try {
            const stats = await db.getGlobalStats();
            res.json(stats);
        } catch (error) {
            console.error('获取全局统计失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 获取今日统计
    router.get('/stats/today', async (req, res) => {
        try {
            const stats = await db.getTodayStats();
            res.json(stats);
        } catch (error) {
            console.error('获取今日统计失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 获取用户统计
    router.get('/stats/user/:sessionId', async (req, res) => {
        try {
            const stats = await db.getUserStats(req.params.sessionId);
            if (stats) {
                res.json(stats);
            } else {
                res.json({
                    total_spins: 0,
                    max_speed: 0,
                    total_time: 0
                });
            }
        } catch (error) {
            console.error('获取用户统计失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // ============ 旋转 API ============

    // 记录旋转
    router.post('/spin', async (req, res) => {
        try {
            const { sessionId, speed, duration, username, country } = req.body;

            if (!sessionId || speed === undefined || duration === undefined) {
                return res.status(400).json({ error: '缺少必要参数' });
            }

            // 创建或更新用户
            await db.createOrUpdateUser(sessionId, username, country, req.ip);

            // 记录旋转
            const stats = await db.recordSpin(sessionId, speed, duration);

            res.json({
                success: true,
                stats
            });
        } catch (error) {
            console.error('记录旋转失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // ============ 排行榜 API ============

    // 获取每日排行榜
    router.get('/leaderboard/daily', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const leaderboard = await db.getDailyLeaderboard(limit);
            res.json(leaderboard);
        } catch (error) {
            console.error('获取每日排行榜失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 获取总排行榜
    router.get('/leaderboard/all-time', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const leaderboard = await db.getAllTimeLeaderboard(limit);
            res.json(leaderboard);
        } catch (error) {
            console.error('获取总排行榜失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 获取速度排行榜
    router.get('/leaderboard/speed', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const leaderboard = await db.getSpeedLeaderboard(limit);
            res.json(leaderboard);
        } catch (error) {
            console.error('获取速度排行榜失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // ============ 聊天 API ============

    // 获取聊天消息
    router.get('/chat/messages', async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const messages = await db.getChatMessages(limit, offset);
            res.json(messages);
        } catch (error) {
            console.error('获取聊天消息失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 发送聊天消息
    router.post('/chat/message', async (req, res) => {
        try {
            const { sessionId, message, username } = req.body;

            if (!sessionId || !message) {
                return res.status(400).json({ error: '缺少必要参数' });
            }

            // 消息长度限制
            if (message.length > 500) {
                return res.status(400).json({ error: '消息过长' });
            }

            // 更新用户信息
            if (username) {
                await db.createOrUpdateUser(sessionId, username, null, req.ip);
            }

            const chatMessage = await db.addChatMessage(sessionId, message);
            res.json(chatMessage);
        } catch (error) {
            console.error('发送聊天消息失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // ============ 用户 API ============

    // 创建或更新用户
    router.post('/user', async (req, res) => {
        try {
            const { sessionId, username, country } = req.body;

            if (!sessionId) {
                return res.status(400).json({ error: '缺少 sessionId' });
            }

            const user = await db.createOrUpdateUser(sessionId, username, country, req.ip);
            const stats = await db.getUserStats(sessionId);

            res.json({
                success: true,
                user,
                stats
            });
        } catch (error) {
            console.error('创建/更新用户失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 获取用户信息
    router.get('/user/:sessionId', async (req, res) => {
        try {
            const user = await db.getUserBySessionId(req.params.sessionId);
            if (user) {
                const stats = await db.getUserStats(req.params.sessionId);
                res.json({ user, stats });
            } else {
                res.status(404).json({ error: '用户不存在' });
            }
        } catch (error) {
            console.error('获取用户信息失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // ============ 在线用户 API ============

    // 更新在线状态
    router.post('/online/ping', async (req, res) => {
        try {
            const { sessionId, username, country } = req.body;

            if (!sessionId) {
                return res.status(400).json({ error: '缺少 sessionId' });
            }

            await db.updateOnlineUser(sessionId, username, country);
            res.json({ success: true });
        } catch (error) {
            console.error('更新在线状态失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 获取在线用户列表
    router.get('/online/users', async (req, res) => {
        try {
            const users = await db.getOnlineUsers();
            res.json(users);
        } catch (error) {
            console.error('获取在线用户失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // ============ 事件 API ============

    // 获取活动事件
    router.get('/events', async (req, res) => {
        try {
            const events = await db.getActiveEvents();
            res.json(events);
        } catch (error) {
            console.error('获取事件失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // 创建事件（管理员）
    router.post('/events', async (req, res) => {
        try {
            const { eventType, title, description, startDate, endDate } = req.body;

            if (!eventType || !title) {
                return res.status(400).json({ error: '缺少必要参数' });
            }

            const result = await db.createEvent(eventType, title, description, startDate, endDate);
            res.json({ success: true, id: result.id });
        } catch (error) {
            console.error('创建事件失败:', error);
            res.status(500).json({ error: '服务器错误' });
        }
    });

    // ============ 健康检查 ============

    router.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    return router;
};
