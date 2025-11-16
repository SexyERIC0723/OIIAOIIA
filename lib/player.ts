import { v4 as uuidv4 } from 'uuid'

const PLAYER_ID_KEY = 'spinning_kitty_player_id'
const NICKNAME_KEY = 'spinning_kitty_nickname'

export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return ''

  let playerId = localStorage.getItem(PLAYER_ID_KEY)

  if (!playerId) {
    playerId = uuidv4()
    localStorage.setItem(PLAYER_ID_KEY, playerId)
  }

  return playerId
}

export function getNickname(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(NICKNAME_KEY)
}

export function setNickname(nickname: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NICKNAME_KEY, nickname)
}

export function generateAnonymousNickname(): string {
  const adjectives = ['Swift', 'Mighty', 'Quick', 'Brave', 'Wild', 'Clever', 'Noble', 'Silent']
  const nouns = ['Spinner', 'Whirler', 'Twirler', 'Rotator', 'Turner', 'Roller']

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const num = Math.floor(Math.random() * 9999)

  return `${adj}${noun}#${num}`
}
