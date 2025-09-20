import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { useSimpleTheme } from '../../hooks/useSimpleTheme'

export const ColorPreview: React.FC = () => {
  const { currentTheme } = useSimpleTheme()

  if (!currentTheme) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Preview des Couleurs</CardTitle>
          <CardDescription>
            Voici comment vos couleurs personnalisées apparaissent dans l'interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Couleurs actuelles */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-200"
                style={{ backgroundColor: currentTheme.primary_color }}
              ></div>
              <p className="text-sm font-medium">Primaire</p>
              <p className="text-xs text-gray-500">{currentTheme.primary_color}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-200"
                style={{ backgroundColor: currentTheme.secondary_color }}
              ></div>
              <p className="text-sm font-medium">Secondaire</p>
              <p className="text-xs text-gray-500">{currentTheme.secondary_color}</p>
            </div>
            <div className="text-center">
              <div 
                className="w-16 h-16 rounded-lg mx-auto mb-2 border-2 border-gray-200"
                style={{ backgroundColor: currentTheme.tertiary_color }}
              ></div>
              <p className="text-sm font-medium">Tertiaire</p>
              <p className="text-xs text-gray-500">{currentTheme.tertiary_color}</p>
            </div>
          </div>

          {/* Éléments d'interface */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Éléments d'interface</h3>
            
            {/* Boutons */}
            <div className="flex gap-2 flex-wrap">
              <Button style={{ backgroundColor: currentTheme.primary_color }}>
                Bouton Primaire
              </Button>
              <Button 
                variant="outline" 
                style={{ 
                  borderColor: currentTheme.secondary_color,
                  color: currentTheme.secondary_color 
                }}
              >
                Bouton Secondaire
              </Button>
              <Button 
                variant="outline" 
                style={{ 
                  borderColor: currentTheme.tertiary_color,
                  color: currentTheme.tertiary_color 
                }}
              >
                Bouton Tertiaire
              </Button>
            </div>

            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge 
                style={{ 
                  backgroundColor: currentTheme.primary_color,
                  color: 'white'
                }}
              >
                Badge Primaire
              </Badge>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: currentTheme.secondary_color,
                  color: currentTheme.secondary_color
                }}
              >
                Badge Secondaire
              </Badge>
              <Badge 
                variant="outline"
                style={{ 
                  borderColor: currentTheme.tertiary_color,
                  color: currentTheme.tertiary_color
                }}
              >
                Badge Tertiaire
              </Badge>
            </div>

            {/* Inputs */}
            <div className="space-y-2">
              <Label>Champ de saisie</Label>
              <Input 
                placeholder="Tapez quelque chose..."
                style={{ 
                  borderColor: currentTheme.primary_color,
                  focusBorderColor: currentTheme.primary_color
                }}
              />
            </div>

            {/* Cards avec bordures colorées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card 
                style={{ 
                  borderLeftColor: currentTheme.primary_color,
                  borderLeftWidth: '4px'
                }}
              >
                <CardContent className="pt-4">
                  <h4 className="font-semibold" style={{ color: currentTheme.primary_color }}>
                    Carte Primaire
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Contenu de la carte avec couleur primaire
                  </p>
                </CardContent>
              </Card>

              <Card 
                style={{ 
                  borderLeftColor: currentTheme.secondary_color,
                  borderLeftWidth: '4px'
                }}
              >
                <CardContent className="pt-4">
                  <h4 className="font-semibold" style={{ color: currentTheme.secondary_color }}>
                    Carte Secondaire
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Contenu de la carte avec couleur secondaire
                  </p>
                </CardContent>
              </Card>

              <Card 
                style={{ 
                  borderLeftColor: currentTheme.tertiary_color,
                  borderLeftWidth: '4px'
                }}
              >
                <CardContent className="pt-4">
                  <h4 className="font-semibold" style={{ color: currentTheme.tertiary_color }}>
                    Carte Tertiaire
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Contenu de la carte avec couleur tertiaire
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Texte coloré */}
            <div className="space-y-2">
              <h4 className="font-semibold">Texte coloré</h4>
              <p style={{ color: currentTheme.primary_color }}>
                Ce texte utilise la couleur primaire
              </p>
              <p style={{ color: currentTheme.secondary_color }}>
                Ce texte utilise la couleur secondaire
              </p>
              <p style={{ color: currentTheme.tertiary_color }}>
                Ce texte utilise la couleur tertiaire
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
