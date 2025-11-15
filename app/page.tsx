'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import CatSpinner from '@/components/CatSpinner'
import SpinControls from '@/components/SpinControls'
import TerminalPanel from '@/components/TerminalPanel'
import CookieBanner from '@/components/CookieBanner'
import AudioPlayer from '@/components/AudioPlayer'
import { usePlayer } from '@/lib/use-player'
import { useSocket } from '@/lib/socket-client'

export default function Home() {
  const { playerId } = usePlayer()
  const { socket, isConnected } = useSocket()

  const [isSpinning, setIsSpinning] = useState(false)
  const [speed, setSpeed] = useState(1.0)
  const [raveMode, setRaveMode] = useState(false)
  const [selectedRemix, setSelectedRemix] = useState('Classic Beat')
  const [spinCount, setSpinCount] = useState(0)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  // Join socket room when playerId is available
  useEffect(() => {
    if (socket && playerId && isConnected) {
      socket.emit('join', playerId)
    }
  }, [socket, playerId, isConnected])

  // Track spin duration and send to API
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isSpinning) {
      interval = setInterval(() => {
        setSpinCount((prev) => prev + 1)
      }, 100) // Increment every 100ms
    } else if (spinCount > 0) {
      // Send spin data when user stops spinning
      sendSpinData()
      setSpinCount(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isSpinning, spinCount])

  const sendSpinData = async () => {
    if (!playerId || spinCount === 0) return

    try {
      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          spinCount: Math.floor(spinCount / 10), // Convert to meaningful units
          speed,
          raveMode,
        }),
      })

      if (response.ok) {
        console.log('Spin recorded successfully')
      }
    } catch (error) {
      console.error('Error recording spin:', error)
    }
  }

  const handleSpinStart = () => {
    setIsSpinning(true)
    setIsAudioPlaying(true)
  }

  const handleSpinEnd = () => {
    setIsSpinning(false)
  }

  const handleRaveModeToggle = () => {
    setRaveMode((prev) => !prev)
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        raveMode ? 'rave-background' : 'bg-terminal-bg'
      }`}
    >
      {/* Audio Player */}
      <AudioPlayer raveMode={raveMode} remix={selectedRemix} isPlaying={isAudioPlaying} />

      {/* Header */}
      <header className="py-6 px-4 border-b border-terminal-border">
        <div className="container mx-auto flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-3xl font-bold font-mono ${
              raveMode ? 'text-white glitch' : 'text-terminal-text'
            }`}
          >
            SPIN-KITTY
          </motion.h1>

          <div className="flex items-center gap-4">
            <div
              className={`text-sm font-mono ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isConnected ? '● LIVE' : '○ OFFLINE'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Cat Spinner Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <CatSpinner isSpinning={isSpinning} speed={speed} raveMode={raveMode} />
          </motion.div>

          {/* Controls Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center"
          >
            <SpinControls
              isSpinning={isSpinning}
              onSpinStart={handleSpinStart}
              onSpinEnd={handleSpinEnd}
              speed={speed}
              onSpeedChange={setSpeed}
              raveMode={raveMode}
              onRaveModeToggle={handleRaveModeToggle}
              onRemixSelect={setSelectedRemix}
            />
          </motion.div>
        </div>

        {/* Terminal Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TerminalPanel />
        </motion.div>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard
            title="Global Community"
            description="Join spinners from around the world. Every spin is recorded forever."
            raveMode={raveMode}
          />
          <FeatureCard
            title="Real-time Stats"
            description="Watch live updates of spins, leaderboards, and global activity."
            raveMode={raveMode}
          />
          <FeatureCard
            title="Rave Mode"
            description="Unleash the full power with intense visuals and pumping beats."
            raveMode={raveMode}
          />
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-terminal-border mt-16">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm font-mono text-terminal-text/60">
              © 2024 Spin-Kitty. All spins are forever.
            </div>

            <div className="flex gap-6 text-sm font-mono">
              <a href="#" className="text-terminal-text/60 hover:text-terminal-text">
                Privacy Policy
              </a>
              <a href="#" className="text-terminal-text/60 hover:text-terminal-text">
                Disclaimer
              </a>
              <a href="#" className="text-terminal-text/60 hover:text-terminal-text">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  title,
  description,
  raveMode,
}: {
  title: string
  description: string
  raveMode: boolean
}) {
  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all duration-300 ${
        raveMode
          ? 'border-rave-pink bg-rave-pink/10'
          : 'border-terminal-border bg-terminal-bg/50 hover:border-terminal-text'
      }`}
    >
      <h3
        className={`text-lg font-bold font-mono mb-2 ${
          raveMode ? 'text-rave-pink' : 'text-terminal-text'
        }`}
      >
        {title}
      </h3>
      <p className={`text-sm font-mono ${raveMode ? 'text-white/80' : 'text-terminal-text/60'}`}>
        {description}
      </p>
    </div>
  )
}
