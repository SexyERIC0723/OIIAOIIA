'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type TabType = 'events' | 'spinners' | 'spins' | 'leaderboard' | 'chat' | 'globe'

interface Tab {
  id: TabType
  label: string
  icon: string
}

const tabs: Tab[] = [
  { id: 'events', label: 'Events', icon: '📡' },
  { id: 'spinners', label: 'Spinners', icon: '👥' },
  { id: 'spins', label: 'Spins', icon: '🔄' },
  { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'globe', label: 'Globe', icon: '🌍' },
]

interface TerminalPanelProps {
  children?: React.ReactNode
}

export default function TerminalPanel({ children }: TerminalPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('spins')

  return (
    <div className="w-full bg-terminal-bg border-2 border-terminal-border rounded-lg overflow-hidden shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-gradient-to-r from-terminal-border to-gray-900 px-4 py-3 border-b-2 border-terminal-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-4 font-mono text-terminal-text font-bold text-sm">
            🐱 KITTY TERMINAL v1.0
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto bg-gray-900 border-b border-terminal-border scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-shrink-0 px-4 md:px-6 py-3 font-mono text-sm font-bold
              transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-terminal-bg text-terminal-text border-b-2 border-terminal-text'
                : 'text-terminal-dim hover:text-terminal-text hover:bg-terminal-border'
              }
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal Content */}
      <div className="h-96 md:h-[500px] overflow-y-auto p-4 font-mono text-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'events' && <EventsTab />}
            {activeTab === 'spinners' && <SpinnersTab />}
            {activeTab === 'spins' && <SpinsTab />}
            {activeTab === 'leaderboard' && <LeaderboardTab />}
            {activeTab === 'chat' && <ChatTab />}
            {activeTab === 'globe' && <GlobeTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// Events Tab
function EventsTab() {
  const [events, setEvents] = useState([
    { id: 1, type: 'spin', user: 'SwiftSpinner#1234', country: 'US', spins: 150, timestamp: new Date() },
    { id: 2, type: 'join', user: 'MightyWhirler#5678', country: 'JP', timestamp: new Date(Date.now() - 60000) },
    { id: 3, type: 'milestone', user: 'BraveRotator#9012', country: 'DE', spins: 1000, timestamp: new Date(Date.now() - 120000) },
  ])

  return (
    <div className="space-y-2">
      <div className="text-terminal-accent mb-4">
        {'>'} Recent Events (Live Feed)
      </div>
      {events.map((event) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-terminal-text border-l-2 border-terminal-dim pl-3 py-1"
        >
          {event.type === 'spin' && (
            <span>
              <span className="text-terminal-accent">[SPIN]</span>{' '}
              <span className="text-white">{event.user}</span> from{' '}
              <span className="text-terminal-dim">{event.country}</span> spun{' '}
              <span className="text-terminal-text font-bold">{event.spins}</span> times
            </span>
          )}
          {event.type === 'join' && (
            <span>
              <span className="text-blue-400">[JOIN]</span>{' '}
              <span className="text-white">{event.user}</span> from{' '}
              <span className="text-terminal-dim">{event.country}</span> joined
            </span>
          )}
          {event.type === 'milestone' && (
            <span>
              <span className="text-yellow-400">[MILESTONE]</span>{' '}
              <span className="text-white">{event.user}</span> reached{' '}
              <span className="text-yellow-400 font-bold">{event.spins}</span> spins!
            </span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Spinners Tab
function SpinnersTab() {
  const [spinners, setSpinners] = useState([
    { id: 1, nickname: 'SwiftSpinner#1234', country: 'US', status: 'active', spins: 2340 },
    { id: 2, nickname: 'MightyWhirler#5678', country: 'JP', status: 'active', spins: 1890 },
    { id: 3, nickname: 'QuickTurner#3456', country: 'GB', status: 'idle', spins: 1234 },
  ])

  return (
    <div className="space-y-2">
      <div className="text-terminal-accent mb-4">
        {'>'} Active Spinners ({spinners.filter(s => s.status === 'active').length} online)
      </div>
      <div className="space-y-3">
        {spinners.map((spinner) => (
          <div
            key={spinner.id}
            className="flex justify-between items-center bg-terminal-border/30 p-3 rounded border border-terminal-border"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                spinner.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`} />
              <span className="text-white">{spinner.nickname}</span>
              <span className="text-terminal-dim text-xs">{spinner.country}</span>
            </div>
            <span className="text-terminal-text font-bold">{spinner.spins.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Spins Tab
function SpinsTab() {
  const stats = {
    total: 1234567890,
    today: 456789,
    perMinute: 1234,
    online: 42,
  }

  return (
    <div className="space-y-4">
      <div className="text-terminal-accent mb-4">
        {'>'} Global Statistics
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard label="Total Spins" value={stats.total.toLocaleString()} color="text-terminal-text" />
        <StatCard label="Today's Spins" value={stats.today.toLocaleString()} color="text-blue-400" />
        <StatCard label="Spins/Minute" value={stats.perMinute.toLocaleString()} color="text-yellow-400" />
        <StatCard label="Online Now" value={stats.online.toString()} color="text-green-400" />
      </div>
      <div className="mt-6 p-4 bg-terminal-border/20 rounded border border-terminal-dim">
        <div className="text-terminal-accent mb-2">System Status</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-terminal-dim">Database:</span>
            <span className="text-green-400">● Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-dim">Cache:</span>
            <span className="text-green-400">● Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-terminal-dim">WebSocket:</span>
            <span className="text-green-400">● Live</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Leaderboard Tab
function LeaderboardTab() {
  const [leaders, setLeaders] = useState([
    { rank: 1, nickname: 'LegendarySpinner#0001', country: 'KR', totalSpins: 9876543 },
    { rank: 2, nickname: 'MegaTwirler#0042', country: 'US', totalSpins: 8765432 },
    { rank: 3, nickname: 'UltraRotator#0099', country: 'JP', totalSpins: 7654321 },
    { rank: 4, nickname: 'SwiftSpinner#1234', country: 'DE', totalSpins: 6543210 },
    { rank: 5, nickname: 'MightyWhirler#5678', country: 'FR', totalSpins: 5432109 },
  ])

  return (
    <div className="space-y-2">
      <div className="text-terminal-accent mb-4">
        {'>'} Top Spinners of All Time
      </div>
      <div className="space-y-2">
        {leaders.map((leader) => (
          <div
            key={leader.rank}
            className={`flex items-center gap-4 p-3 rounded ${
              leader.rank <= 3
                ? 'bg-gradient-to-r from-yellow-900/20 to-transparent border-l-4 border-yellow-500'
                : 'bg-terminal-border/20'
            }`}
          >
            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
              leader.rank === 1 ? 'bg-yellow-500 text-black' :
              leader.rank === 2 ? 'bg-gray-400 text-black' :
              leader.rank === 3 ? 'bg-orange-700 text-white' :
              'bg-terminal-border text-terminal-dim'
            }`}>
              {leader.rank}
            </div>
            <div className="flex-1">
              <div className="text-white font-bold">{leader.nickname}</div>
              <div className="text-terminal-dim text-xs">{leader.country}</div>
            </div>
            <div className="text-terminal-text font-bold text-right">
              {leader.totalSpins.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Chat Tab
function ChatTab() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'SwiftSpinner#1234', message: 'This is amazing!', timestamp: new Date(), country: 'US' },
    { id: 2, user: 'MightyWhirler#5678', message: 'Can\'t stop spinning!', timestamp: new Date(), country: 'JP' },
  ])
  const [newMessage, setNewMessage] = useState('')

  return (
    <div className="flex flex-col h-full">
      <div className="text-terminal-accent mb-4">
        {'>'} Global Chat
      </div>
      <div className="flex-1 space-y-2 mb-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className="border-l-2 border-terminal-dim pl-3">
            <div className="flex items-center gap-2">
              <span className="text-terminal-accent text-xs">{msg.country}</span>
              <span className="text-white font-bold">{msg.user}</span>
            </div>
            <div className="text-terminal-text">{msg.message}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-terminal-border border border-terminal-dim rounded px-3 py-2 text-terminal-text focus:outline-none focus:border-terminal-accent"
        />
        <button className="px-4 py-2 bg-terminal-text text-terminal-bg rounded font-bold hover:bg-terminal-accent transition-colors">
          Send
        </button>
      </div>
    </div>
  )
}

// Globe Tab
function GlobeTab() {
  const [countryStats, setCountryStats] = useState([
    { code: 'US', name: 'United States', spins: 25000000, players: 1234 },
    { code: 'JP', name: 'Japan', spins: 18000000, players: 987 },
    { code: 'DE', name: 'Germany', spins: 12000000, players: 756 },
    { code: 'GB', name: 'United Kingdom', spins: 9000000, players: 654 },
    { code: 'KR', name: 'South Korea', spins: 15000000, players: 890 },
  ])

  return (
    <div className="space-y-2">
      <div className="text-terminal-accent mb-4">
        {'>'} Global Distribution
      </div>
      <div className="space-y-2">
        {countryStats.map((country) => (
          <div
            key={country.code}
            className="bg-terminal-border/20 p-3 rounded border border-terminal-border"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-white font-bold">{country.code}</span>
                <span className="text-terminal-dim ml-2 text-sm">{country.name}</span>
              </div>
              <span className="text-terminal-text font-mono text-sm">{country.players} players</span>
            </div>
            <div className="w-full bg-terminal-bg rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-terminal-text to-terminal-accent h-full"
                style={{ width: `${Math.min((country.spins / 25000000) * 100, 100)}%` }}
              />
            </div>
            <div className="text-terminal-dim text-xs mt-1">
              {country.spins.toLocaleString()} spins
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-terminal-border/30 p-4 rounded border border-terminal-border">
      <div className="text-terminal-dim text-xs mb-1">{label}</div>
      <div className={`${color} text-2xl font-bold font-mono`}>{value}</div>
    </div>
  )
}
