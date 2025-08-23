import React from 'react'
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
import { Settings, LogOut, User, Palette } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useCoachConnection } from '@/hooks/useCoachConnection'
import { getInitials } from '@/lib/utils'

const Header: React.FC = () => {
  const { user, profile, signOut } = useAuth()
  const { isCoachOnline, coachEmail } = useCoachConnection()

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