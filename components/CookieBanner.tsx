'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedOption, setSelectedOption] = useState<'all' | 'essential' | null>(null)

  useEffect(() => {
    // Check if user has already made a choice
    const cookiePreference = localStorage.getItem('cookie_preference')
    if (!cookiePreference) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 2000)
    }
  }, [])

  const handleAccept = (type: 'all' | 'essential') => {
    setSelectedOption(type)
    localStorage.setItem('cookie_preference', type)
    localStorage.setItem('cookie_accepted_date', new Date().toISOString())

    // Fade out
    setTimeout(() => setIsVisible(false), 500)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="container mx-auto max-w-4xl">
            <div className="bg-terminal-bg border-2 border-terminal-border rounded-lg p-6 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">🍪</div>

                <div className="flex-1">
                  <h3 className="text-terminal-text font-mono font-bold text-lg mb-2">
                    Cookie Settings
                  </h3>

                  <p className="text-terminal-dim text-sm mb-4">
                    We use cookies to enhance your spinning experience and keep track of your epic spins.
                    By clicking "Accept All", you agree to the storage of cookies on your device for:
                  </p>

                  <ul className="text-terminal-dim text-sm space-y-1 mb-4 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-terminal-text">•</span>
                      <span><strong className="text-white">Essential:</strong> Player ID, session management, and basic functionality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-terminal-text">•</span>
                      <span><strong className="text-white">Analytics:</strong> Spin statistics and performance tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-terminal-text">•</span>
                      <span><strong className="text-white">Preferences:</strong> Your settings, theme, and customizations</span>
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleAccept('all')}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-terminal-text to-terminal-accent text-terminal-bg font-mono font-bold rounded-lg hover:shadow-lg hover:shadow-terminal-text/50 transition-all"
                    >
                      Accept All
                    </button>
                    <button
                      onClick={() => handleAccept('essential')}
                      className="flex-1 px-6 py-3 bg-terminal-border text-terminal-text font-mono font-bold rounded-lg hover:bg-terminal-border/70 transition-all"
                    >
                      Essential Only
                    </button>
                  </div>

                  <p className="text-terminal-dim text-xs mt-3">
                    You can change your preferences anytime in settings.{' '}
                    <a href="#privacy" className="text-terminal-accent hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
