import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/services/themeService'
import { Sun, Moon, Monitor, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

const DarkModeTest: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme()

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Test Mode Sombre</h1>
        <p className="text-muted-foreground">
          Vérification de l'adaptation des composants au mode sombre
        </p>
      </div>

      {/* Theme Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Contrôles de Thème</CardTitle>
          <CardDescription>
            Thème actuel: <strong>{theme}</strong> | Mode sombre: <strong>{isDark ? 'Oui' : 'Non'}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              variant={theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4 mr-2" />
              Clair
            </Button>
            <Button 
              variant={theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4 mr-2" />
              Sombre
            </Button>
            <Button 
              variant={theme === 'system' ? 'default' : 'outline'}
              onClick={() => setTheme('system')}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Système
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette Test */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="text-sm">🎨 Palette Moderne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded-lg neon-glow"></div>
              <div>
                <div className="text-sm font-medium">Violet Néon</div>
                <div className="text-xs text-muted-foreground">Primary moderne</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-secondary rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Glassmorphism</div>
                <div className="text-xs text-muted-foreground">Fond subtil</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-muted rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Muted</div>
                <div className="text-xs text-muted-foreground">Éléments discrets</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="text-sm">⚡ États Modernes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 gradient-success rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Émeraude</div>
                <div className="text-xs text-muted-foreground">Success</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-warning rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Ambre</div>
                <div className="text-xs text-muted-foreground">Warning</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 gradient-info rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Cyan Électrique</div>
                <div className="text-xs text-muted-foreground">Info</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-destructive rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Rouge Moderne</div>
                <div className="text-xs text-muted-foreground">Destructive</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="text-sm">🎯 Sidebar Ultra-Moderne</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-sidebar-bg border border-sidebar-border rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Glassmorphism</div>
                <div className="text-xs text-muted-foreground">Fond sidebar</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-sidebar-hover rounded-lg"></div>
              <div>
                <div className="text-sm font-medium">Hover Subtile</div>
                <div className="text-xs text-muted-foreground">État survol</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-sidebar-active rounded-lg neon-glow"></div>
              <div>
                <div className="text-sm font-medium">Violet Actif</div>
                <div className="text-xs text-muted-foreground">Néon + glow</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Components Test */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏷️ Badges Modernes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="neon-glow">Violet Néon</Badge>
              <Badge variant="secondary">Glassmorphism</Badge>
              <Badge variant="success" className="gradient-success">Émeraude</Badge>
              <Badge variant="warning">Ambre</Badge>
              <Badge variant="info" className="gradient-info">Cyan</Badge>
              <Badge variant="destructive">Rouge Moderne</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Progress Bars
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Progression (75%)</Label>
              <Progress value={75} className="mt-2 h-3" />
            </div>
            <div>
              <Label className="text-sm font-medium">Nutrition (45%)</Label>
              <Progress value={45} className="mt-2 h-3" />
            </div>
            <div>
              <Label className="text-sm font-medium">Hydratation (90%)</Label>
              <Progress value={90} className="mt-2 h-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Elements */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Formulaires Modernes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="test-input" className="text-sm font-medium">Input de test</Label>
              <Input id="test-input" placeholder="Saisissez du texte..." className="glassmorphism" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-switch" className="text-sm font-medium">Switch de test</Label>
              <div className="flex items-center space-x-2">
                <Switch id="test-switch" />
                <Label htmlFor="test-switch">Activer</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Icons Test */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ Icônes et États
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg glassmorphism">
              <CheckCircle className="h-6 w-6 text-success" />
              <div>
                <div className="text-sm font-medium">Succès</div>
                <div className="text-xs text-muted-foreground">Émeraude</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg glassmorphism">
              <AlertTriangle className="h-6 w-6 text-warning" />
              <div>
                <div className="text-sm font-medium">Attention</div>
                <div className="text-xs text-muted-foreground">Ambre</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg glassmorphism">
              <Info className="h-6 w-6 text-info" />
              <div>
                <div className="text-sm font-medium">Information</div>
                <div className="text-xs text-muted-foreground">Cyan</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 border rounded-lg glassmorphism">
              <XCircle className="h-6 w-6 text-destructive" />
              <div>
                <div className="text-sm font-medium">Erreur</div>
                <div className="text-xs text-muted-foreground">Rouge</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Hierarchy */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📖 Hiérarchie de Texte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <h1 className="text-4xl font-bold gradient-primary bg-clip-text text-transparent">Titre H1</h1>
          <h2 className="text-3xl font-semibold">Titre H2</h2>
          <h3 className="text-2xl font-medium">Titre H3</h3>
          <h4 className="text-xl font-medium">Titre H4</h4>
          <p className="text-base">Paragraphe normal</p>
          <p className="text-sm text-muted-foreground">Texte secondaire</p>
          <p className="text-xs text-muted-foreground">Texte très petit</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DarkModeTest
