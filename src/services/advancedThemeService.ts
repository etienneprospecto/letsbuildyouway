import { supabase } from '@/lib/supabase'
import { ColorUtils, ColorPalette, HSLColor } from './colorUtils'

export interface UserTheme {
  id?: string
  user_id?: string
  theme_name: string
  primary_color: string
  secondary_color: string
  accent_color: string
  success_color: string
  warning_color: string
  danger_color: string
  mode_preference: 'light' | 'dark' | 'system'
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CommunityTheme {
  id: string
  created_by?: string
  name: string
  description?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  success_color: string
  warning_color: string
  danger_color: string
  is_public: boolean
  downloads_count: number
  likes_count: number
  tags: string[]
  created_at: string
}

export interface ThemePreset {
  name: string
  description: string
  primary_color: string
  secondary_color: string
  accent_color: string
  category: 'officiel' | 'professionnel' | 'nature' | 'creative' | 'energie' | 'sombre'
}

export class AdvancedThemeService {
  private currentTheme: UserTheme | null = null
  private listeners: Set<(theme: UserTheme) => void> = new Set()
  private isInitialized = false

  // Presets de thèmes prédéfinis
  static readonly THEME_PRESETS: ThemePreset[] = [
    {
      name: 'BYW Orange Classique',
      description: 'Thème orange signature BYW',
      primary_color: '#FF6B35',
      secondary_color: '#FF8C42',
      accent_color: '#FFB74D',
      category: 'officiel'
    },
    {
      name: 'Bleu Professionnel',
      description: 'Thème bleu pour un look professionnel',
      primary_color: '#1976D2',
      secondary_color: '#42A5F5',
      accent_color: '#64B5F6',
      category: 'professionnel'
    },
    {
      name: 'Vert Nature',
      description: 'Thème vert apaisant et naturel',
      primary_color: '#388E3C',
      secondary_color: '#66BB6A',
      accent_color: '#81C784',
      category: 'nature'
    },
    {
      name: 'Violet Creative',
      description: 'Thème violet pour la créativité',
      primary_color: '#7B1FA2',
      secondary_color: '#AB47BC',
      accent_color: '#CE93D8',
      category: 'creative'
    },
    {
      name: 'Rouge Énergie',
      description: 'Thème rouge dynamique et énergique',
      primary_color: '#D32F2F',
      secondary_color: '#F44336',
      accent_color: '#FF8A80',
      category: 'energie'
    },
    {
      name: 'Sombre Élégant',
      description: 'Thème sombre sophistiqué',
      primary_color: '#1A1A1A',
      secondary_color: '#2D2D2D',
      accent_color: '#404040',
      category: 'sombre'
    }
  ]

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
      
      // Écouter les changements de préférence système
      this.watchSystemPreference()
      
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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Charger depuis Supabase
        const { data, error } = await supabase
          .from('user_themes')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (data && !error) {
          this.currentTheme = data
          this.applyTheme(data)
          return
        }
      }

      // Fallback vers localStorage
      const savedTheme = localStorage.getItem('byw_user_theme')
      if (savedTheme) {
        const theme = JSON.parse(savedTheme)
        this.currentTheme = theme
        this.applyTheme(theme)
        return
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
    const defaultTheme: UserTheme = {
      theme_name: 'Thème par défaut',
      primary_color: '#8B5CF6',
      secondary_color: '#A78BFA',
      accent_color: '#C4B5FD',
      success_color: '#10B981',
      warning_color: '#F59E0B',
      danger_color: '#EF4444',
      mode_preference: 'system',
      is_active: true
    }

    this.currentTheme = defaultTheme
    this.applyTheme(defaultTheme)
  }

  /**
   * Applique un thème complet
   */
  private applyTheme(theme: UserTheme): void {
    // Générer la palette complète
    const palette = ColorUtils.generateColorPalette(theme.primary_color)
    
    // Appliquer les variables CSS
    this.setCSSVariables(theme, palette)
    
    // Appliquer le mode (clair/sombre)
    this.applyMode(theme.mode_preference)
    
    // Notifier les listeners
    this.notifyThemeChange(theme)
  }

