// WebSocket Type Definitions and Events

export interface SpinEvent {
  type: 'spin'
  playerId: string
  spinCount: number
  speed: number
  raveMode: boolean
  countryCode?: string
  timestamp: string
}

export interface StatsUpdateEvent {
  type: 'stats'
  totalSpins: string // BigInt as string
  todaySpins: string
  onlinePlayers: number
  totalPlayers: number
}

export interface ChatMessageEvent {
  type: 'chat'
  id: string
  nickname: string
  message: string
  countryCode?: string
  timestamp: string
}

export interface PlayerJoinEvent {
  type: 'player_join'
  playerId: string
  countryCode?: string
  timestamp: string
}

export type WebSocketEvent =
  | SpinEvent
  | StatsUpdateEvent
  | ChatMessageEvent
  | PlayerJoinEvent

export interface ServerToClientEvents {
  spin: (data: SpinEvent) => void
  stats: (data: StatsUpdateEvent) => void
  chat: (data: ChatMessageEvent) => void
  player_join: (data: PlayerJoinEvent) => void
}

export interface ClientToServerEvents {
  join: (playerId: string) => void
  ping: () => void
}
