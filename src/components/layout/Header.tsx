import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, Clock, Calendar } from 'lucide-react'
import { useAuth } from '@/providers/OptimizedAuthProvider'
import { getInitials } from '@/lib/utils'
import QuickThemeToggle from '@/components/ui/quick-theme-toggle'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Debug temporaire
  console.log('Header - User:', user)
  console.log('Header - Profile:', profile)

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
          {/* Theme Toggle */}
          <QuickThemeToggle variant="header" showColorPicker={false} />
          
          {/* Avatar - toujours affiché */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-orange-50 hover:border-orange-200 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.first_name || 'User'} />
                  <AvatarFallback className="bg-orange-500 text-white font-semibold">
                    {profile ? getInitials(`${profile.first_name} ${profile.last_name}`) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}` 
                      : 'Utilisateur'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {profile?.email || user?.email || 'Email non disponible'}
                  </p>
                </div>
              </DropdownMenuLabel>
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