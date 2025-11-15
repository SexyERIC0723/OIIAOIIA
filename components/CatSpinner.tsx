'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useSpinStore } from '@/lib/store'

export default function CatSpinner() {
  const controls = useAnimation()
  const rotationRef = useRef(0)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(Date.now())

  const {
    isSpinning,
    spinSpeed,
    updateSpinSpeed,
    speedMultiplier,
    isRaveMode,
    incrementRotations
  } = useSpinStore()

  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const deltaTime = (now - lastTimeRef.current) / 1000 // seconds
      lastTimeRef.current = now

      let newSpeed = spinSpeed

      if (isSpinning) {
        // Accelerate when spinning
        newSpeed = Math.min(spinSpeed + (300 * deltaTime * speedMultiplier), 1000 * speedMultiplier)
      } else {
        // Decelerate when not spinning
        newSpeed = Math.max(spinSpeed - (200 * deltaTime), 0)
      }

      updateSpinSpeed(newSpeed)

      // Update rotation
      const rotationDelta = newSpeed * deltaTime
      rotationRef.current += rotationDelta
      setRotation(rotationRef.current % 360)

      // Count full rotations
      if (rotationDelta > 0) {
        const fullRotations = Math.floor(rotationDelta / 360)
        if (fullRotations > 0) {
          incrementRotations(fullRotations)
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isSpinning, spinSpeed, speedMultiplier, updateSpinSpeed, incrementRotations])

  // Generate simple cat SVG
  const CatSVG = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Cat head */}
      <circle cx="100" cy="100" r="60" fill={isRaveMode ? "url(#raveGradient)" : "#FF6B9D"} />

      {/* Left ear */}
      <path d="M 60 60 L 40 20 L 80 50 Z" fill={isRaveMode ? "#00FFFF" : "#FF4D7D"} />

      {/* Right ear */}
      <path d="M 140 60 L 160 20 L 120 50 Z" fill={isRaveMode ? "#FFFF00" : "#FF4D7D"} />

      {/* Left eye */}
      <ellipse cx="80" cy="90" rx="8" ry="12" fill="#000" />

      {/* Right eye */}
      <ellipse cx="120" cy="90" rx="8" ry="12" fill="#000" />

      {/* Nose */}
      <path d="M 100 105 L 95 115 L 105 115 Z" fill="#FF1493" />

      {/* Mouth */}
      <path d="M 100 115 Q 85 125 80 120" stroke="#000" strokeWidth="2" fill="none" />
      <path d="M 100 115 Q 115 125 120 120" stroke="#000" strokeWidth="2" fill="none" />

      {/* Whiskers */}
      <line x1="50" y1="95" x2="20" y2="90" stroke="#000" strokeWidth="1.5" />
      <line x1="50" y1="100" x2="15" y2="100" stroke="#000" strokeWidth="1.5" />
      <line x1="50" y1="105" x2="20" y2="110" stroke="#000" strokeWidth="1.5" />

      <line x1="150" y1="95" x2="180" y2="90" stroke="#000" strokeWidth="1.5" />
      <line x1="150" y1="100" x2="185" y2="100" stroke="#000" strokeWidth="1.5" />
      <line x1="150" y1="105" x2="180" y2="110" stroke="#000" strokeWidth="1.5" />

      {/* Rave mode gradient */}
      {isRaveMode && (
        <defs>
          <linearGradient id="raveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <animate attributeName="x1" values="0%;100%;0%" dur="2s" repeatCount="indefinite" />
            <animate attributeName="y1" values="0%;100%;0%" dur="2s" repeatCount="indefinite" />
            <stop offset="0%" stopColor="#FF00FF" />
            <stop offset="50%" stopColor="#00FFFF" />
            <stop offset="100%" stopColor="#FFFF00" />
          </linearGradient>
        </defs>
      )}
    </svg>
  )

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow effect for rave mode */}
      {isRaveMode && spinSpeed > 100 && (
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl opacity-50"
          animate={{
            background: [
              'radial-gradient(circle, rgba(255,0,255,0.8) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(0,255,255,0.8) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(255,255,0,0.8) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(255,0,255,0.8) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}

      {/* Spinning cat */}
      <motion.div
        className="relative w-64 h-64 md:w-80 md:h-80"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <CatSVG />
      </motion.div>

      {/* Speed indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className={`px-4 py-2 rounded-lg font-mono text-sm ${
          isRaveMode
            ? 'bg-gradient-to-r from-rave-pink via-rave-cyan to-rave-yellow text-black font-bold'
            : 'bg-terminal-bg border border-terminal-border text-terminal-text'
        }`}>
          {(spinSpeed / 360).toFixed(1)}x SPEED
        </div>
      </div>
    </div>
  )
}
