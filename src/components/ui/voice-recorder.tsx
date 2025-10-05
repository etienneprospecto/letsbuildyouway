import React, { useState, useRef, useEffect } from 'react'
import { Button } from './button'
import { Card } from './card'
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react'
import { Progress } from './progress'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
  onSendVoiceMessage?: (audioBlob: Blob, duration: number) => void
  disabled?: boolean
  maxDuration?: number // en secondes
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onSendVoiceMessage,
  disabled = false,
  maxDuration = 300 // 5 minutes par défaut
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Nettoyer les URLs audio
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        onRecordingComplete(audioBlob, recordingTime)
        
        // Arrêter tous les tracks du stream
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start(100) // Collecter les données toutes les 100ms
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      
      // Démarrer le timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
            return maxDuration
          }
          return newTime
        })
      }, 1000)
      
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error)
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        setIsPaused(false)
        
        // Reprendre le timer
        intervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1
            if (newTime >= maxDuration) {
              stopRecording()
              return maxDuration
            }
            return newTime
          })
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        setIsPaused(true)
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setAudioBlob(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const sendVoiceMessage = () => {
    if (audioBlob && onSendVoiceMessage) {
      onSendVoiceMessage(audioBlob, recordingTime)
      deleteRecording()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = (recordingTime / maxDuration) * 100

  return (
    <div className="space-y-4">
      {/* Enregistrement en cours */}
      {isRecording && (
        <Card className="p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {isPaused ? 'Enregistrement en pause' : 'Enregistrement en cours...'}
              </span>
            </div>
            <span className="text-sm font-mono text-red-600 dark:text-red-400">
              {formatTime(recordingTime)}
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="mt-2 h-2"
          />
          
          <div className="flex items-center justify-center space-x-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={pauseRecording}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={stopRecording}
            >
              <Square className="h-4 w-4 mr-1" />
              Arrêter
            </Button>
          </div>
        </Card>
      )}

      {/* Contrôles d'enregistrement */}
      {!isRecording && !audioBlob && (
        <div className="flex items-center justify-center">
          <Button
            onClick={startRecording}
            disabled={disabled}
            className="bg-red-500 hover:bg-red-600 text-white"
            size="lg"
          >
            <Mic className="h-5 w-5 mr-2" />
            Enregistrer un message vocal
          </Button>
        </div>
      )}

      {/* Aperçu de l'enregistrement */}
      {audioBlob && !isRecording && (
        <Card className="p-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Message vocal enregistré
              </span>
            </div>
            <span className="text-sm font-mono text-green-600 dark:text-green-400">
              {formatTime(recordingTime)}
            </span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={playRecording}
              className="text-green-600 border-green-300 hover:bg-green-100"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={deleteRecording}
              className="text-red-600 border-red-300 hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            {onSendVoiceMessage && (
              <Button
                onClick={sendVoiceMessage}
                size="sm"
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Send className="h-4 w-4 mr-1" />
                Envoyer
              </Button>
            )}
          </div>
          
          {/* Élément audio caché pour la lecture */}
          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            className="hidden"
          />
        </Card>
      )}
    </div>
  )
}
