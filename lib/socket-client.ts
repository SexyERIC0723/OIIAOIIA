// Socket.IO Client Hook for Frontend

'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from './websocket'

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'

    socket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect()
        socket = null
      }
    }
  }, [])

  return {
    socket,
    isConnected,
  }
}

// Emit helper for broadcasting from API routes (server-side)
export function emitToAll(event: string, data: any) {
  if (typeof window === 'undefined' && global.io) {
    global.io.emit(event, data)
  }
}

// Type augmentation for global io
declare global {
  var io: any
}
