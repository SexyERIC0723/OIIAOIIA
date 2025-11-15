'use client'

import { useEffect, useRef } from 'react'

interface AudioPlayerProps {
  raveMode: boolean
  remix: string
  isPlaying: boolean
}

// Placeholder audio URLs - replace with actual audio files
const AUDIO_TRACKS: Record<string, string> = {
  'Classic Beat': '/audio/classic-beat.mp3',
  'Electronic Mix': '/audio/electronic-mix.mp3',
  'Chill Vibes': '/audio/chill-vibes.mp3',
  'Hyper Mode': '/audio/hyper-mode.mp3',
}

export default function AudioPlayer({ raveMode, remix, isPlaying }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!audioRef.current) return

    // Change track when remix changes
    const track = AUDIO_TRACKS[remix] || AUDIO_TRACKS['Classic Beat']
    audioRef.current.src = track
    audioRef.current.volume = raveMode ? 0.7 : 0.3

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.log('Audio playback prevented:', err)
      })
    } else {
      audioRef.current.pause()
    }
  }, [remix, isPlaying, raveMode])

  return (
    <audio
      ref={audioRef}
      loop
      preload="auto"
      className="hidden"
    />
  )
}
