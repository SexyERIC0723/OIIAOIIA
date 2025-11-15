'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface SpinControlsProps {
  isSpinning: boolean
  onSpinStart: () => void
  onSpinEnd: () => void
  speed: number
  onSpeedChange: (speed: number) => void
  raveMode: boolean
  onRaveModeToggle: () => void
  onRemixSelect: (remix: string) => void
}

const SPEED_OPTIONS = [
  { label: '1.0x', value: 1.0 },
  { label: '1.5x', value: 1.5 },
  { label: '2.0x', value: 2.0 },
  { label: '3.0x', value: 3.0 },
]

const REMIX_OPTIONS = [
  'Classic Beat',
  'Electronic Mix',
  'Chill Vibes',
  'Hyper Mode',
]

export default function SpinControls({
  isSpinning,
  onSpinStart,
  onSpinEnd,
  speed,
  onSpeedChange,
  raveMode,
  onRaveModeToggle,
  onRemixSelect,
}: SpinControlsProps) {
  const [selectedRemix, setSelectedRemix] = useState(REMIX_OPTIONS[0])

  const handleRemixChange = (remix: string) => {
    setSelectedRemix(remix)
    onRemixSelect(remix)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Main Spin Button */}
      <motion.button
        onMouseDown={onSpinStart}
        onMouseUp={onSpinEnd}
        onMouseLeave={onSpinEnd}
        onTouchStart={onSpinStart}
        onTouchEnd={onSpinEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          relative px-12 py-6 text-2xl font-bold rounded-lg
          transition-all duration-200
          ${
            raveMode
              ? 'bg-gradient-to-r from-rave-pink via-rave-purple to-rave-cyan text-white animate-rave-flash'
              : 'bg-terminal-text text-terminal-bg hover:bg-terminal-highlight'
          }
          ${isSpinning ? 'animate-pulse' : ''}
        `}
      >
        {isSpinning ? 'SPINNING!' : 'HOLD TO SPIN'}
      </motion.button>

      {/* Speed Control */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-terminal-text font-mono">Speed Multiplier</label>
        <div className="flex gap-2">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onSpeedChange(option.value)}
              className={`
                flex-1 px-4 py-2 rounded font-mono text-sm
                transition-all duration-200
                ${
                  speed === option.value
                    ? raveMode
                      ? 'bg-rave-pink text-white'
                      : 'bg-terminal-text text-terminal-bg'
                    : 'bg-terminal-border text-terminal-text hover:bg-terminal-text hover:text-terminal-bg'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rave Mode Toggle */}
      <div className="flex items-center justify-between p-4 bg-terminal-border rounded-lg">
        <span className="text-terminal-text font-mono">RAVE MODE</span>
        <button
          onClick={onRaveModeToggle}
          className={`
            relative w-16 h-8 rounded-full transition-colors duration-200
            ${raveMode ? 'bg-rave-pink' : 'bg-gray-600'}
          `}
        >
          <motion.div
            className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full"
            animate={{ x: raveMode ? 32 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Remix Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-terminal-text font-mono">Select Remix</label>
        <select
          value={selectedRemix}
          onChange={(e) => handleRemixChange(e.target.value)}
          className={`
            px-4 py-2 rounded font-mono text-sm
            bg-terminal-border text-terminal-text
            border-2 border-transparent
            focus:border-terminal-text focus:outline-none
            ${raveMode ? 'border-rave-pink' : ''}
          `}
        >
          {REMIX_OPTIONS.map((remix) => (
            <option key={remix} value={remix}>
              {remix}
            </option>
          ))}
        </select>
      </div>

      {/* Info Text */}
      <div className="text-xs text-terminal-text/60 font-mono text-center">
        Every spin is recorded permanently. Keep the legend alive!
      </div>
    </div>
  )
}
