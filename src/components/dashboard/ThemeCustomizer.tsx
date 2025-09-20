import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Eye,
  EyeOff,
  Copy,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { advancedThemeService, UserTheme, ThemePreset, CommunityTheme } from '@/services/advancedThemeService'
import { ColorUtils } from '@/services/colorUtils'
import { cn } from '@/lib/utils'

const ThemeCustomizer: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<UserTheme | null>(null)
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [communityThemes, setCommunityThemes] = useState<CommunityTheme[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light')
  const [accessibilityReport, setAccessibilityReport] = useState<any>(null)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // États pour les couleurs
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6')
  const [secondaryColor, setSecondaryColor] = useState('#A78BFA')
  const [accentColor, setAccentColor] = useState('#C4B5FD')
  const [modePreference, setModePreference] = useState<'light' | 'dark' | 'system'>('system')

  useEffect(() => {
    const initializeCustomizer = async () => {
      try {
        setIsLoading(true)
        
        // Initialiser le service
        await advancedThemeService.init()
        
        // Charger le thème actuel
        const theme = advancedThemeService.getCurrentTheme()
        if (theme) {
          setCurrentTheme(theme)
          setPrimaryColor(theme.primary_color)
          setSecondaryColor(theme.secondary_color)
          setAccentColor(theme.accent_color)
          setModePreference(theme.mode_preference)
        }

        // Charger les presets
        const presetsData = advancedThemeService.getPresets()
        setPresets(presetsData)

        // Charger les thèmes communautaires
        const communityData = await advancedThemeService.getCommunityThemes()
        setCommunityThemes(communityData)

        // Valider l'accessibilité
        validateAccessibility()

      } catch (error) {
        console.error('Erreur initialisation customizer:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeCustomizer()
  }, [])

  const validateAccessibility = () => {
    const report = advancedThemeService.validateAccessibility()
    setAccessibilityReport(report)
  }

  const handleColorChange = async (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    if (!currentTheme) return

    const updatedTheme = {
      ...currentTheme,
      [colorType + '_color']: color,
      updated_at: new Date().toISOString()
    }

    // Si c'est la couleur primaire, régénérer les couleurs harmonieuses
    if (colorType === 'primary') {
      updatedTheme.secondary_color = ColorUtils.generateHarmoniousColor(color, 'analogous')
      updatedTheme.accent_color = ColorUtils.generateHarmoniousColor(color, 'complementary')
      setSecondaryColor(updatedTheme.secondary_color)
      setAccentColor(updatedTheme.accent_color)
    }

    setCurrentTheme(updatedTheme)
    await advancedThemeService.updateTheme(updatedTheme)
    validateAccessibility()
  }

  const handleModeChange = async (mode: 'light' | 'dark' | 'system') => {
    setModePreference(mode)
    if (currentTheme) {
      await advancedThemeService.updateMode(mode)
    }
  }

  const handlePresetApply = async (preset: ThemePreset) => {
    await advancedThemeService.applyPreset(preset)
    await initializeCustomizer()
  }

  const handleReset = async () => {
    const defaultPreset = presets[0] // BYW Orange Classique
    if (defaultPreset) {
      await handlePresetApply(defaultPreset)
    }
  }

  const handleExport = () => {
    advancedThemeService.exportTheme()
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      advancedThemeService.importTheme(file)
        .then(() => {
          initializeCustomizer()
        })
        .catch(error => {
          console.error('Erreur import thème:', error)
        })
    }
  }

  const generateColorVariations = (baseColor: string) => {
    const palette = ColorUtils.generateColorPalette(baseColor)
    return [
      { name: '50', color: palette.primary50 },
      { name: '100', color: palette.primary100 },
      { name: '200', color: palette.primary200 },
      { name: '300', color: palette.primary300 },
      { name: '400', color: palette.primary400 },
      { name: '500', color: palette.primary500 },
      { name: '600', color: palette.primary600 },
      { name: '700', color: palette.primary700 },
      { name: '800', color: palette.primary800 },
      { name: '900', color: palette.primary900 }
    ]
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Palette className="h-8 w-8" />
            Personnalisation des Thèmes
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez votre thème personnalisé avec des couleurs harmonieuses
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAccessibility(!showAccessibility)}
            className={cn(showAccessibility && "bg-primary text-primary-foreground")}
          >
            {showAccessibility ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            Accessibilité
          </Button>
          
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Rapport d'accessibilité */}
      <AnimatePresence>
        {showAccessibility && accessibilityReport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className={cn(
              "border-2",
              accessibilityReport.isValid ? "border-success" : "border-destructive"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {accessibilityReport.isValid ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                  Rapport d'Accessibilité
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accessibilityReport.isValid ? (
                  <p className="text-success">✅ Toutes les combinaisons de couleurs respectent les standards d'accessibilité</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-destructive font-medium">⚠️ Problèmes d'accessibilité détectés :</p>
                    {accessibilityReport.issues.map((issue: any, index: number) => (
                      <div key={index} className="p-3 bg-destructive/10 rounded-lg">
                        <div className="font-medium">{issue.element}</div>
                        <div className="text-sm text-muted-foreground">
                          Ratio: {issue.ratio} ({issue.grade}) - {issue.recommendation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contrôles de personnalisation */}
        <div className="space-y-6">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="community">Communauté</TabsTrigger>
            </TabsList>

            {/* Onglet Couleurs */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Couleurs Personnalisées</CardTitle>
                  <CardDescription>
                    Choisissez vos couleurs principales pour générer une palette harmonieuse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Couleur Primaire */}
                  <div className="space-y-3">
                    <Label htmlFor="primary-color" className="text-sm font-medium">
                      Couleur Primaire
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="primary-color"
                        type="color"
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value)
                          handleColorChange('primary', e.target.value)
                        }}
                        className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => {
                          setPrimaryColor(e.target.value)
                          handleColorChange('primary', e.target.value)
                        }}
                        className="flex-1"
                        placeholder="#8B5CF6"
                      />
                    </div>
                    
                    {/* Variations de la couleur primaire */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Variations générées</Label>
                      <div className="flex gap-1">
                        {generateColorVariations(primaryColor).map((variation) => (
                          <div
                            key={variation.name}
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className="w-8 h-8 rounded border border-border"
                              style={{ backgroundColor: variation.color }}
                              title={`${variation.name}: ${variation.color}`}
                            />
                            <span className="text-xs text-muted-foreground">{variation.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Couleur Secondaire */}
                  <div className="space-y-3">
                    <Label htmlFor="secondary-color" className="text-sm font-medium">
                      Couleur Secondaire
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="secondary-color"
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value)
                          handleColorChange('secondary', e.target.value)
                        }}
                        className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => {
                          setSecondaryColor(e.target.value)
                          handleColorChange('secondary', e.target.value)
                        }}
                        className="flex-1"
                        placeholder="#A78BFA"
                      />
                    </div>
                  </div>

                  {/* Couleur d'Accent */}
                  <div className="space-y-3">
                    <Label htmlFor="accent-color" className="text-sm font-medium">
                      Couleur d'Accent
                    </Label>
                    <div className="flex items-center gap-3">
                      <input
                        id="accent-color"
                        type="color"
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value)
                          handleColorChange('accent', e.target.value)
                        }}
                        className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => {
                          setAccentColor(e.target.value)
                          handleColorChange('accent', e.target.value)
                        }}
                        className="flex-1"
                        placeholder="#C4B5FD"
                      />
                    </div>
                  </div>

                  {/* Mode d'affichage */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Mode d'Affichage</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={modePreference === 'light' ? 'default' : 'outline'}
                        onClick={() => handleModeChange('light')}
                        className="flex items-center gap-2 border-gray-300 text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 dark:hover:text-orange-300"
                      >
                        <Sun className="h-4 w-4" />
                        Clair
                      </Button>
                      <Button
                        variant={modePreference === 'dark' ? 'default' : 'outline'}
                        onClick={() => handleModeChange('dark')}
                        className="flex items-center gap-2 border-gray-300 text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 dark:hover:text-orange-300"
                      >
                        <Moon className="h-4 w-4" />
                        Sombre
                      </Button>
                      <Button
                        variant={modePreference === 'system' ? 'default' : 'outline'}
                        onClick={() => handleModeChange('system')}
                        className="flex items-center gap-2 border-gray-300 text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 dark:hover:text-orange-300"
                      >
                        <Monitor className="h-4 w-4" />
                        Auto
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button onClick={handleReset} variant="outline" className="border-gray-300 text-gray-700 bg-white hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 dark:hover:text-orange-300">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Réinitialiser
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Presets */}
            <TabsContent value="presets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thèmes Prédéfinis</CardTitle>
                  <CardDescription>
                    Choisissez parmi nos thèmes soigneusement conçus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {presets.map((preset) => (
                      <motion.div
                        key={preset.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handlePresetApply(preset)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex gap-1">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: preset.primary_color }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: preset.secondary_color }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: preset.accent_color }}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium">{preset.name}</h3>
                            <p className="text-sm text-muted-foreground">{preset.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {preset.category}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Communauté */}
            <TabsContent value="community" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thèmes Communautaires</CardTitle>
                  <CardDescription>
                    Découvrez les thèmes créés par la communauté
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {communityThemes.map((theme) => (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          const preset: ThemePreset = {
                            name: theme.name,
                            description: theme.description || '',
                            primary_color: theme.primary_color,
                            secondary_color: theme.secondary_color,
                            accent_color: theme.accent_color,
                            category: 'community' as any
                          }
                          handlePresetApply(preset)
                        }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex gap-1">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: theme.primary_color }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: theme.secondary_color }}
                            />
                            <div
                              className="w-6 h-6 rounded-full border-2 border-border"
                              style={{ backgroundColor: theme.accent_color }}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{theme.name}</h3>
                            <p className="text-sm text-muted-foreground">{theme.description}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>👥 {theme.downloads_count}</span>
                            <span>❤️ {theme.likes_count}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {theme.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview en temps réel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Aperçu en Temps Réel
                <div className="flex gap-1">
                  <Button
                    variant={previewMode === 'light' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('light')}
                  >
                    <Sun className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewMode === 'dark' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewMode('dark')}
                  >
                    <Moon className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "p-4 rounded-lg border-2 transition-colors",
                previewMode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
              )}>
                {/* Mini Sidebar */}
                <div className="flex gap-4 mb-4">
                  <div className={cn(
                    "w-16 h-20 rounded-lg border",
                    previewMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  )}>
                    <div className="p-2 space-y-1">
                      <div className={cn(
                        "w-8 h-8 rounded",
                        previewMode === 'dark' ? 'bg-purple-600' : 'bg-purple-500'
                      )} />
                      <div className="space-y-1">
                        <div className={cn(
                          "h-2 rounded",
                          previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                        <div className={cn(
                          "h-2 rounded w-3/4",
                          previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Content */}
                  <div className="flex-1 space-y-3">
                    <div className={cn(
                      "h-4 rounded",
                      previewMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                    )} />
                    <div className="space-y-2">
                      <div className={cn(
                        "h-3 rounded w-3/4",
                        previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                      )} />
                      <div className={cn(
                        "h-3 rounded w-1/2",
                        previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                      )} />
                    </div>
                    
                    {/* Mini Cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className={cn(
                        "h-16 rounded border p-2",
                        previewMode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      )}>
                        <div className={cn(
                          "h-2 rounded mb-1",
                          previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                        <div className={cn(
                          "h-1 rounded w-1/2",
                          previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                      </div>
                      <div className={cn(
                        "h-16 rounded border p-2",
                        previewMode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      )}>
                        <div className={cn(
                          "h-2 rounded mb-1",
                          previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                        <div className={cn(
                          "h-1 rounded w-1/2",
                          previewMode === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mini Buttons */}
                <div className="flex gap-2">
                  <div
                    className="px-3 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: primaryColor,
                      color: ColorUtils.getContrastColor(primaryColor)
                    }}
                  >
                    Primary
                  </div>
                  <div
                    className="px-3 py-1 rounded text-xs font-medium border"
                    style={{ 
                      backgroundColor: secondaryColor,
                      color: ColorUtils.getContrastColor(secondaryColor)
                    }}
                  >
                    Secondary
                  </div>
                  <div
                    className="px-3 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: accentColor,
                      color: ColorUtils.getContrastColor(accentColor)
                    }}
                  >
                    Accent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ThemeCustomizer
