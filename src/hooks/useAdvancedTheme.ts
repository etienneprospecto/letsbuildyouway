import { useState, useEffect } from 'react'
import { advancedThemeService, UserTheme, ThemePreset, CommunityTheme } from '@/services/advancedThemeService'

export const useAdvancedTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<UserTheme | null>(null)
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [communityThemes, setCommunityThemes] = useState<CommunityTheme[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const initializeTheme = async () => {
      try {
        setIsLoading(true)
        
        // Initialiser le service si pas encore fait
        await advancedThemeService.init()
        
        // Charger le thème actuel
        const theme = advancedThemeService.getCurrentTheme()
        setCurrentTheme(theme)

        // Charger les presets
        const presetsData = advancedThemeService.getPresets()
        setPresets(presetsData)

        // Charger les thèmes communautaires
        const communityData = await advancedThemeService.getCommunityThemes()
        setCommunityThemes(communityData)

        // Écouter les changements de thème
        unsubscribe = advancedThemeService.onThemeChange(setCurrentTheme)
        
      } catch (error) {
        console.error('Erreur initialisation thème avancé:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeTheme()
    
    return () => {
      unsubscribe?.()
    }
  }, [])

  const updatePrimaryColor = async (color: string) => {
    try {
      await advancedThemeService.updatePrimaryColor(color)
    } catch (error) {
      console.error('Erreur mise à jour couleur primaire:', error)
    }
  }

  const updateMode = async (mode: 'light' | 'dark' | 'system') => {
    try {
      await advancedThemeService.updateMode(mode)
    } catch (error) {
      console.error('Erreur mise à jour mode:', error)
    }
  }

  const applyPreset = async (preset: ThemePreset) => {
    try {
      await advancedThemeService.applyPreset(preset)
    } catch (error) {
      console.error('Erreur application preset:', error)
    }
  }

  const exportTheme = () => {
    try {
      advancedThemeService.exportTheme()
    } catch (error) {
      console.error('Erreur export thème:', error)
    }
  }

  const importTheme = async (file: File) => {
    try {
      await advancedThemeService.importTheme(file)
    } catch (error) {
      console.error('Erreur import thème:', error)
      throw error
    }
  }

  const validateAccessibility = () => {
    return advancedThemeService.validateAccessibility()
  }

  const getCurrentMode = () => {
    if (!currentTheme) return 'system'
    if (currentTheme.mode_preference === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return currentTheme.mode_preference
  }

  const isDark = getCurrentMode() === 'dark'

  return {
    // État
    currentTheme,
    presets,
    communityThemes,
    isLoading,
    isDark,
    currentMode: getCurrentMode(),
    
    // Actions
    updatePrimaryColor,
    updateMode,
    applyPreset,
    exportTheme,
    importTheme,
    validateAccessibility,
    
    // Utilitaires
    getCurrentMode
  }
}
