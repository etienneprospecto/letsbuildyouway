import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Settings, LogOut, User, Palette, Clock, Calendar } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useCoachConnection } from '@/hooks/useCoachConnection'
import { getInitials } from '@/lib/utils'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const { isCoachOnline, coachEmail } = useCoachConnection()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Mettre à jour l'heure en temps réel
  useEffect(() => {
    const updateTime = () => {
      // Obtenir l'heure actuelle de Paris de manière plus fiable
      const now = new Date()
      // Utiliser toLocaleString avec le fuseau horaire de Paris
      const parisTimeString = now.toLocaleString("en-US", {timeZone: "Europe/Paris"})
      const parisTime = new Date(parisTimeString)
      setCurrentTime(parisTime)
    }

    // Mettre à jour immédiatement
    updateTime()
    
    // Mettre à jour toutes les secondes
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  // Obtenir l'heure formatée (Paris/FR) - méthode corrigée
  const getCurrentTime = () => {
    // Utiliser directement toLocaleTimeString avec le fuseau horaire
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Paris'
    })
  }

  // Obtenir la date formatée (Paris/FR) - méthode corrigée
  const getCurrentDate = () => {
    // Utiliser directement toLocaleDateString avec le fuseau horaire
    return new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Paris'
    })
  }

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex h-full items-center justify-between px-6">
        {/* Role + Coach info */}
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="capitalize">
            {profile?.role === 'coach' ? 'Coach' : 'Client'}
          </Badge>
          {profile?.role === 'client' && (
            <div className="text-xs text-muted-foreground">
              Coaché par {coachEmail || '—'} · <span className={isCoachOnline ? 'text-green-600' : 'text-gray-500'}>{isCoachOnline ? 'en ligne' : 'hors ligne'}</span>
            </div>
          )}
        </div>

        {/* Heure et date */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{getCurrentTime()}</span>
            <span className="text-xs">Paris/FR</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{getCurrentDate()}</span>
          </div>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile ? getInitials(`${profile.first_name} ${profile.last_name}`) : 'U'}
                </AvatarFallback>
              </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1 capitalize">
                    {profile?.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Palette className="mr-2 h-4 w-4" />
                <span>Appearance</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default Header