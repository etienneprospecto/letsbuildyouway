import React, { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { Card } from './card'
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react'
import { Progress } from './progress'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface VoiceMessageProps {
  voiceUrl: string
  duration: number
  timestamp: string
  senderName: string
  isOwn: boolean
  onDownload?: (url: string, filename: string) => void
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  voiceUrl,
  duration,
  timestamp,
  senderName,
  isOwn,
  onDownload
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  const playPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
        }
      } else {
        audioRef.current.play()
        setIsPlaying(true)
        
        // Mettre à jour le progrès toutes les 100ms
        progressIntervalRef.current = setInterval(() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
          }
        }, 100)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = clickX / rect.width
      const newTime = percentage * duration
      
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (currentTime / duration) * 100

  const handleDownload = () => {
    if (onDownload) {
      const filename = `message-vocal-${format(new Date(timestamp), 'yyyy-MM-dd-HH-mm-ss', { locale: fr })}.webm`
      onDownload(voiceUrl, filename)
    } else {
      // Téléchargement par défaut
      const link = document.createElement('a')
      link.href = voiceUrl
      link.download = `message-vocal-${format(new Date(timestamp), 'yyyy-MM-dd-HH-mm-ss', { locale: fr })}.webm`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <Card className={`p-3 max-w-sm ${isOwn ? 'ml-auto bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' : 'mr-auto bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
      {/* En-tête du message */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {senderName} • {format(new Date(timestamp), 'HH:mm', { locale: fr })}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDownload}
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>

      {/* Contrôles audio */}
      <div className="space-y-2">
        {/* Bouton play/pause et temps */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={playPause}
            className="h-8 w-8 p-0"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div className="flex-1">
            <div 
              className="relative cursor-pointer"
              onClick={handleSeek}
            >
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Contrôles de volume */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="h-6 w-6 p-0"
          >
            {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          </Button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Élément audio caché */}
      <audio
        ref={audioRef}
        src={voiceUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </Card>
  )
}
