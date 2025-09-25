import { supabase } from '@/lib/supabase'

export type Theme = 'light' | 'dark' | 'system'

export interface ThemeService {
  getTheme(): Theme
  setTheme(theme: Theme): Promise<void>
  getSystemTheme(): 'light' | 'dark'
  initTheme(): void
  onThemeChange(callback: (theme: Theme) => void): () => void
}

class ThemeServiceImpl implements ThemeService {
  private listeners: Set<(theme: Theme) => void> = new Set()
  private currentTheme: Theme = 'system'

  constructor() {
    this.initTheme()
  }

  getTheme(): Theme {
    return this.currentTheme
  }

  getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  async setTheme(theme: Theme): Promise<void> {
    this.currentTheme = theme
    this.applyTheme(theme)
    
    // Sauvegarder en localStorage
    localStorage.setItem('theme', theme)
    
    // Sauvegarder en base de données si utilisateur connecté
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .update({ theme_preference: theme })
          .eq('id', user.id)
      }
    } catch (error) {
      console.warn('Erreur sauvegarde thème en base:', error)
    }
    
    // Notifier les listeners
    this.listeners.forEach(callback => callback(theme))
  }

  initTheme(): void {
    if (typeof window === 'undefined') return

    // Récupérer le thème sauvegardé
    const savedTheme = localStorage.getItem('theme') as Theme | null
    
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.currentTheme = savedTheme
    } else {
      // Essayer de récupérer depuis la base de données
      this.loadThemeFromDatabase()
    }
    
    this.applyTheme(this.currentTheme)
    
    // Écouter les changements de préférence système
    if (this.currentTheme === 'system') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        this.applyTheme('system')
      })
    }
  }

  private async loadThemeFromDatabase(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('theme_preference')
          .eq('id', user.id)
          .single()
        
        if (data?.theme_preference) {
          this.currentTheme = data.theme_preference as Theme
        }
      }
    } catch (error) {
      console.warn('Erreur chargement thème depuis la base:', error)
    }
  }

  private applyTheme(theme: Theme): void {
    if (typeof window === 'undefined') return

    const html = document.documentElement
    
    // Supprimer les classes existantes
    html.classList.remove('light', 'dark')
    
    if (theme === 'system') {
      const systemTheme = this.getSystemTheme()
      html.classList.add(systemTheme)
      html.setAttribute('data-theme', systemTheme)
    } else {
      html.classList.add(theme)
      html.setAttribute('data-theme', theme)
    }
  }

  onThemeChange(callback: (theme: Theme) => void): () => void {
    this.listeners.add(callback)
    
    // Retourner une fonction de nettoyage
    return () => {
      this.listeners.delete(callback)
    }
  }
}

// Instance singleton
export const themeService = new ThemeServiceImpl()

// Hook React pour utiliser le service de thème
export const useTheme = () => {
  const [theme, setThemeState] = React.useState<Theme>(themeService.getTheme())
  
  React.useEffect(() => {
    const unsubscribe = themeService.onThemeChange(setThemeState)
    return unsubscribe
  }, [])
  
  const setTheme = React.useCallback((newTheme: Theme) => {
    themeService.setTheme(newTheme)
  }, [])
  
  return {
    theme,
    setTheme,
    systemTheme: themeService.getSystemTheme(),
    isDark: theme === 'dark' || (theme === 'system' && themeService.getSystemTheme() === 'dark')
  }
}

// Import React pour le hook
import React from 'react'
