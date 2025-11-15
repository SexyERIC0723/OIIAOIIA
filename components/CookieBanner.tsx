'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookie-consent')
    if (!cookieChoice) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all')
    setIsVisible(false)
  }

  const handleEssentialOnly = () => {
    localStorage.setItem('cookie-consent', 'essential')
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-terminal-bg/95 border-t-2 border-terminal-border backdrop-blur-sm"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-terminal-text font-mono text-sm">
                <p>
                  This site uses cookies to enhance your spinning experience and track global
                  statistics. We use cookies for:
                </p>
                <ul className="list-disc list-inside mt-2 text-xs text-terminal-text/70">
                  <li>Essential functionality (player ID, session management)</li>
                  <li>Statistics and analytics (spin counts, leaderboards)</li>
                  <li>Storing your preferences (theme, sound settings)</li>
                </ul>
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={handleEssentialOnly}
                  className="px-4 py-2 text-sm font-mono border-2 border-terminal-text text-terminal-text hover:bg-terminal-text hover:text-terminal-bg transition-colors rounded"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-mono bg-terminal-text text-terminal-bg hover:bg-terminal-highlight transition-colors rounded"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
