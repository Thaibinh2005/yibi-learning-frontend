import React, { useState } from 'react'
import { Volume2, VolumeX, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isTextToSpeech, speakChinese, textOf } from '@/lib/speech'

interface AudioButtonProps {
  audioUrl?: string | null
  text?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  title?: string
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  audioUrl,
  text,
  className,
  size = 'md',
  title = 'Phát âm thanh chuẩn',
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: 'w-7 h-7 p-1 text-xs',
    md: 'w-8 h-8 p-1.5 text-sm',
    lg: 'w-10 h-10 p-2 text-base',
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isPlaying) return

    setError(false)
    setIsPlaying(true)

    // The backend sends `tts:<text>` when it has no audio file: read the text aloud.
    if (isTextToSpeech(audioUrl)) {
      const started = speakChinese(textOf(audioUrl), () => setIsPlaying(false), () => {
        setIsPlaying(false)
        setError(true)
      })
      if (!started) {
        setIsPlaying(false)
        setError(true)
      }
      return
    }

    // 1. Try playing MinIO audioUrl if available
    if (audioUrl) {
      const audio = new Audio(audioUrl)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        // Fallback to Web Speech API if MinIO fails
        speakFallback()
      }
      audio.play().catch(() => {
        speakFallback()
      })
      return
    }

    // 2. Fallback to Web Speech API
    speakFallback()
  }

  const speakFallback = () => {
    if (text && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const cleanText = text.replace(/[\(（].*?[\)）]/g, '').trim()
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.85
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => {
        setIsPlaying(false)
        setError(true)
      }
      window.speechSynthesis.speak(utterance)
    } else {
      setIsPlaying(false)
      setError(true)
    }
  }

  return (
    <button
      type="button"
      onClick={handlePlay}
      disabled={isPlaying}
      title={error ? 'Không thể phát âm thanh' : title}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer shadow-2xs',
        isPlaying
          ? 'bg-red-100 text-[#C8322B] ring-2 ring-red-400 scale-105 animate-pulse'
          : error
          ? 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          : 'bg-rose-50 text-[#C8322B] hover:bg-rose-100 hover:scale-105 active:scale-95',
        sizeClasses[size],
        className
      )}
      aria-label={title}
    >
      {isPlaying ? (
        <Volume2 className={cn(iconSizes[size], 'animate-bounce')} />
      ) : error ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    </button>
  )
}