  /**
   * Définit les variables CSS pour le thème
   */
  private setCSSVariables(theme: UserTheme, palette: ColorPalette): void {
    const root = document.documentElement
    const mode = this.getCurrentMode()

    // Couleurs de base
    root.style.setProperty('--user-primary', theme.primary_color)
    root.style.setProperty('--user-secondary', theme.secondary_color)
    root.style.setProperty('--user-accent', theme.accent_color)
    root.style.setProperty('--user-success', theme.success_color)
    root.style.setProperty('--user-warning', theme.warning_color)
    root.style.setProperty('--user-danger', theme.danger_color)

    // Palette générée automatiquement
    Object.entries(palette).forEach(([key, value]) => {
      if (key.includes('primary') && !key.includes('Dark')) {
        root.style.setProperty(`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value)
      }
    })

    // Couleurs adaptées pour le mode sombre
    if (mode === 'dark') {
      root.style.setProperty('--primary', palette.primaryDark)
      root.style.setProperty('--secondary', palette.secondaryDark)
      root.style.setProperty('--accent', palette.accentDark)
    } else {
      root.style.setProperty('--primary', theme.primary_color)
      root.style.setProperty('--secondary', theme.secondary_color)
      root.style.setProperty('--accent', theme.accent_color)
    }

    // Couleurs de contraste automatiques
    root.style.setProperty('--primary-contrast', ColorUtils.getContrastColor(theme.primary_color))
    root.style.setProperty('--secondary-contrast', ColorUtils.getContrastColor(theme.secondary_color))
    root.style.setProperty('--accent-contrast', ColorUtils.getContrastColor(theme.accent_color))
  }

  /**
   * Applique le mode (clair/sombre/système)
   */
  private applyMode(mode: 'light' | 'dark' | 'system'): void {
    const html = document.documentElement
    
    // Supprimer les classes existantes
    html.classList.remove('light', 'dark')
    
    if (mode === 'system') {
      const systemMode = this.getSystemMode()
      html.classList.add(systemMode)
      html.setAttribute('data-theme', systemMode)
    } else {
      html.classList.add(mode)
      html.setAttribute('data-theme', mode)
    }
  }

  /**
   * Met à jour la couleur primaire
   */
  async updatePrimaryColor(color: string): Promise<void> {
    if (!this.currentTheme) return

    const updatedTheme = {
      ...this.currentTheme,
      primary_color: color,
      // Régénérer les couleurs harmonieuses
      secondary_color: ColorUtils.generateHarmoniousColor(color, 'analogous'),
      accent_color: ColorUtils.generateHarmoniousColor(color, 'complementary'),
      updated_at: new Date().toISOString()
    }

    await this.updateTheme(updatedTheme)
  }

  /**
   * Met à jour le mode (clair/sombre/système)
   */
  async updateMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    if (!this.currentTheme) return

    const updatedTheme = {
      ...this.currentTheme,
      mode_preference: mode,
      updated_at: new Date().toISOString()
    }

    await this.updateTheme(updatedTheme)
  }

  /**
   * Met à jour un thème complet
   */
  async updateTheme(theme: UserTheme): Promise<void> {
    this.currentTheme = theme
    
    // Appliquer immédiatement
    this.applyTheme(theme)
    
    // Sauvegarder en localStorage pour preview immédiat
    localStorage.setItem('byw_user_theme', JSON.stringify(theme))
    
    // Sauvegarder en base de données
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('user_themes')
          .upsert({
            user_id: user.id,
            ...theme
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
   * Applique un preset de thème
   */
  async applyPreset(preset: ThemePreset): Promise<void> {
    const theme: UserTheme = {
      theme_name: preset.name,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      accent_color: preset.accent_color,
      success_color: '#10B981',
      warning_color: '#F59E0B',
      danger_color: '#EF4444',
      mode_preference: this.currentTheme?.mode_preference || 'system',
      is_active: true
    }

    await this.updateTheme(theme)
  }

  /**
   * Charge les thèmes communautaires
   */
  async getCommunityThemes(): Promise<CommunityTheme[]> {
    try {
      const { data, error } = await supabase
        .from('community_themes')
        .select('*')
        .eq('is_public', true)
        .order('downloads_count', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erreur chargement thèmes communautaires:', error)
      return []
    }
  }

  /**
   * Sauvegarde un thème communautaire
   */
  async saveCommunityTheme(theme: Omit<CommunityTheme, 'id' | 'created_at' | 'downloads_count' | 'likes_count'>): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Utilisateur non connecté')

      const { error } = await supabase
        .from('community_themes')
        .insert({
          created_by: user.id,
          ...theme
        })

      if (error) throw error
    } catch (error) {
      console.error('Erreur sauvegarde thème communautaire:', error)
      throw error
    }
  }

  /**
   * Exporte le thème actuel
   */
  exportTheme(): void {
    if (!this.currentTheme) return

    const exportData = {
      ...this.currentTheme,
      exported_at: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `byw-theme-${this.currentTheme.theme_name.toLowerCase().replace(/\s+/g, '-')}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  /**
   * Importe un thème depuis un fichier
   */
  async importTheme(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string)
          
          // Valider la structure du thème
          if (!this.validateThemeStructure(themeData)) {
            throw new Error('Format de thème invalide')
          }

          const theme: UserTheme = {
            theme_name: themeData.theme_name || 'Thème importé',
            primary_color: themeData.primary_color,
            secondary_color: themeData.secondary_color,
            accent_color: themeData.accent_color,
            success_color: themeData.success_color || '#10B981',
            warning_color: themeData.warning_color || '#F59E0B',
            danger_color: themeData.danger_color || '#EF4444',
            mode_preference: themeData.mode_preference || 'system',
            is_active: true
          }

          await this.updateTheme(theme)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Erreur lecture fichier'))
      reader.readAsText(file)
    })
  }

  /**
   * Valide la structure d'un thème importé
   */
  private validateThemeStructure(data: any): boolean {
    return data &&
           typeof data.primary_color === 'string' &&
           typeof data.secondary_color === 'string' &&
           typeof data.accent_color === 'string' &&
           /^#[0-9A-F]{6}$/i.test(data.primary_color) &&
           /^#[0-9A-F]{6}$/i.test(data.secondary_color) &&
           /^#[0-9A-F]{6}$/i.test(data.accent_color)
  }

  /**
   * Valide l'accessibilité du thème actuel
   */
  validateAccessibility(): {
    isValid: boolean
    issues: Array<{
      element: string
      foreground: string
      background: string
      ratio: number
      grade: 'AAA' | 'AA' | 'Fail'
      recommendation: string
    }>
  } {
    if (!this.currentTheme) {
      return { isValid: true, issues: [] }
    }

    const issues: any[] = []
    const combinations = [
      { element: 'Primary/Background', fg: this.currentTheme.primary_color, bg: '#FFFFFF' },
      { element: 'Primary/Background Dark', fg: this.currentTheme.primary_color, bg: '#000000' },
      { element: 'Secondary/Background', fg: this.currentTheme.secondary_color, bg: '#FFFFFF' },
      { element: 'Secondary/Background Dark', fg: this.currentTheme.secondary_color, bg: '#000000' }
    ]

    combinations.forEach(({ element, fg, bg }) => {
      const validation = ColorUtils.validateAccessibility(fg, bg)
      if (!validation.isValid) {
        issues.push({
          element,
          foreground: fg,
          background: bg,
          ratio: validation.ratio,
          grade: validation.grade,
          recommendation: validation.recommendation || 'Augmentez le contraste'
        })
      }
    })

    return {
      isValid: issues.length === 0,
      issues
    }
  }

  /**
   * Écoute les changements de préférence système
   */
  private watchSystemPreference(): void {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (this.currentTheme?.mode_preference === 'system') {
        this.applyMode('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
  }

  /**
   * Obtient le mode système actuel
   */
  private getSystemMode(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /**
   * Obtient le mode actuel (en tenant compte du système)
   */
  private getCurrentMode(): 'light' | 'dark' {
    if (!this.currentTheme) return 'light'
    
    if (this.currentTheme.mode_preference === 'system') {
      return this.getSystemMode()
    }
    
    return this.currentTheme.mode_preference
  }

  /**
   * Notifie les listeners d'un changement de thème
   */
  private notifyThemeChange(theme: UserTheme): void {
    this.listeners.forEach(callback => callback(theme))
  }

  /**
   * Ajoute un listener pour les changements de thème
   */
  onThemeChange(callback: (theme: UserTheme) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Obtient le thème actuel
   */
  getCurrentTheme(): UserTheme | null {
    return this.currentTheme
  }

  /**
   * Obtient les presets disponibles
   */
  getPresets(): ThemePreset[] {
    return AdvancedThemeService.THEME_PRESETS
  }
}

// Instance singleton
export const advancedThemeService = new AdvancedThemeService()
