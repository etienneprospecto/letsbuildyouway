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
  ChevronRight,
  Star,
  FileText,
  Apple
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
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null, description: 'Vue d\'ensemble de votre activité' },
    { id: 'clients', label: 'Clients', icon: Users, badge: null, description: 'Gérez vos clients et leurs profils' },
    { id: 'calendar', label: 'Calendrier', icon: Calendar, badge: null, description: 'Gérez vos rendez-vous et créneaux' },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell, badge: null, description: 'Créez et organisez les entraînements' },
    { id: 'exercices', label: 'Exercices', icon: Target, badge: null, description: 'Bibliothèque d\'exercices' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, badge: null, description: 'Suivi nutritionnel des clients' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: null, description: 'Communication avec vos clients' },
    { id: 'feedbacks-hebdomadaires', label: 'Feedbacks', icon: Star, badge: null, description: 'Collectez les retours hebdomadaires' },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, description: 'Paramètres de votre compte' }
  ]

  const clientNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null, description: 'Votre tableau de bord personnel' },
    { id: 'calendar', label: 'Mes RDV', icon: Calendar, badge: null, description: 'Gérez vos rendez-vous avec votre coach' },
    { id: 'seances', label: 'Mes séances', icon: Dumbbell, badge: null, description: 'Vos entraînements programmés' },
    { id: 'progression', label: 'Ma progression', icon: Target, badge: null, description: 'Suivez vos progrès et évolution' },
    { id: 'nutrition', label: 'Nutrition', icon: Apple, badge: null, description: 'Suivez votre alimentation' },
    { id: 'feedbacks-hebdomadaires', label: 'Feedbacks Hebdo', icon: Star, badge: null, description: 'Vos retours hebdomadaires' },
    { id: 'ressources', label: 'Mes ressources', icon: FileText, badge: null, description: 'Documents et guides personnalisés' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: null, description: 'Échangez avec votre coach' },
    { id: 'settings', label: 'Paramètres', icon: Settings, badge: null, description: 'Gérez votre profil' }
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
                  <h1 className="font-bold text-lg">BYW</h1>
                  <p className="text-xs text-muted-foreground">Build Your Way</p>
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
              <div key={item.id} className="relative group">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start h-11 transition-all duration-200 relative overflow-hidden",
                    isCollapsed ? "px-0" : "px-4",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    !isActive && "hover:bg-muted/50 hover:scale-[1.02]"
                  )}
                  onClick={() => onTabChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-3")} />
                  </motion.div>
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between flex-1 min-w-0"
                      >
                        <span className="font-medium text-sm truncate">
                          {item.label}
                        </span>
                        
                        {/* Badge */}
                        {item.badge && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ml-2",
                              item.badgeColor || "bg-red-500"
                            )}
                          >
                            {item.badge}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Indicateur actif */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
                
                {/* Tooltip pour mode collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                )}
              </div>
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