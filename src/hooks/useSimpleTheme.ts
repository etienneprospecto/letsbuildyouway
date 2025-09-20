import { useState, useEffect } from 'react'
import { simpleThemeService, SimpleTheme } from '@/services/simpleThemeService'

export const useSimpleTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<SimpleTheme | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initializeTheme = async () => {
      try {
        setIsLoading(true)
        
        // Initialiser le service
        await simpleThemeService.init()
        
        // Charger le thème actuel
        const theme = simpleThemeService.getCurrentTheme()
        setCurrentTheme(theme)

        // Écouter les changements de thème
        unsubscribe = simpleThemeService.onThemeChange(setCurrentTheme)
        
      } catch (error) {
        console.error('Erreur initialisation thème:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeTheme()
    
    return () => {
      unsubscribe?.()
    }
  }, [])

  const updateColors = async (colors: {
    primary_color?: string
    secondary_color?: string
    tertiary_color?: string
  }) => {
    try {
      await simpleThemeService.updateColors(colors)
    } catch (error) {
      console.error('Erreur mise à jour couleurs:', error)
    }
  }

  const updateMode = async (mode: 'light' | 'dark') => {
    try {
      await simpleThemeService.updateMode(mode)
    } catch (error) {
      console.error('Erreur mise à jour mode:', error)
    }
  }

  const resetTheme = async () => {
    try {
      await simpleThemeService.resetTheme()
    } catch (error) {
      console.error('Erreur réinitialisation thème:', error)
    }
  }

  const toggleMode = async () => {
    const currentMode = simpleThemeService.getCurrentMode()
    await updateMode(currentMode === 'light' ? 'dark' : 'light')
  }

  return {
    // État
    currentTheme,
    isLoading,
    isDark: simpleThemeService.isDarkMode(),
    currentMode: simpleThemeService.getCurrentMode(),
    
    // Actions
    updateColors,
    updateMode,
    resetTheme,
    toggleMode
  }
}
