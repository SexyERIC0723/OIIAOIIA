'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface CatSpinnerProps {
  isSpinning: boolean
  speed: number
  raveMode: boolean
}

export default function CatSpinner({ isSpinning, speed, raveMode }: CatSpinnerProps) {
  const [rotation, setRotation] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const animationFrameRef = useRef<number>()
  const controls = useAnimation()

  useEffect(() => {
    const animate = () => {
      if (isSpinning) {
        // Accelerate when spinning
        setVelocity((v) => Math.min(v + 0.5 * speed, 20 * speed))
      } else {
        // Decelerate when not spinning
        setVelocity((v) => Math.max(v * 0.95, 0))
      }

      // Update rotation
      setRotation((r) => (r + velocity) % 360)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isSpinning, speed, velocity])

  // Trigger glow animation in rave mode
  useEffect(() => {
    if (raveMode) {
      controls.start({
        boxShadow: [
          '0 0 20px rgba(255, 0, 255, 0.5)',
          '0 0 40px rgba(0, 255, 255, 0.8)',
          '0 0 20px rgba(255, 255, 0, 0.5)',
        ],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'reverse',
        },
      })
    } else {
      controls.start({
        boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)',
      })
    }
  }, [raveMode, controls])

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect container */}
      <motion.div
        animate={controls}
        className="absolute inset-0 rounded-full blur-xl"
        style={{ backgroundColor: raveMode ? 'rgba(255, 0, 255, 0.2)' : 'rgba(0, 255, 65, 0.1)' }}
      />

      {/* Cat image with rotation */}
      <motion.div
        className="relative z-10"
        style={{ rotate: rotation }}
      >
        {/* Placeholder SVG Cat - Replace with your own design */}
        <svg
          width="300"
          height="300"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          className={raveMode ? 'filter brightness-110' : ''}
        >
          {/* Simple cat face SVG */}
          <circle cx="100" cy="100" r="80" fill="#FF9500" />

          {/* Ears */}
          <path d="M 60 40 L 40 10 L 80 50 Z" fill="#FF9500" />
          <path d="M 140 40 L 160 10 L 120 50 Z" fill="#FF9500" />

          {/* Inner ears */}
          <path d="M 60 40 L 50 20 L 70 48 Z" fill="#FFB84D" />
          <path d="M 140 40 L 150 20 L 130 48 Z" fill="#FFB84D" />

          {/* Eyes */}
          <circle cx="75" cy="85" r="12" fill="#000" />
          <circle cx="125" cy="85" r="12" fill="#000" />
          <circle cx="78" cy="82" r="4" fill="#FFF" />
          <circle cx="128" cy="82" r="4" fill="#FFF" />

          {/* Nose */}
          <path d="M 100 95 L 95 105 L 105 105 Z" fill="#FF6B6B" />

          {/* Mouth */}
          <path
            d="M 100 105 Q 85 115 75 110"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 100 105 Q 115 115 125 110"
            stroke="#000"
            strokeWidth="2"
            fill="none"
          />

          {/* Whiskers */}
          <line x1="40" y1="90" x2="65" y2="88" stroke="#000" strokeWidth="2" />
          <line x1="40" y1="100" x2="65" y2="100" stroke="#000" strokeWidth="2" />
          <line x1="40" y1="110" x2="65" y2="112" stroke="#000" strokeWidth="2" />

          <line x1="160" y1="90" x2="135" y2="88" stroke="#000" strokeWidth="2" />
          <line x1="160" y1="100" x2="135" y2="100" stroke="#000" strokeWidth="2" />
          <line x1="160" y1="110" x2="135" y2="112" stroke="#000" strokeWidth="2" />
        </svg>
      </motion.div>

      {/* Speed indicator */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
        <div
          className={`text-sm font-mono ${
            raveMode ? 'text-rave-pink animate-pulse' : 'text-terminal-text'
          }`}
        >
          {velocity.toFixed(1)} RPM
        </div>
      </div>
    </div>
  )
}
