-- 数据库架构定义

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    session_id TEXT UNIQUE NOT NULL,
    country TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 旋转记录表
CREATE TABLE IF NOT EXISTS spins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT NOT NULL,
    speed REAL,
    duration REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 用户统计表
CREATE TABLE IF NOT EXISTS user_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    session_id TEXT UNIQUE NOT NULL,
    total_spins INTEGER DEFAULT 0,
    max_speed REAL DEFAULT 0,
    total_time REAL DEFAULT 0,
    last_spin DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 全局统计表
CREATE TABLE IF NOT EXISTS global_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    total_spins INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    max_speed_ever REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 排行榜表（每日）
CREATE TABLE IF NOT EXISTS daily_leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT NOT NULL,
    username TEXT,
    country TEXT,
    spins_count INTEGER DEFAULT 0,
    max_speed REAL DEFAULT 0,
    date DATE DEFAULT (date('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 排行榜表（总榜）
CREATE TABLE IF NOT EXISTS all_time_leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    session_id TEXT UNIQUE NOT NULL,
    username TEXT,
    country TEXT,
    total_spins INTEGER DEFAULT 0,
    max_speed REAL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    session_id TEXT NOT NULL,
    username TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 事件表
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATETIME,
    end_date DATETIME,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 在线用户表（临时数据）
CREATE TABLE IF NOT EXISTS online_users (
    session_id TEXT PRIMARY KEY,
    username TEXT,
    country TEXT,
    last_ping DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_spins_user_id ON spins(user_id);
CREATE INDEX IF NOT EXISTS idx_spins_session_id ON spins(session_id);
CREATE INDEX IF NOT EXISTS idx_spins_created_at ON spins(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_date ON daily_leaderboard(date);
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_spins ON daily_leaderboard(spins_count DESC);
CREATE INDEX IF NOT EXISTS idx_all_time_leaderboard_spins ON all_time_leaderboard(total_spins DESC);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_online_users_last_ping ON online_users(last_ping);

-- 初始化全局统计
INSERT OR IGNORE INTO global_stats (id, total_spins, total_users, max_speed_ever)
VALUES (1, 0, 0, 0);
