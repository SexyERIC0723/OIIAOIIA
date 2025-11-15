# 🐱 Spinning Cat - 全栈版

完整复刻 [spinning.cat](https://spinning.cat/) 的全栈应用，包含前端、后端、数据库和实时多人在线功能！

## ⭐ 特性

### 🎮 完整的游戏功能
- **旋转系统**: 物理模拟的平滑旋转动画
- **速度追踪**: 实时显示和记录旋转速度
- **统计系统**: 本地和全局统计数据
- **数据持久化**: SQLite 数据库存储所有数据

### 🌐 实时多人在线
- **WebSocket 连接**: 实时双向通信
- **在线用户追踪**: 显示当前在线人数和国家分布
- **实时事件广播**: 看到其他玩家的旋转活动
- **心跳机制**: 自动维持连接和清理离线用户

### 🏆 排行榜系统
- **每日排行榜**: 当天的旋转次数排名
- **总排行榜**: 历史累计旋转次数
- **速度排行榜**: 最高速度记录
- **实时更新**: WebSocket 自动推送排行榜变化

### 💬 聊天系统
- **实时聊天**: 与其他在线玩家交流
- **消息持久化**: 聊天记录保存在数据库
- **消息广播**: 所有在线用户即时接收消息

### 📊 统计功能
- **全局统计**: 总旋转次数、最高速度等
- **用户统计**: 个人历史记录
- **今日统计**: 当天的活动数据
- **国家统计**: 按国家分布的用户数据

### 🎨 界面功能
- **三种主题**: 浅色、深色、彩虹主题
- **狂欢模式**: 炫彩粒子效果
- **加速模式**: 提升速度上限
- **音效模式**: 可扩展的音效系统
- **响应式设计**: 完美支持移动设备

## 🏗️ 技术架构

### 前端
- **HTML5**: 语义化页面结构
- **CSS3**: 现代样式和动画
- **Vanilla JavaScript**: 纯原生 JS，无框架依赖
- **WebSocket Client**: 实时通信客户端

### 后端
- **Node.js**: 运行时环境
- **Express**: Web 框架
- **WebSocket (ws)**: 实时通信服务器
- **SQLite3**: 嵌入式数据库

### 数据库设计
- **users**: 用户信息表
- **spins**: 旋转记录表
- **user_stats**: 用户统计表
- **global_stats**: 全局统计表
- **daily_leaderboard**: 每日排行榜
- **all_time_leaderboard**: 总排行榜
- **chat_messages**: 聊天消息表
- **events**: 事件表
- **online_users**: 在线用户表

## 📁 项目结构

```
spinning-cat/
├── server/
│   ├── server.js          # 主服务器（Express + WebSocket）
│   ├── database.js        # 数据库操作封装
│   ├── routes/
│   │   └── api.js         # RESTful API 路由
│   └── models/
│       └── schema.sql     # 数据库架构定义
├── public/
│   ├── index.html         # 前端页面
│   ├── style.css          # 样式文件
│   └── app.js             # 前端逻辑（包含 WebSocket 客户端）
├── package.json           # 项目配置和依赖
├── start.sh              # 启动脚本
├── .gitignore            # Git 忽略文件
└── README.md             # 说明文档
```

## 🚀 快速开始

### 前置要求
- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装步骤

1. **克隆仓库**
```bash
git clone <repository-url>
cd OIIAOIIA
```

2. **安装依赖**
```bash
npm install
```

3. **启动服务器**
```bash
# 使用启动脚本
./start.sh

# 或直接使用 npm
npm start

# 开发模式（自动重启）
npm run dev
```

4. **访问应用**
打开浏览器访问: http://localhost:3000

## 📡 API 文档

### RESTful API

#### 统计接口
- `GET /api/stats/global` - 获取全局统计
- `GET /api/stats/today` - 获取今日统计
- `GET /api/stats/user/:sessionId` - 获取用户统计

#### 旋转接口
- `POST /api/spin` - 记录旋转
  ```json
  {
    "sessionId": "uuid",
    "speed": 123.45,
    "duration": 5.2,
    "username": "PlayerName",
    "country": "US"
  }
  ```

#### 排行榜接口
- `GET /api/leaderboard/daily` - 每日排行榜
- `GET /api/leaderboard/all-time` - 总排行榜
- `GET /api/leaderboard/speed` - 速度排行榜

#### 聊天接口
- `GET /api/chat/messages` - 获取聊天消息
- `POST /api/chat/message` - 发送聊天消息
  ```json
  {
    "sessionId": "uuid",
    "message": "Hello!",
    "username": "PlayerName"
  }
  ```

#### 用户接口
- `POST /api/user` - 创建/更新用户
- `GET /api/user/:sessionId` - 获取用户信息

#### 在线状态接口
- `POST /api/online/ping` - 更新在线状态
- `GET /api/online/users` - 获取在线用户列表

#### 事件接口
- `GET /api/events` - 获取活动事件
- `POST /api/events` - 创建事件（管理员）

### WebSocket 协议

#### 客户端 -> 服务器

```javascript
// 初始化连接
{
  "type": "init",
  "sessionId": "uuid",
  "username": "PlayerName",
  "country": "US"
}

// 心跳包
{
  "type": "ping",
  "username": "PlayerName",
  "country": "US"
}

// 旋转事件
{
  "type": "spin",
  "speed": 123.45,
  "duration": 5.2,
  "username": "PlayerName",
  "country": "US"
}

// 聊天消息
{
  "type": "chat",
  "message": "Hello!"
}

// 请求排行榜
{
  "type": "request_leaderboard",
  "leaderboardType": "daily" // daily | all-time | speed
}

// 请求事件列表
{
  "type": "request_events"
}
```

#### 服务器 -> 客户端

```javascript
// 初始化成功
{
  "type": "init_success",
  "sessionId": "uuid"
}

// 心跳响应
{
  "type": "pong"
}

// 旋转事件广播
{
  "type": "spin_event",
  "username": "PlayerName",
  "country": "US",
  "speed": 123.45
}

// 统计更新
{
  "type": "stats_update",
  "stats": { ... }
}

// 在线人数更新
{
  "type": "online_count",
  "count": 42,
  "countries": 15
}

// 聊天消息广播
{
  "type": "chat_message",
  "id": 123,
  "username": "PlayerName",
  "message": "Hello!",
  "created_at": "2024-01-01T00:00:00Z"
}

// 排行榜更新
{
  "type": "leaderboard_update",
  "leaderboardType": "daily",
  "data": [ ... ]
}

// 事件更新
{
  "type": "events_update",
  "events": [ ... ]
}
```

## ⌨️ 快捷键

- `空格键` - 开始/停止旋转
- `P` - 切换狂欢模式
- `T` - 切换加速模式
- `S` - 切换音效

## 🎁 彩蛋

连续点击页面左上角的 Logo 10 次，触发超级狂欢模式！

## 🛠️ 开发

### 数据库管理

数据库文件：`spinning_cat.db`

查看数据库：
```bash
sqlite3 spinning_cat.db
.tables
.schema
SELECT * FROM global_stats;
```

### 定时任务

- **每分钟**: 清理不活跃用户
- **每小时**: 清理旧数据（30天前的旋转记录等）
- **每10秒**: 广播全局统计更新

### 环境变量

可选环境变量：
```bash
PORT=3000  # 服务器端口，默认 3000
```

## 📊 性能优化

- 数据库索引优化查询性能
- WebSocket 连接池管理
- 定期清理过期数据
- 客户端本地缓存
- 响应式数据更新

## 🔒 安全性

- SQL 注入防护（使用参数化查询）
- XSS 防护（消息长度限制和转义）
- CORS 配置
- 速率限制（可扩展）
- Session 管理

## 🐛 故障排除

### WebSocket 连接失败
- 检查防火墙设置
- 确保端口 3000 未被占用
- 检查浏览器控制台错误信息

### 数据库错误
- 确保有写入权限
- 检查磁盘空间
- 查看服务器日志

### 性能问题
- 清理旧数据：定期运行清理任务
- 优化查询：检查数据库索引
- 调整 WebSocket 更新频率

## 📝 更新日志

### v2.0.0 - 全栈版本
- ✅ 完整的后端服务器
- ✅ SQLite 数据库集成
- ✅ WebSocket 实时通信
- ✅ RESTful API
- ✅ 排行榜系统
- ✅ 聊天系统
- ✅ 事件系统
- ✅ 在线用户追踪

### v1.0.0 - 初始版本
- ✅ 基础前端功能
- ✅ 旋转动画
- ✅ 本地存储

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- 灵感来源：[spinning.cat](https://spinning.cat/)
- 猫猫表情包：Google Noto Emoji

---

Made with ❤️ and 🐱

**Enjoy spinning with friends online!**

## 💡 未来计划

- [ ] 用户认证系统
- [ ] 成就系统
- [ ] 更多猫咪角色
- [ ] 音乐播放功能
- [ ] 社交分享功能
- [ ] 手机 App
- [ ] 全球地图显示在线用户
- [ ] 比赛模式
- [ ] 自定义皮肤
- [ ] 数据可视化图表
