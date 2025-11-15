const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

class Database {
    constructor(dbPath = './spinning_cat.db') {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('数据库连接失败:', err);
            } else {
                console.log('✓ 数据库连接成功');
                this.initialize();
            }
        });
    }

    // 初始化数据库
    initialize() {
        const schemaPath = path.join(__dirname, 'models', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        this.db.exec(schema, (err) => {
            if (err) {
                console.error('数据库初始化失败:', err);
            } else {
                console.log('✓ 数据库表结构已就绪');
            }
        });
    }

    // 通用查询方法
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // ============ 用户相关 ============

    async createOrUpdateUser(sessionId, username = null, country = null, ipAddress = null) {
        const sql = `
            INSERT INTO users (session_id, username, country, ip_address, last_active)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(session_id) DO UPDATE SET
                username = COALESCE(?, username),
                country = COALESCE(?, country),
                last_active = CURRENT_TIMESTAMP
            RETURNING id
        `;
        return await this.get(sql, [sessionId, username, country, ipAddress, username, country]);
    }

    async getUserBySessionId(sessionId) {
        return await this.get('SELECT * FROM users WHERE session_id = ?', [sessionId]);
    }

    // ============ 旋转相关 ============

    async recordSpin(sessionId, speed, duration) {
        const user = await this.getUserBySessionId(sessionId);
        const userId = user ? user.id : null;

        // 记录旋转
        await this.run(
            'INSERT INTO spins (user_id, session_id, speed, duration) VALUES (?, ?, ?, ?)',
            [userId, sessionId, speed, duration]
        );

        // 更新用户统计
        await this.run(`
            INSERT INTO user_stats (user_id, session_id, total_spins, max_speed, total_time, last_spin)
            VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(session_id) DO UPDATE SET
                total_spins = total_spins + 1,
                max_speed = MAX(max_speed, ?),
                total_time = total_time + ?,
                last_spin = CURRENT_TIMESTAMP
        `, [userId, sessionId, speed, duration, speed, duration]);

        // 更新全局统计
        await this.run(`
            UPDATE global_stats SET
                total_spins = total_spins + 1,
                max_speed_ever = MAX(max_speed_ever, ?),
                last_updated = CURRENT_TIMESTAMP
            WHERE id = 1
        `, [speed]);

        // 更新每日排行榜
        await this.updateDailyLeaderboard(sessionId, speed);

        // 更新总排行榜
        await this.updateAllTimeLeaderboard(sessionId, speed);

        return await this.getUserStats(sessionId);
    }

    async getUserStats(sessionId) {
        return await this.get(`
            SELECT
                us.*,
                u.username,
                u.country
            FROM user_stats us
            LEFT JOIN users u ON u.session_id = us.session_id
            WHERE us.session_id = ?
        `, [sessionId]);
    }

    async getGlobalStats() {
        const stats = await this.get('SELECT * FROM global_stats WHERE id = 1');
        const onlineCount = await this.get('SELECT COUNT(*) as count FROM online_users WHERE last_ping >= datetime("now", "-30 seconds")');
        const uniqueCountries = await this.get('SELECT COUNT(DISTINCT country) as count FROM online_users WHERE last_ping >= datetime("now", "-30 seconds")');

        return {
            ...stats,
            online_users: onlineCount.count,
            unique_countries: uniqueCountries.count
        };
    }

    async getTodayStats() {
        const result = await this.get(`
            SELECT COUNT(*) as count, COALESCE(SUM(spins_count), 0) as total_spins
            FROM daily_leaderboard
            WHERE date = date('now')
        `);
        return result;
    }

    // ============ 排行榜相关 ============

    async updateDailyLeaderboard(sessionId, speed) {
        const user = await this.getUserBySessionId(sessionId);

        await this.run(`
            INSERT INTO daily_leaderboard (user_id, session_id, username, country, spins_count, max_speed, date)
            VALUES (?, ?, ?, ?, 1, ?, date('now'))
            ON CONFLICT(session_id, date) DO UPDATE SET
                spins_count = spins_count + 1,
                max_speed = MAX(max_speed, ?)
        `, [user?.id, sessionId, user?.username || 'Anonymous', user?.country, speed, speed]);
    }

    async updateAllTimeLeaderboard(sessionId, speed) {
        const user = await this.getUserBySessionId(sessionId);

        await this.run(`
            INSERT INTO all_time_leaderboard (user_id, session_id, username, country, total_spins, max_speed)
            VALUES (?, ?, ?, ?, 1, ?)
            ON CONFLICT(session_id) DO UPDATE SET
                total_spins = total_spins + 1,
                max_speed = MAX(max_speed, ?)
        `, [user?.id, sessionId, user?.username || 'Anonymous', user?.country, speed, speed]);
    }

    async getDailyLeaderboard(limit = 100) {
        return await this.all(`
            SELECT
                username,
                country,
                spins_count,
                max_speed,
                date
            FROM daily_leaderboard
            WHERE date = date('now')
            ORDER BY spins_count DESC, max_speed DESC
            LIMIT ?
        `, [limit]);
    }

    async getAllTimeLeaderboard(limit = 100) {
        return await this.all(`
            SELECT
                username,
                country,
                total_spins,
                max_speed
            FROM all_time_leaderboard
            ORDER BY total_spins DESC, max_speed DESC
            LIMIT ?
        `, [limit]);
    }

    async getSpeedLeaderboard(limit = 100) {
        return await this.all(`
            SELECT
                username,
                country,
                max_speed,
                total_spins
            FROM all_time_leaderboard
            ORDER BY max_speed DESC
            LIMIT ?
        `, [limit]);
    }

    // ============ 聊天相关 ============

    async addChatMessage(sessionId, message) {
        const user = await this.getUserBySessionId(sessionId);
        const username = user?.username || 'Anonymous';

        const result = await this.run(
            'INSERT INTO chat_messages (user_id, session_id, username, message) VALUES (?, ?, ?, ?)',
            [user?.id, sessionId, username, message]
        );

        return await this.get('SELECT * FROM chat_messages WHERE id = ?', [result.id]);
    }

    async getChatMessages(limit = 100, offset = 0) {
        return await this.all(`
            SELECT
                id,
                username,
                message,
                created_at
            FROM chat_messages
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `, [limit, offset]);
    }

    // ============ 在线用户相关 ============

    async updateOnlineUser(sessionId, username = null, country = null) {
        await this.run(`
            INSERT INTO online_users (session_id, username, country, last_ping)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(session_id) DO UPDATE SET
                username = COALESCE(?, username),
                country = COALESCE(?, country),
                last_ping = CURRENT_TIMESTAMP
        `, [sessionId, username, country, username, country]);
    }

    async getOnlineUsers() {
        return await this.all(`
            SELECT session_id, username, country
            FROM online_users
            WHERE last_ping >= datetime('now', '-30 seconds')
        `);
    }

    async cleanupInactiveUsers() {
        await this.run(`
            DELETE FROM online_users
            WHERE last_ping < datetime('now', '-1 minute')
        `);
    }

    // ============ 事件相关 ============

    async getActiveEvents() {
        return await this.all(`
            SELECT * FROM events
            WHERE is_active = 1
            AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
            AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
            ORDER BY created_at DESC
        `);
    }

    async createEvent(eventType, title, description, startDate = null, endDate = null) {
        return await this.run(
            'INSERT INTO events (event_type, title, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            [eventType, title, description, startDate, endDate]
        );
    }

    // ============ 清理任务 ============

    async cleanupOldData() {
        // 删除30天前的旋转记录
        await this.run(`DELETE FROM spins WHERE created_at < datetime('now', '-30 days')`);

        // 删除7天前的每日排行榜
        await this.run(`DELETE FROM daily_leaderboard WHERE date < date('now', '-7 days')`);

        // 删除30天前的聊天消息
        await this.run(`DELETE FROM chat_messages WHERE created_at < datetime('now', '-30 days')`);

        console.log('✓ 数据库清理完成');
    }

    close() {
        this.db.close((err) => {
            if (err) {
                console.error('关闭数据库失败:', err);
            } else {
                console.log('✓ 数据库连接已关闭');
            }
        });
    }
}

module.exports = Database;
