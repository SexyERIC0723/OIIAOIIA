// Custom Next.js Server with Socket.IO for Real-time Communication
// This file is used in production and development

const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  // Store active connections
  const activeConnections = new Map()

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Handle player join
    socket.on('join', (playerId) => {
      activeConnections.set(socket.id, playerId)
      console.log(`Player ${playerId} joined`)

      // Broadcast player join event
      io.emit('player_join', {
        type: 'player_join',
        playerId,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      const playerId = activeConnections.get(socket.id)
      if (playerId) {
        console.log(`Player ${playerId} disconnected`)
        activeConnections.delete(socket.id)
      }
    })

    // Ping-pong for keeping connection alive
    socket.on('ping', () => {
      socket.emit('pong')
    })
  })

  // Make io instance globally available for API routes
  global.io = io

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
      console.log(`> WebSocket server running`)
    })
})
