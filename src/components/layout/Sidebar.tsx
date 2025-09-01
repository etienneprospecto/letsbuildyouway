import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  Users, 
  Dumbbell, 
  MessageSquare, 
  Settings,
  Calendar,
  Target,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggle, 
  activeTab, 
  onTabChange 
}) => {
  const { user, profile } = useAuth()

  const coachNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell },
    { id: 'exercices', label: 'Exercices', icon: Target },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'feedbacks-hebdomadaires', label: 'Feedbacks', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const clientNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'seances', label: 'Mes séances', icon: Calendar },
    { id: 'progression', label: 'Ma progression', icon: Target },
    { id: 'feedbacks-hebdomadaires', label: 'Feedbacks Hebdo', icon: MessageSquare },
    { id: 'ressources', label: 'Mes ressources', icon: Dumbbell },
    { id: 'profile', label: 'Mon profil', icon: User },
    { id: 'messages', label: 'Messages', icon: MessageSquare }
  ]

  const navItems = profile?.role === 'coach' ? coachNavItems : clientNavItems

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative h-screen bg-background border-r border-border flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">FitCoach</h1>
                  <p className="text-xs text-muted-foreground">Pro Dashboard</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-11 transition-all duration-200",
                  isCollapsed ? "px-0" : "px-4",
                  isActive && "bg-primary text-primary-foreground shadow-sm"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Role Badge */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center space-x-3 p-3 rounded-lg bg-muted",
          isCollapsed && "justify-center"
        )}>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            profile?.role === 'coach' ? "bg-blue-500 text-white" : "bg-green-500 text-white"
          )}>
            {profile?.role === 'coach' ? '👨‍💼' : '🏃‍♂️'}
          </div>
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-sm font-medium capitalize">{profile?.role} Mode</p>
                <p className="text-xs text-muted-foreground">
                  {profile?.first_name} {profile?.last_name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}

export default Sidebar