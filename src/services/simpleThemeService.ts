import { supabase } from '@/lib/supabase'

export interface SimpleTheme {
  id?: string
  user_id?: string
  primary_color: string
  secondary_color: string
  tertiary_color: string
  mode: 'light' | 'dark'
  is_active: boolean
  created_at?: string
  updated_at?: string
}

class SimpleThemeService {
  private currentTheme: SimpleTheme | null = null
  private listeners: Set<(theme: SimpleTheme) => void> = new Set()
  private isInitialized = false

  // Thème par défaut avec orange BYW
  private readonly DEFAULT_THEME: SimpleTheme = {
    primary_color: '#FF6B35',    // Orange BYW principal
    secondary_color: '#FF8C42',  // Orange secondaire
    tertiary_color: '#FFB74D',   // Orange tertiaire
    mode: 'light',
    is_active: true
  }

  constructor() {
    this.init()
  }

  /**
   * Initialise le service de thème
   */
  async init(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Charger le thème utilisateur
      await this.loadUserTheme()
      this.isInitialized = true
    } catch (error) {
      console.error('Erreur initialisation thème:', error)
      this.applyDefaultTheme()
      this.isInitialized = true
    }
  }

  /**
   * Charge le thème utilisateur depuis Supabase ou localStorage
   */
  private async loadUserTheme(): Promise<void> {
    try {
      // Temporairement désactivé pour éviter l'erreur 406
      // const { data: { user } } = await supabase.auth.getUser()
      
      // if (user) {
      //   // Charger depuis Supabase (avec gestion d'erreur 404)
      //   const { data, error } = await supabase
      //     .from('user_themes')
      //     .select('*')
      //     .eq('user_id', user.id)
      //     .eq('is_active', true)
      //     .single()

      //   if (data && !error) {
      //     this.currentTheme = {
      //       primary_color: data.primary_color,
      //       secondary_color: data.secondary_color,
      //       tertiary_color: data.accent_color, // Utilise accent_color comme tertiary
      //       mode: data.mode_preference === 'system' 
      //         ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      //         : data.mode_preference,
      //       is_active: data.is_active
      //     }
      //     this.applyTheme(this.currentTheme)
      //     return
      //   } else if (error && error.code !== 'PGRST116') {
      //     // PGRST116 = no rows found, on continue vers localStorage
      //     console.warn('Erreur chargement thème Supabase:', error)
      //   }
      // }

      // Fallback vers localStorage
      const savedTheme = localStorage.getItem('byw_simple_theme')
      if (savedTheme) {
        try {
          const theme = JSON.parse(savedTheme)
          this.currentTheme = theme
          this.applyTheme(theme)
          return
        } catch (parseError) {
          console.warn('Erreur parsing thème localStorage:', parseError)
        }
      }

      // Thème par défaut
      this.applyDefaultTheme()
    } catch (error) {
      console.error('Erreur chargement thème:', error)
      this.applyDefaultTheme()
    }
  }

  /**
   * Applique le thème par défaut
   */
  private applyDefaultTheme(): void {
    this.currentTheme = { ...this.DEFAULT_THEME }
    this.applyTheme(this.currentTheme)
  }

  /**
   * Applique un thème complet
   */
  private applyTheme(theme: SimpleTheme): void {
    const root = document.documentElement

    // Appliquer les couleurs personnalisées
    root.style.setProperty('--user-primary', theme.primary_color)
    root.style.setProperty('--user-secondary', theme.secondary_color)
    root.style.setProperty('--user-tertiary', theme.tertiary_color)

    // Convertir les couleurs hex en HSL pour les variables CSS principales
    const primaryHsl = this.hexToHsl(theme.primary_color)
    const secondaryHsl = this.hexToHsl(theme.secondary_color)
    const tertiaryHsl = this.hexToHsl(theme.tertiary_color)

    // Appliquer aux variables CSS principales
    root.style.setProperty('--primary', primaryHsl)
    root.style.setProperty('--secondary', secondaryHsl)
    root.style.setProperty('--accent', tertiaryHsl)

    // Appliquer les couleurs de foreground (texte sur les couleurs)
    root.style.setProperty('--primary-foreground', '0 0% 100%')
    root.style.setProperty('--secondary-foreground', '0 0% 100%')
    root.style.setProperty('--accent-foreground', '0 0% 100%')

    // Appliquer les couleurs de ring (focus)
    root.style.setProperty('--ring', primaryHsl)

    // Appliquer les couleurs de sidebar
    root.style.setProperty('--sidebar-active', primaryHsl)
    root.style.setProperty('--sidebar-active-bg', primaryHsl)
    root.style.setProperty('--sidebar-active-text', '0 0% 100%')

    // Appliquer le mode (clair/sombre)
    this.applyMode(theme.mode)
    
    // Notifier les listeners
    this.notifyThemeChange(theme)
  }

  /**
   * Convertit une couleur hex en HSL
   */
  private hexToHsl(hex: string): string {
    // Supprimer le # si présent
    hex = hex.replace('#', '')
    
    // Gérer les formats courts (3 caractères)
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('')
    }
    
    // Vérifier que c'est un hex valide
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
      console.warn('Couleur hex invalide:', hex, 'utilisant la couleur par défaut')
      return '20 100% 50%' // Orange par défaut
    }
    
    // Convertir en RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    // S'assurer que les valeurs sont dans les bonnes plages
    const hue = Math.round(h * 360)
    const saturation = Math.round(s * 100)
    const lightness = Math.round(l * 100)

    return `${hue} ${saturation}% ${lightness}%`
  }

  /**
   * Applique le mode (clair/sombre)
   */
  private applyMode(mode: 'light' | 'dark'): void {
    const html = document.documentElement
    
    // Supprimer les classes existantes
    html.classList.remove('light', 'dark')
    
    // Ajouter la classe du mode
    html.classList.add(mode)
    html.setAttribute('data-theme', mode)
  }

  /**
   * Met à jour les couleurs du thème
   */
  async updateColors(colors: {
    primary_color?: string
    secondary_color?: string
    tertiary_color?: string
  }): Promise<void> {
    if (!this.currentTheme) return

    const updatedTheme = {
      ...this.currentTheme,
      ...colors,
      updated_at: new Date().toISOString()
    }

    this.currentTheme = updatedTheme
    
    // Appliquer immédiatement
    this.applyTheme(updatedTheme)
    
    // Sauvegarder en localStorage pour preview immédiat
    localStorage.setItem('byw_simple_theme', JSON.stringify(updatedTheme))
    
    // Sauvegarder en base de données
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            primary_color: updatedTheme.primary_color,
            secondary_color: updatedTheme.secondary_color,
            accent_color: updatedTheme.tertiary_color,
            mode_preference: updatedTheme.mode,
            is_active: true
          })

        if (error) {
          console.error('Erreur sauvegarde thème:', error)
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error)
    }
  }

  /**
   * Met à jour le mode (clair/sombre)
   */
  async updateMode(mode: 'light' | 'dark'): Promise<void> {
    if (!this.currentTheme) return

    const updatedTheme = {
      ...this.currentTheme,
      mode,
      updated_at: new Date().toISOString()
    }

    this.currentTheme = updatedTheme
    
    // Appliquer immédiatement
    this.applyTheme(updatedTheme)
    
    // Sauvegarder en localStorage
    localStorage.setItem('byw_simple_theme', JSON.stringify(updatedTheme))
    
    // Sauvegarder en base de données
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            primary_color: updatedTheme.primary_color,
            secondary_color: updatedTheme.secondary_color,
            accent_color: updatedTheme.tertiary_color,
            mode_preference: updatedTheme.mode,
            is_active: true
          })

        if (error) {
          console.error('Erreur sauvegarde thème:', error)
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error)
    }
  }

  /**
   * Réinitialise le thème aux valeurs par défaut
   */
  async resetTheme(): Promise<void> {
    this.currentTheme = { ...this.DEFAULT_THEME }
    this.applyTheme(this.currentTheme)
    
    // Sauvegarder
    localStorage.setItem('byw_simple_theme', JSON.stringify(this.currentTheme))
    
    // Sauvegarder en base de données
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            primary_color: this.currentTheme.primary_color,
            secondary_color: this.currentTheme.secondary_color,
            accent_color: this.currentTheme.tertiary_color,
            mode_preference: this.currentTheme.mode,
            is_active: true
          })

        if (error) {
          console.error('Erreur sauvegarde thème:', error)
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde thème:', error)
    }
  }

  /**
   * Notifie les listeners d'un changement de thème
   */
  private notifyThemeChange(theme: SimpleTheme): void {
    this.listeners.forEach(callback => callback(theme))
  }

  /**
   * Ajoute un listener pour les changements de thème
   */
  onThemeChange(callback: (theme: SimpleTheme) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Obtient le thème actuel
   */
  getCurrentTheme(): SimpleTheme | null {
    return this.currentTheme
  }

  /**
   * Obtient le mode actuel
   */
  getCurrentMode(): 'light' | 'dark' {
    return this.currentTheme?.mode || 'light'
  }

  /**
   * Vérifie si le mode sombre est actif
   */
  isDarkMode(): boolean {
    return this.getCurrentMode() === 'dark'
  }

  /**
   * Force la mise à jour de tous les éléments avec les couleurs actuelles
   */
  forceUpdate(): void {
    if (this.currentTheme) {
      this.applyTheme(this.currentTheme)
    }
  }

  /**
   * Applique des couleurs de test pour vérifier le système
   */
  applyTestColors(): void {
    const testTheme = {
      primary_color: '#1976D2',  // Bleu
      secondary_color: '#42A5F5', // Bleu clair
      tertiary_color: '#64B5F6',  // Bleu très clair
      mode: 'light',
      is_active: true
    }
    
    this.currentTheme = testTheme
    this.applyTheme(testTheme)
  }
}

// Instance singleton
export const simpleThemeService = new SimpleThemeService()
