'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSpinStore } from '@/lib/store'
import axios from 'axios'

export default function SpinControls() {
  const {
    isSpinning,
    startSpinning,
    stopSpinning,
    speedMultiplier,
    setSpeedMultiplier,
    isRaveMode,
    toggleRaveMode,
    playerId,
    sessionSpins
  } = useSpinStore()

  const [isPressing, setIsPressing] = useState(false)
  const [selectedRemix, setSelectedRemix] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  // Handle spin button press
  const handlePressStart = useCallback(() => {
    setIsPressing(true)
    startSpinning()
  }, [startSpinning])

  const handlePressEnd = useCallback(() => {
    setIsPressing(false)
    stopSpinning()
  }, [stopSpinning])

  // Sync spins to server periodically
  useEffect(() => {
    if (sessionSpins === 0 || !playerId) return

    const syncInterval = setInterval(async () => {
      if (sessionSpins > 0 && !isSyncing) {
        setIsSyncing(true)
        try {
          await axios.post('/api/spin', {
            playerId,
            spinDelta: sessionSpins,
            speedMultiplier,
          })
          // Reset session spins after successful sync handled by parent
        } catch (error) {
          console.error('Failed to sync spins:', error)
        } finally {
          setIsSyncing(false)
        }
      }
    }, 5000) // Sync every 5 seconds

    return () => clearInterval(syncInterval)
  }, [sessionSpins, playerId, speedMultiplier, isSyncing])

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1.0, label: '1.0x' },
    { value: 1.5, label: '1.5x' },
    { value: 2.0, label: '2.0x' },
    { value: 3.0, label: '3.0x' },
  ]

  const remixOptions = [
    'Chill Vibes',
    'Electro Beats',
    'Jazz Fusion',
    'Cyber Funk',
  ]

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {/* Main Spin Button */}
      <motion.button
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
        className={`
          relative overflow-hidden
          w-full py-8 px-6 rounded-2xl
          font-bold text-2xl md:text-3xl
          transition-all duration-300
          ${isPressing
            ? isRaveMode
              ? 'bg-gradient-to-r from-rave-pink via-rave-cyan to-rave-yellow animate-rave-flash'
              : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/50'
            : isRaveMode
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
          }
          text-white
          select-none
          border-4 border-white/20
        `}
      >
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%' }}
          animate={{ x: isPressing ? '100%' : '-100%' }}
          transition={{ duration: 0.6, repeat: isPressing ? Infinity : 0 }}
        />

        <span className="relative z-10">
          {isPressing ? '🔥 SPINNING! 🔥' : '🐱 HOLD TO SPIN 🐱'}
        </span>
      </motion.button>

      {/* Rave Mode Toggle */}
      <motion.button
        onClick={toggleRaveMode}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full py-4 px-6 rounded-xl
          font-bold text-lg
          transition-all duration-300
          ${isRaveMode
            ? 'bg-gradient-to-r from-rave-pink to-rave-purple text-white shadow-lg shadow-pink-500/50'
            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
          }
        `}
      >
        {isRaveMode ? '✨ RAVE MODE ON ✨' : '💫 Enable Rave Mode'}
      </motion.button>

      {/* Speed Multiplier */}
      <div className="space-y-2">
        <label className="text-sm font-mono text-terminal-text">
          Speed Multiplier
        </label>
        <div className="grid grid-cols-5 gap-2">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setSpeedMultiplier(option.value)}
              className={`
                py-2 px-3 rounded-lg
                font-mono text-sm font-bold
                transition-all duration-200
                ${speedMultiplier === option.value
                  ? 'bg-terminal-text text-terminal-bg scale-110'
                  : 'bg-terminal-border text-terminal-dim hover:bg-terminal-border/70'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Remix Selector */}
      <div className="space-y-2">
        <label className="text-sm font-mono text-terminal-text">
          Select Remix
        </label>
        <select
          value={selectedRemix}
          onChange={(e) => setSelectedRemix(parseInt(e.target.value))}
          className="w-full px-4 py-3 rounded-lg bg-terminal-bg border border-terminal-border text-terminal-text font-mono focus:outline-none focus:border-terminal-accent"
        >
          {remixOptions.map((remix, index) => (
            <option key={index} value={index}>
              {remix}
            </option>
          ))}
        </select>
      </div>

      {/* Session Stats */}
      <div className="bg-terminal-bg border border-terminal-border rounded-lg p-4">
        <div className="flex justify-between items-center text-sm font-mono">
          <span className="text-terminal-dim">Session Spins:</span>
          <span className="text-terminal-text font-bold">{sessionSpins}</span>
        </div>
        {isSyncing && (
          <div className="mt-2 text-xs text-terminal-accent animate-pulse">
            Syncing...
          </div>
        )}
      </div>
    </div>
  )
}
