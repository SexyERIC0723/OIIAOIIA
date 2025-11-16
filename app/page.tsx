'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CatSpinner from '@/components/CatSpinner'
import SpinControls from '@/components/SpinControls'
import TerminalPanel from '@/components/TerminalPanel'
import CookieBanner from '@/components/CookieBanner'
import { useSpinStore } from '@/lib/store'
import { getOrCreatePlayerId, generateAnonymousNickname, getNickname, setNickname } from '@/lib/player'
import axios from 'axios'

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const { setPlayerId, setNickname: setStoreNickname, isRaveMode, updateGlobalStats } = useSpinStore()

  useEffect(() => {
    // Initialize player
    const playerId = getOrCreatePlayerId()
    setPlayerId(playerId)

    // Get or generate nickname
    let nickname = getNickname()
    if (!nickname) {
      nickname = generateAnonymousNickname()
      setNickname(nickname)
    }
    setStoreNickname(nickname)

    // Register player with backend
    axios.post('/api/player', {
      playerId,
      nickname,
    }).catch(console.error)

    // Fetch initial stats
    fetchStats()

    setIsLoaded(true)

    // Poll stats every 10 seconds
    const interval = setInterval(fetchStats, 10000)

    return () => clearInterval(interval)
  }, [setPlayerId, setStoreNickname])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats')
      if (response.data.success) {
        updateGlobalStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-terminal-text font-mono text-xl animate-pulse">
          Loading Spinning Kitty...
        </div>
      </div>
    )
  }

  return (
    <main className={`min-h-screen ${isRaveMode ? 'rave-background' : ''} transition-all duration-500`}>
      {/* Header */}
      <header className="border-b border-terminal-border bg-terminal-bg/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-2xl md:text-3xl font-bold font-mono"
            >
              <span className="text-terminal-text">🐱 Spinning</span>{' '}
              <span className="text-white">Kitty</span>
            </motion.h1>
            <nav className="flex gap-4 text-sm font-mono">
              <a href="#features" className="text-terminal-dim hover:text-terminal-text transition-colors">
                Features
              </a>
              <a href="#stats" className="text-terminal-dim hover:text-terminal-text transition-colors">
                Stats
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Cat Spinner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <CatSpinner />
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="order-1 lg:order-2 flex justify-center"
          >
            <SpinControls />
          </motion.div>
        </div>
      </section>

      {/* Tagline */}
      <section className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-xl md:text-2xl text-terminal-text font-mono font-bold mb-2">
            Your spins fuel the legend. Keep the cat spinning!
          </p>
          <p className="text-terminal-dim text-sm md:text-base">
            Join thousands of spinners worldwide in the ultimate spinning experience
          </p>
        </motion.div>
      </section>

      {/* Terminal Panel */}
      <section id="stats" className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <TerminalPanel />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid md:grid-cols-3 gap-6"
        >
          <FeatureCard
            icon="🎮"
            title="Interactive Play"
            description="Hold to spin, release to slow down. Simple yet addictive gameplay."
          />
          <FeatureCard
            icon="🌍"
            title="Global Leaderboard"
            description="Compete with spinners from around the world. Climb the ranks!"
          />
          <FeatureCard
            icon="✨"
            title="Rave Mode"
            description="Experience the spin with mind-bending visual effects and colors."
          />
          <FeatureCard
            icon="💬"
            title="Live Chat"
            description="Connect with other spinners in real-time chat."
          />
          <FeatureCard
            icon="📊"
            title="Real-time Stats"
            description="Watch global statistics update live as the world spins."
          />
          <FeatureCard
            icon="🎵"
            title="Music Remixes"
            description="Choose from various beats to enhance your spinning experience."
          />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-terminal-border bg-terminal-bg/80 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h3 className="text-terminal-text font-mono font-bold mb-3">Spinning Kitty</h3>
              <p className="text-terminal-dim">
                An open-source interactive web experience. Made with ❤️ for cat lovers and spinners everywhere.
              </p>
            </div>
            <div>
              <h3 className="text-terminal-text font-mono font-bold mb-3">Legal</h3>
              <div className="space-y-2">
                <a href="#privacy" className="block text-terminal-dim hover:text-terminal-text transition-colors">
                  Privacy Policy
                </a>
                <a href="#disclaimer" className="block text-terminal-dim hover:text-terminal-text transition-colors">
                  Disclaimer
                </a>
                <a href="#terms" className="block text-terminal-dim hover:text-terminal-text transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-terminal-text font-mono font-bold mb-3">Support</h3>
              <div className="space-y-2">
                <a href="#contact" className="block text-terminal-dim hover:text-terminal-text transition-colors">
                  Contact Us
                </a>
                <a href="#donate" className="block text-terminal-dim hover:text-terminal-text transition-colors">
                  Buy me a Coffee ☕
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-terminal-border text-center text-terminal-dim text-xs font-mono">
            © 2024 Spinning Kitty. All spins reserved.
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-terminal-bg border border-terminal-border rounded-lg p-6 hover:border-terminal-text transition-all"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-terminal-text font-mono font-bold text-lg mb-2">{title}</h3>
      <p className="text-terminal-dim text-sm">{description}</p>
    </motion.div>
  )
}
