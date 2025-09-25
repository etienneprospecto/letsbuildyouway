import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackDeadlineAlertProps {
  deadline: string | null
  status: string
  onFillFeedback: () => void
  className?: string
}

const FeedbackDeadlineAlert: React.FC<FeedbackDeadlineAlertProps> = ({
  deadline,
  status,
  onFillFeedback,
  className
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    totalMinutes: number
  } | null>(null)

  useEffect(() => {
    if (!deadline || status === 'completed') {
      setTimeLeft(null)
      return
    }

    const updateTimeLeft = () => {
      const now = new Date()
      const deadlineDate = new Date(deadline)
      const diff = deadlineDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, totalMinutes: 0 })
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const totalMinutes = Math.floor(diff / (1000 * 60))

      setTimeLeft({ days, hours, minutes, totalMinutes })
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Mise à jour chaque minute

    return () => clearInterval(interval)
  }, [deadline, status])

  if (!deadline || status === 'completed' || !timeLeft) {
    return null
  }

  const isExpired = timeLeft.totalMinutes <= 0
  const isUrgent = timeLeft.totalMinutes <= 60 // Moins d'1 heure
  const isWarning = timeLeft.totalMinutes <= 24 * 60 // Moins d'1 jour

  const getAlertVariant = () => {
    if (isExpired) return 'destructive'
    if (isUrgent) return 'destructive'
    if (isWarning) return 'default'
    return 'default'
  }

  const getIcon = () => {
    if (isExpired) return <AlertTriangle className="h-4 w-4" />
    if (isUrgent) return <AlertTriangle className="h-4 w-4" />
    return <Clock className="h-4 w-4" />
  }

  const getMessage = () => {
    if (isExpired) {
      return "Le délai pour remplir le feedback est dépassé. Veuillez le compléter dès que possible."
    }
    
    if (isUrgent) {
      return `⏰ URGENT: Il ne reste que ${timeLeft.hours}h ${timeLeft.minutes}min pour remplir le feedback !`
    }
    
    if (isWarning) {
      return `⚠️ Attention: Il reste ${timeLeft.days}j ${timeLeft.hours}h pour remplir le feedback.`
    }
    
    return `📅 Il vous reste ${timeLeft.days}j ${timeLeft.hours}h ${timeLeft.minutes}min pour remplir le feedback.`
  }

  const getButtonText = () => {
    if (isExpired) return "Remplir maintenant"
    if (isUrgent) return "Remplir immédiatement"
    return "Remplir le feedback"
  }

  return (
    <Alert 
      variant={getAlertVariant()} 
      className={cn(
        "border-l-4",
        isExpired && "border-red-500 bg-red-50",
        isUrgent && "border-red-500 bg-red-50",
        isWarning && "border-yellow-500 bg-yellow-50",
        !isWarning && !isUrgent && !isExpired && "border-blue-500 bg-blue-50",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <AlertDescription className="font-medium">
            {getMessage()}
          </AlertDescription>
        </div>
        
        <Button
          onClick={onFillFeedback}
          size="sm"
          variant={isExpired || isUrgent ? "destructive" : "default"}
          className={cn(
            "ml-4",
            isExpired && "animate-pulse",
            isUrgent && "animate-pulse"
          )}
        >
          {getButtonText()}
        </Button>
      </div>
      
      {/* Barre de progression du temps restant */}
      {!isExpired && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Temps restant</span>
            <span>
              {timeLeft.days > 0 && `${timeLeft.days}j `}
              {timeLeft.hours > 0 && `${timeLeft.hours}h `}
              {timeLeft.minutes}min
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-1000",
                isUrgent && "bg-red-500",
                isWarning && "bg-yellow-500",
                !isWarning && !isUrgent && "bg-blue-500"
              )}
              style={{
                width: `${Math.min(100, Math.max(0, (timeLeft.totalMinutes / (7 * 24 * 60)) * 100))}%`
              }}
            />
          </div>
        </div>
      )}
    </Alert>
  )
}

export default FeedbackDeadlineAlert
