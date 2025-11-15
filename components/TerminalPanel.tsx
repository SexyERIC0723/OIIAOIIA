'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'

interface Stats {
  totalSpins: string
  todaySpins: string
  totalPlayers: number
  onlinePlayers: number
  spinsPerMin: number
}

interface Event {
  id: string
  type: string
  countryCode?: string
  data?: any
  createdAt: string
}

interface LeaderboardEntry {
  rank: number
  playerId: string
  totalSpins: string
  countryCode?: string
}

interface ChatMessage {
  id: string
  nickname: string
  message: string
  countryCode?: string
  createdAt: string
}

interface CountryStat {
  countryCode: string
  countryName: string
  totalSpins: string
  uniquePlayers: number
}

export default function TerminalPanel() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [countryStats, setCountryStats] = useState<CountryStat[]>([])
  const [activeTab, setActiveTab] = useState('stats')

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events?limit=20')
        const data = await res.json()
        setEvents(data.events || [])
      } catch (error) {
        console.error('Error fetching events:', error)
      }
    }

    fetchEvents()
    const interval = setInterval(fetchEvents, 10000)

    return () => clearInterval(interval)
  }, [])

  // Fetch leaderboard
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard?limit=10')
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      }
    }

    fetchLeaderboard()
    const interval = setInterval(fetchLeaderboard, 15000)

    return () => clearInterval(interval)
  }, [])

  // Fetch chat messages
  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await fetch('/api/chat?limit=30')
        const data = await res.json()
        setChatMessages(data.messages || [])
      } catch (error) {
        console.error('Error fetching chat:', error)
      }
    }

    fetchChat()
    const interval = setInterval(fetchChat, 5000)

    return () => clearInterval(interval)
  }, [])

  // Fetch country stats
  useEffect(() => {
    const fetchCountryStats = async () => {
      try {
        const res = await fetch('/api/country-stats')
        const data = await res.json()
        setCountryStats(data.countries || [])
      } catch (error) {
        console.error('Error fetching country stats:', error)
      }
    }

    fetchCountryStats()
    const interval = setInterval(fetchCountryStats, 20000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-terminal-bg border-2 border-terminal-border rounded-lg overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-terminal-border px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-terminal-text font-mono text-sm ml-2">
          SPIN-KITTY TERMINAL v1.0
        </span>
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        {/* Tab List */}
        <Tabs.List className="flex border-b border-terminal-border bg-terminal-bg/50">
          {['stats', 'events', 'leaderboard', 'chat', 'globe'].map((tab) => (
            <Tabs.Trigger
              key={tab}
              value={tab}
              className={`
                px-4 py-2 text-sm font-mono uppercase
                transition-colors duration-200
                ${
                  activeTab === tab
                    ? 'text-terminal-text bg-terminal-bg border-b-2 border-terminal-text'
                    : 'text-terminal-text/50 hover:text-terminal-text/80'
                }
              `}
            >
              {tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {/* Tab Content */}
        <div className="p-4 h-96 overflow-y-auto font-mono text-sm">
          {/* Stats Tab */}
          <Tabs.Content value="stats">
            {stats ? (
              <div className="space-y-3">
                <StatRow label="Total Spins" value={formatBigNumber(stats.totalSpins)} />
                <StatRow label="Today's Spins" value={formatBigNumber(stats.todaySpins)} />
                <StatRow label="Total Players" value={stats.totalPlayers.toLocaleString()} />
                <StatRow label="Online Now" value={stats.onlinePlayers.toString()} />
                <StatRow label="Spins/Min" value={stats.spinsPerMin.toString()} />
              </div>
            ) : (
              <div className="text-terminal-text/50">Loading stats...</div>
            )}
          </Tabs.Content>

          {/* Events Tab */}
          <Tabs.Content value="events">
            <div className="space-y-2">
              {events.length > 0 ? (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-terminal-text/80"
                  >
                    <span className="text-terminal-highlight">{'>'}</span>{' '}
                    [{new Date(event.createdAt).toLocaleTimeString()}]{' '}
                    {event.countryCode && `[${event.countryCode}]`} {event.type.toUpperCase()}
                    {event.data?.spinCount && ` - ${event.data.spinCount} spins`}
                  </motion.div>
                ))
              ) : (
                <div className="text-terminal-text/50">No recent events</div>
              )}
            </div>
          </Tabs.Content>

          {/* Leaderboard Tab */}
          <Tabs.Content value="leaderboard">
            <div className="space-y-2">
              <div className="text-terminal-highlight mb-3">TOP SPINNERS</div>
              {leaderboard.length > 0 ? (
                leaderboard.map((entry) => (
                  <div
                    key={entry.playerId}
                    className="flex justify-between text-terminal-text/80"
                  >
                    <span>
                      #{entry.rank} {entry.countryCode && `[${entry.countryCode}]`}{' '}
                      {entry.playerId.substring(0, 8)}...
                    </span>
                    <span className="text-terminal-highlight">
                      {formatBigNumber(entry.totalSpins)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-terminal-text/50">No data yet</div>
              )}
            </div>
          </Tabs.Content>

          {/* Chat Tab */}
          <Tabs.Content value="chat">
            <div className="space-y-2">
              {chatMessages.length > 0 ? (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="text-terminal-text/80">
                    <span className="text-terminal-highlight">
                      {msg.countryCode && `[${msg.countryCode}] `}
                      {msg.nickname}:
                    </span>{' '}
                    {msg.message}
                  </div>
                ))
              ) : (
                <div className="text-terminal-text/50">No messages yet. Be the first!</div>
              )}
            </div>
          </Tabs.Content>

          {/* Globe Tab */}
          <Tabs.Content value="globe">
            <div className="space-y-2">
              <div className="text-terminal-highlight mb-3">COUNTRIES</div>
              {countryStats.length > 0 ? (
                countryStats.slice(0, 15).map((country) => (
                  <div
                    key={country.countryCode}
                    className="flex justify-between text-terminal-text/80"
                  >
                    <span>
                      [{country.countryCode}] {country.countryName}
                    </span>
                    <span className="text-terminal-highlight">
                      {formatBigNumber(country.totalSpins)} ({country.uniquePlayers} players)
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-terminal-text/50">Loading country data...</div>
              )}
            </div>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  )
}

// Helper Components
function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-terminal-border/30">
      <span className="text-terminal-text/70">{label}:</span>
      <span className="text-terminal-highlight text-lg">{value}</span>
    </div>
  )
}

function formatBigNumber(num: string | number): string {
  const n = typeof num === 'string' ? parseInt(num) : num
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B'
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toString()
}
