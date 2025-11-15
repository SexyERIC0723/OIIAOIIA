// Custom hook for managing player state

'use client'

import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const PLAYER_ID_KEY = 'spin-kitty-player-id'

export function usePlayer() {
  const [playerId, setPlayerId] = useState<string | null>(null)

  useEffect(() => {
    // Get or create player ID
    let id = localStorage.getItem(PLAYER_ID_KEY)

    if (!id) {
      id = uuidv4()
      localStorage.setItem(PLAYER_ID_KEY, id)
    }

    setPlayerId(id)
  }, [])

  return { playerId }
}
