import React from 'react'
import { motion } from 'framer-motion'
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
  Apple,
  Trophy,
  CreditCard,
  Palette
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
    // 📊 DASHBOARD & VUE D'ENSEMBLE
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null, description: 'Vue d\'ensemble de votre activité', category: 'dashboard' },
    
    // 👥 GESTION DES CLIENTS
    { id: 'clients', label: 'Clients', icon: Users, badge: null, description: 'Gérez vos clients et leurs profils', category: 'clients' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: null, description: 'Communication avec vos clients', category: 'clients' },
    { id: 'feedbacks-hebdomadaires', label: 'Feedbacks', icon: Star, badge: null, description: 'Collectez les retours hebdomadaires', category: 'clients' },
    
    // 🏋️ ENTRAÎNEMENTS & EXERCICES
    { id: 'workouts', label: 'Workouts', icon: Dumbbell, badge: null, description: 'Créez et organisez les entraînements', category: 'workouts' },
    { id: 'exercices', label: 'Exercices', icon: Target, badge: null, description: 'Bibliothèque d\'exercices', category: 'workouts' },
    
    // 📅 PLANNING & RENDEZ-VOUS
    { id: 'calendar', label: 'Calendrier', icon: Calendar, badge: null, description: 'Gérez vos rendez-vous et créneaux', category: 'planning' },
    
    // 🥗 NUTRITION & SUIVI
    { id: 'nutrition', label: 'Nutrition', icon: Apple, badge: null, description: 'Suivi nutritionnel des clients', category: 'nutrition' },
    
    // 🏆 GAMIFICATION & RÉCOMPENSES
    { id: 'trophies', label: 'Trophées', icon: Trophy, badge: null, description: 'Système de gamification et récompenses', category: 'gamification' },
    
    // 💰 FACTURATION & BUSINESS
    { id: 'billing', label: 'Facturation', icon: CreditCard, badge: null, description: 'Gérez vos revenus et factures', category: 'business' },
    
    // ⚙️ PERSONNALISATION & PARAMÈTRES
    { id: 'color-customizer', label: 'Personnalisation', icon: Palette, badge: null, description: 'Personnalisez vos couleurs', category: 'settings' },
    { id: 'settings', label: 'Paramètres', icon: Settings, badge: null, description: 'Paramètres de votre compte', category: 'settings' }
  ]

  const clientNavItems = [
    // 📊 DASHBOARD & VUE D'ENSEMBLE
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null, description: 'Votre tableau de bord personnel', category: 'dashboard' },
    
    // 🏋️ ENTRAÎNEMENTS & PROGRESSION
    { id: 'seances', label: 'Mes séances', icon: Dumbbell, badge: null, description: 'Vos entraînements programmés', category: 'workouts' },
    { id: 'progression', label: 'Ma progression', icon: Target, badge: null, description: 'Suivez vos progrès et évolution', category: 'workouts' },
    { id: 'trophies', label: 'Mes Trophées', icon: Trophy, badge: null, description: 'Vos accomplissements et récompenses', category: 'workouts' },
    
    // 📅 PLANNING & RENDEZ-VOUS
    { id: 'calendar', label: 'Mes RDV', icon: Calendar, badge: null, description: 'Gérez vos rendez-vous avec votre coach', category: 'planning' },
    
    // 🥗 NUTRITION & SANTÉ
    { id: 'nutrition', label: 'Nutrition', icon: Apple, badge: null, description: 'Suivez votre alimentation', category: 'nutrition' },
    
    // 💬 COMMUNICATION & SUIVI
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: null, description: 'Échangez avec votre coach', category: 'communication' },
    { id: 'feedbacks-hebdomadaires', label: 'Feedbacks Hebdo', icon: Star, badge: null, description: 'Vos retours hebdomadaires', category: 'communication' },
    
    // 📚 RESSOURCES & DOCUMENTS
    { id: 'ressources', label: 'Mes ressources', icon: FileText, badge: null, description: 'Documents et guides personnalisés', category: 'resources' },
    
    // 💰 FACTURATION & ADMINISTRATIF
    { id: 'billing', label: 'Mes Factures', icon: CreditCard, badge: null, description: 'Gérez vos factures et paiements', category: 'billing' },
    
    // ⚙️ PARAMÈTRES
    { id: 'settings', label: 'Paramètres', icon: Settings, badge: null, description: 'Gérez votre profil', category: 'settings' }
  ]

  const navItems = profile?.role === 'coach' ? coachNavItems : clientNavItems

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative h-screen bg-sidebar-bg border-r border-sidebar-border flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sidebar-active rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-sidebar-active-text" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-sidebar-text">BYW</h1>
                <p className="text-xs text-sidebar-text-muted">Build Your Way</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-text hover:bg-orange-100 hover:text-orange-600 dark:hover:bg-orange-900/20 dark:hover:text-orange-300 transition-colors"
            title={isCollapsed ? "Agrandir la sidebar" : "Réduire la sidebar"}
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
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-text-muted scrollbar-track-transparent hover:scrollbar-thumb-sidebar-text">
        <div className="space-y-6">
          {(() => {
            // Grouper les items par catégorie
            const groupedItems = navItems.reduce((acc, item) => {
              const category = item.category || 'other'
              if (!acc[category]) {
                acc[category] = []
              }
              acc[category].push(item)
              return acc
            }, {} as Record<string, typeof navItems>)

            // Définir l'ordre des catégories
            const categoryOrder = profile?.role === 'coach' 
              ? ['dashboard', 'clients', 'workouts', 'planning', 'nutrition', 'gamification', 'business', 'settings']
              : ['dashboard', 'workouts', 'planning', 'nutrition', 'communication', 'resources', 'billing', 'settings']

            return categoryOrder.map((categoryKey) => {
              const items = groupedItems[categoryKey] || []
              if (items.length === 0) return null

              // Noms des catégories
              const categoryNames = {
                dashboard: '📊 Vue d\'ensemble',
                clients: '👥 Gestion des clients',
                workouts: '🏋️ Entraînements',
                planning: '📅 Planning',
                nutrition: '🥗 Nutrition',
                gamification: '🏆 Gamification',
                business: '💰 Business',
                communication: '💬 Communication',
                resources: '📚 Ressources',
                billing: '💰 Facturation',
                settings: '⚙️ Paramètres'
              }

              return (
                <div key={categoryKey} className="space-y-2">
                  {/* En-tête de catégorie */}
                  {!isCollapsed && (
                    <div className="px-2 py-1">
                      <h3 className="text-xs font-semibold text-sidebar-text-muted uppercase tracking-wider">
                        {categoryNames[categoryKey as keyof typeof categoryNames] || categoryKey}
                      </h3>
                    </div>
                  )}

                  {/* Items de la catégorie */}
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeTab === item.id
                      
                      return (
                        <div key={item.id} className="relative group">
                          <Button
                            variant={isActive ? "default" : "ghost"}
                            className={cn(
                              "w-full justify-start h-11 transition-all duration-200 relative overflow-hidden",
                              isCollapsed ? "px-0" : "px-4",
                              isActive && "bg-orange-100 text-orange-700 shadow-sm border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700",
                              !isActive && "hover:bg-orange-50 hover:text-orange-600 hover:scale-[1.02] text-sidebar-text hover:border-orange-100 dark:hover:bg-orange-900/20 dark:hover:text-orange-300 dark:text-sidebar-text dark:hover:border-orange-800"
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
                            
                            {!isCollapsed && (
                              <div className="flex items-center justify-between flex-1 min-w-0">
                                <span className="font-medium text-sm truncate text-sidebar-text">
                                  {item.label}
                                </span>
                                
                                {/* Badge */}
                                {item.badge && (
                                  <div
                                    className={cn(
                                      "px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ml-2",
                                      item.badgeColor || "bg-red-500"
                                    )}
                                  >
                                    {item.badge}
                                  </div>
                                )}
                              </div>
                            )}
                            
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
                            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg border border-border">
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-popover rotate-45 border-l border-b border-border"></div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </nav>

    </motion.aside>
  )
}

export default Sidebar