import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor, Palette, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { advancedThemeService, UserTheme } from '@/services/advancedThemeService'
import { cn } from '@/lib/utils'

interface QuickThemeToggleProps {
  variant?: 'sidebar' | 'header' | 'compact'
  showColorPicker?: boolean
  className?: string
}

const QuickThemeToggle: React.FC<QuickThemeToggleProps> = ({ 
  variant = 'sidebar',
  showColorPicker = true,
  className 
}) => {
  const [currentTheme, setCurrentTheme] = useState<UserTheme | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Initialiser le service
        await advancedThemeService.init()
        
        // Charger le thème actuel
        const theme = advancedThemeService.getCurrentTheme()
        setCurrentTheme(theme)

        // Écouter les changements
        const unsubscribe = advancedThemeService.onThemeChange(setCurrentTheme)
        return unsubscribe
      } catch (error) {
        console.error('Erreur initialisation QuickThemeToggle:', error)
        return undefined
      }
    }

    let unsubscribe: (() => void) | undefined
    initializeTheme().then(unsub => {
      unsubscribe = unsub
    })

    return () => {
      unsubscribe?.()
    }
  }, [])

  const handleModeChange = async (mode: 'light' | 'dark' | 'system') => {
    await advancedThemeService.updateMode(mode)
  }

  const handleColorChange = async (color: string) => {
    await advancedThemeService.updatePrimaryColor(color)
  }

  const getCurrentMode = () => {
    if (!currentTheme) return 'system'
    if (currentTheme.mode_preference === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return currentTheme.mode_preference
  }

  const getModeIcon = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light': return Sun
      case 'dark': return Moon
      case 'system': return Monitor
    }
  }

  const getModeLabel = (mode: 'light' | 'dark' | 'system') => {
    switch (mode) {
      case 'light': return 'Clair'
      case 'dark': return 'Sombre'
      case 'system': return 'Auto'
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn("relative", className)}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8"
          title={`Mode actuel: ${getModeLabel(getCurrentMode())}`}
        >
          {React.createElement(getModeIcon(getCurrentMode()), { className: "h-4 w-4" })}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-0 mt-2 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[200px]"
            >
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground px-2">Mode d'affichage</div>
                {(['light', 'dark', 'system'] as const).map((mode) => {
                  const Icon = getModeIcon(mode)
                  const isActive = getCurrentMode() === mode
                  
                  return (
                    <Button
                      key={mode}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        handleModeChange(mode)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-primary text-primary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {getModeLabel(mode)}
                    </Button>
                  )
                })}
                
                {showColorPicker && currentTheme && (
                  <>
                    <div className="border-t border-border my-2" />
                    <div className="text-xs font-medium text-muted-foreground px-2">Couleur</div>
                    <div className="flex items-center gap-2 px-2">
                      <input
                        type="color"
                        value={currentTheme.primary_color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-6 h-6 rounded border border-border cursor-pointer"
                        title="Couleur principale"
                      />
                      <span className="text-xs text-muted-foreground">
                        {currentTheme.primary_color}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (variant === 'header') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex bg-muted rounded-lg p-1">
          {(['light', 'dark', 'system'] as const).map((mode) => {
            const Icon = getModeIcon(mode)
            const isActive = getCurrentMode() === mode
            
            return (
              <Button
                key={mode}
                variant="ghost"
                size="sm"
                onClick={() => handleModeChange(mode)}
                className={cn(
                  "h-8 px-3",
                  isActive && "bg-background shadow-sm"
                )}
                title={getModeLabel(mode)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            )
          })}
        </div>
        
        {showColorPicker && currentTheme && (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={currentTheme.primary_color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
              title="Couleur principale"
            />
          </div>
        )}
      </div>
    )
  }

  // Variant sidebar (défaut)
  return (
    <div className={cn("space-y-4", className)}>
      {/* Toggle Mode */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-sidebar-text-muted px-2">Mode d'affichage</div>
        <div className="space-y-1">
          {(['light', 'dark', 'system'] as const).map((mode) => {
            const Icon = getModeIcon(mode)
            const isActive = getCurrentMode() === mode
            
            return (
              <Button
                key={mode}
                variant="ghost"
                onClick={() => handleModeChange(mode)}
                className={cn(
                  "w-full justify-start h-9 text-sm",
                  isActive && "bg-sidebar-active-bg text-sidebar-active-text",
                  !isActive && "hover:bg-sidebar-hover text-sidebar-text"
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                {getModeLabel(mode)}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Color Picker */}
      {showColorPicker && currentTheme && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-sidebar-text-muted px-2">Couleur principale</div>
          <div className="px-2">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-hover">
              <input
                type="color"
                value={currentTheme.primary_color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-8 h-8 rounded border border-sidebar-border cursor-pointer"
                title="Couleur principale"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-text truncate">
                  {currentTheme.primary_color}
                </div>
                <div className="text-xs text-sidebar-text-muted">
                  {currentTheme.theme_name}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-sidebar-text-muted px-2">Couleurs rapides</div>
        <div className="grid grid-cols-3 gap-1 px-2">
          {[
            '#8B5CF6', // Violet
            '#FF6B35', // Orange
            '#1976D2', // Bleu
            '#388E3C', // Vert
            '#7B1FA2', // Violet foncé
            '#D32F2F'  // Rouge
          ].map((color) => (
            <button
              key={color}
              onClick={() => handleColorChange(color)}
              className={cn(
                "w-6 h-6 rounded border-2 border-sidebar-border hover:scale-110 transition-transform",
                currentTheme?.primary_color === color && "ring-2 ring-sidebar-active"
              )}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default QuickThemeToggle
