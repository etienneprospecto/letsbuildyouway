import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Palette, 
  RotateCcw, 
  Sun,
  Moon,
  Check
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useSimpleTheme } from '@/hooks/useSimpleTheme'
import { cn } from '@/lib/utils'
import { ColorPreview } from './ColorPreview'
import { ColorTestElements } from './ColorTestElements'
import { simpleThemeService } from '@/services/simpleThemeService'

const ColorCustomizer: React.FC = () => {
  const { currentTheme, isLoading, updateColors, updateMode, resetTheme, isDark, currentMode } = useSimpleTheme()
  
  // États pour les couleurs
  const [primaryColor, setPrimaryColor] = useState('#FF6B35')
  const [secondaryColor, setSecondaryColor] = useState('#FF8C42')
  const [tertiaryColor, setTertiaryColor] = useState('#FFB74D')
  const [hasChanges, setHasChanges] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    if (currentTheme) {
      setPrimaryColor(currentTheme.primary_color)
      setSecondaryColor(currentTheme.secondary_color)
      setTertiaryColor(currentTheme.tertiary_color)
      setHasChanges(false)
    }
  }, [currentTheme])

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'tertiary', color: string) => {
    if (colorType === 'primary') {
      setPrimaryColor(color)
    } else if (colorType === 'secondary') {
      setSecondaryColor(color)
    } else if (colorType === 'tertiary') {
      setTertiaryColor(color)
    }
    setHasChanges(true)

    // Appliquer immédiatement le preview (sans sauvegarder)
    if (currentTheme) {
      const previewTheme = {
        ...currentTheme,
        primary_color: colorType === 'primary' ? color : primaryColor,
        secondary_color: colorType === 'secondary' ? color : secondaryColor,
        tertiary_color: colorType === 'tertiary' ? color : tertiaryColor
      }
      
      // Appliquer le preview via le service
      updateColors({
        primary_color: previewTheme.primary_color,
        secondary_color: previewTheme.secondary_color,
        tertiary_color: previewTheme.tertiary_color
      })
      
      setIsPreviewMode(true)
    }
  }

  const handleSave = async () => {
    await updateColors({
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      tertiary_color: tertiaryColor
    })
    setHasChanges(false)
    setIsPreviewMode(false)
  }

  const handleReset = async () => {
    await resetTheme()
    setHasChanges(false)
  }

  const handleModeChange = async (mode: 'light' | 'dark') => {
    await updateMode(mode)
  }

  const handleForceUpdate = () => {
    simpleThemeService.forceUpdate()
    alert('Mise à jour forcée des couleurs appliquée !')
  }

  const handleTestColors = () => {
    simpleThemeService.applyTestColors()
    alert('Couleurs de test appliquées !')
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
            Personnalisation des Couleurs
          </h1>
          <p className="text-muted-foreground mt-2">
            Personnalisez les couleurs de votre interface BYW
          </p>
          {isPreviewMode && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-orange-600 font-medium">Preview en temps réel</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={currentMode === 'light' ? 'default' : 'outline'}
            onClick={() => handleModeChange('light')}
            className="flex items-center gap-2"
          >
            <Sun className="h-4 w-4" />
            Jour
          </Button>
          <Button
            variant={currentMode === 'dark' ? 'default' : 'outline'}
            onClick={() => handleModeChange('dark')}
            className="flex items-center gap-2"
          >
            <Moon className="h-4 w-4" />
            Nuit
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Sauvegarder
          </Button>
          <Button 
            variant="outline"
            onClick={handleForceUpdate}
            title="Force la mise à jour de tous les éléments"
          >
            🔄 Forcer
          </Button>
          <Button 
            variant="outline"
            onClick={handleTestColors}
            title="Applique des couleurs de test"
          >
            🧪 Test
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contrôles de personnalisation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Couleurs Personnalisées</CardTitle>
              <CardDescription>
                Choisissez vos couleurs principales pour personnaliser l'interface
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
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1"
                    placeholder="#FF6B35"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Couleur principale utilisée pour les boutons, liens et éléments importants
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
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="flex-1"
                    placeholder="#FF8C42"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Couleur secondaire pour les éléments de support et les accents
                </div>
              </div>

              {/* Couleur Tertiaire */}
              <div className="space-y-3">
                <Label htmlFor="tertiary-color" className="text-sm font-medium">
                  Couleur Tertiaire
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    id="tertiary-color"
                    type="color"
                    value={tertiaryColor}
                    onChange={(e) => handleColorChange('tertiary', e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                  />
                  <Input
                    value={tertiaryColor}
                    onChange={(e) => handleColorChange('tertiary', e.target.value)}
                    className="flex-1"
                    placeholder="#FFB74D"
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  Couleur tertiaire pour les éléments décoratifs et les surbrillances
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  onClick={handleSave} 
                  disabled={!hasChanges}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {hasChanges ? 'Sauvegarder les changements' : 'Aucun changement'}
                </Button>
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview en temps réel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu en Temps Réel</CardTitle>
              <CardDescription>
                Visualisez vos couleurs personnalisées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "p-6 rounded-lg border-2 transition-colors",
                isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
              )}>
                {/* Mini Sidebar */}
                <div className="flex gap-4 mb-6">
                  <div className={cn(
                    "w-20 h-24 rounded-lg border p-3",
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  )}>
                    <div className="space-y-2">
                      <div 
                        className="w-8 h-8 rounded"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="space-y-1">
                        <div className={cn(
                          "h-2 rounded",
                          isDark ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                        <div className={cn(
                          "h-2 rounded w-3/4",
                          isDark ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Content */}
                  <div className="flex-1 space-y-4">
                    <div className={cn(
                      "h-6 rounded",
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    )} />
                    <div className="space-y-2">
                      <div className={cn(
                        "h-3 rounded w-3/4",
                        isDark ? 'bg-gray-700' : 'bg-gray-300'
                      )} />
                      <div className={cn(
                        "h-3 rounded w-1/2",
                        isDark ? 'bg-gray-700' : 'bg-gray-300'
                      )} />
                    </div>
                    
                    {/* Mini Cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className={cn(
                        "h-20 rounded border p-3",
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      )}>
                        <div className={cn(
                          "h-2 rounded mb-2",
                          isDark ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                        <div className={cn(
                          "h-1 rounded w-1/2",
                          isDark ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                      </div>
                      <div className={cn(
                        "h-20 rounded border p-3",
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      )}>
                        <div className={cn(
                          "h-2 rounded mb-2",
                          isDark ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                        <div className={cn(
                          "h-1 rounded w-1/2",
                          isDark ? 'bg-gray-700' : 'bg-gray-300'
                        )} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mini Buttons */}
                <div className="space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    <div
                      className="px-4 py-2 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Primaire
                    </div>
                    <div
                      className="px-4 py-2 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      Secondaire
                    </div>
                    <div
                      className="px-4 py-2 rounded text-sm font-medium text-white"
                      style={{ backgroundColor: tertiaryColor }}
                    >
                      Tertiaire
                    </div>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <div
                      className="px-4 py-2 rounded text-sm font-medium border-2"
                      style={{ 
                        borderColor: primaryColor,
                        color: primaryColor
                      }}
                    >
                      Bordure Primaire
                    </div>
                    <div
                      className="px-4 py-2 rounded text-sm font-medium border-2"
                      style={{ 
                        borderColor: secondaryColor,
                        color: secondaryColor
                      }}
                    >
                      Bordure Secondaire
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations sur les couleurs */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mode actuel</span>
                <Badge variant={isDark ? "default" : "outline"}>
                  {isDark ? "Nuit" : "Jour"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Couleur primaire</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <span className="text-sm font-mono">{primaryColor}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Couleur secondaire</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <span className="text-sm font-mono">{secondaryColor}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Couleur tertiaire</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: tertiaryColor }}
                  />
                  <span className="text-sm font-mono">{tertiaryColor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview des couleurs */}
      <ColorPreview />

      {/* Test des éléments */}
      <ColorTestElements />
    </div>
  )
}

export default ColorCustomizer
