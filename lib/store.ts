import { create } from 'zustand'

export interface SpinState {
  // Player info
  playerId: string | null
  nickname: string | null
  countryCode: string | null

  // Spinning state
  isSpinning: boolean
  spinSpeed: number
  speedMultiplier: number
  totalRotations: number
  sessionSpins: number

  // Rave mode
  isRaveMode: boolean

  // Global stats
  globalStats: {
    totalSpins: number
    todaySpins: number
    totalPlayers: number
    onlinePlayers: number
  }

  // Actions
  setPlayerId: (id: string) => void
  setNickname: (nickname: string) => void
  setCountryCode: (code: string) => void
  startSpinning: () => void
  stopSpinning: () => void
  updateSpinSpeed: (speed: number) => void
  setSpeedMultiplier: (multiplier: number) => void
  incrementRotations: (count: number) => void
  toggleRaveMode: () => void
  updateGlobalStats: (stats: Partial<SpinState['globalStats']>) => void
  resetSession: () => void
}

export const useSpinStore = create<SpinState>((set) => ({
  // Initial state
  playerId: null,
  nickname: null,
  countryCode: null,
  isSpinning: false,
  spinSpeed: 0,
  speedMultiplier: 1.0,
  totalRotations: 0,
  sessionSpins: 0,
  isRaveMode: false,
  globalStats: {
    totalSpins: 0,
    todaySpins: 0,
    totalPlayers: 0,
    onlinePlayers: 0,
  },

  // Actions
  setPlayerId: (id) => set({ playerId: id }),
  setNickname: (nickname) => set({ nickname }),
  setCountryCode: (code) => set({ countryCode: code }),

  startSpinning: () => set({ isSpinning: true }),
  stopSpinning: () => set({ isSpinning: false }),

  updateSpinSpeed: (speed) => set({ spinSpeed: speed }),
  setSpeedMultiplier: (multiplier) => set({ speedMultiplier: multiplier }),

  incrementRotations: (count) => set((state) => ({
    totalRotations: state.totalRotations + count,
    sessionSpins: state.sessionSpins + count,
  })),

  toggleRaveMode: () => set((state) => ({ isRaveMode: !state.isRaveMode })),

  updateGlobalStats: (stats) => set((state) => ({
    globalStats: { ...state.globalStats, ...stats },
  })),

  resetSession: () => set({
    sessionSpins: 0,
    spinSpeed: 0,
    isSpinning: false,
  }),
}))
