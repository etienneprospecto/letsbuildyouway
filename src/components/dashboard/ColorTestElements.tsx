import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import { Checkbox } from '../ui/checkbox'
import { Switch } from '../ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Star, 
  Heart, 
  Zap,
  Settings,
  User,
  Mail,
  Phone
} from 'lucide-react'

export const ColorTestElements: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Test des Couleurs Personnalisées</CardTitle>
          <CardDescription>
            Tous ces éléments doivent utiliser vos couleurs personnalisées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Boutons */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Boutons</h3>
            <div className="flex flex-wrap gap-2">
              <Button>Bouton Primaire</Button>
              <Button variant="secondary">Bouton Secondaire</Button>
              <Button variant="outline">Bouton Outline</Button>
              <Button variant="ghost">Bouton Ghost</Button>
              <Button variant="destructive">Bouton Destructif</Button>
              <Button size="sm">Petit</Button>
              <Button size="lg">Grand</Button>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Badge Primaire</Badge>
              <Badge variant="secondary">Badge Secondaire</Badge>
              <Badge variant="outline">Badge Outline</Badge>
              <Badge variant="destructive">Badge Destructif</Badge>
              <Badge className="bg-accent">Badge Accent</Badge>
            </div>
          </div>

          {/* Formulaires */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Formulaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Champ de saisie</Label>
                <Input id="test-input" placeholder="Tapez quelque chose..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-textarea">Zone de texte</Label>
                <textarea 
                  id="test-textarea" 
                  className="w-full p-2 border rounded-md"
                  placeholder="Votre message..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="test-checkbox" />
              <Label htmlFor="test-checkbox">Case à cocher</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="test-switch" />
              <Label htmlFor="test-switch">Interrupteur</Label>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Barres de progression</h3>
            <div className="space-y-2">
              <Progress value={33} className="w-full" />
              <Progress value={66} className="w-full" />
              <Progress value={100} className="w-full" />
            </div>
          </div>

          {/* Alertes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alertes</h3>
            <div className="space-y-2">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Alerte de succès avec icône
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Alerte d'erreur avec icône
                </AlertDescription>
              </Alert>
            </div>
          </div>

          {/* Cards avec bordures colorées */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cards avec couleurs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-primary">Card Primaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cette card utilise la couleur primaire
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-secondary">Card Secondaire</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cette card utilise la couleur secondaire
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardHeader className="pb-2">
                  <CardTitle className="text-accent">Card Accent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cette card utilise la couleur accent
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Icônes colorées */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Icônes colorées</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span>Étoile primaire</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-secondary" />
                <span>Cœur secondaire</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                <span>Éclair accent</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Paramètres</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Onglets</h3>
            <Tabs defaultValue="tab1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tab1">Onglet 1</TabsTrigger>
                <TabsTrigger value="tab2">Onglet 2</TabsTrigger>
                <TabsTrigger value="tab3">Onglet 3</TabsTrigger>
              </TabsList>
              <TabsContent value="tab1" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <p>Contenu de l'onglet 1</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tab2" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <p>Contenu de l'onglet 2</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tab3" className="mt-4">
                <Card>
                  <CardContent className="pt-4">
                    <p>Contenu de l'onglet 3</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Liens et texte coloré */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Liens et texte</h3>
            <div className="space-y-2">
              <p>
                <a href="#" className="text-primary hover:underline">
                  Lien primaire
                </a>
              </p>
              <p>
                <a href="#" className="text-secondary hover:underline">
                  Lien secondaire
                </a>
              </p>
              <p>
                <a href="#" className="text-accent hover:underline">
                  Lien accent
                </a>
              </p>
              <p className="text-primary font-semibold">
                Texte en couleur primaire
              </p>
              <p className="text-secondary font-semibold">
                Texte en couleur secondaire
              </p>
              <p className="text-accent font-semibold">
                Texte en couleur accent
              </p>
            </div>
          </div>

          {/* Éléments avec background coloré */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Éléments avec fond coloré</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-primary text-primary-foreground">
                <h4 className="font-semibold">Fond Primaire</h4>
                <p className="text-sm opacity-90">Texte sur fond primaire</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary text-secondary-foreground">
                <h4 className="font-semibold">Fond Secondaire</h4>
                <p className="text-sm opacity-90">Texte sur fond secondaire</p>
              </div>
              <div className="p-4 rounded-lg bg-accent text-accent-foreground">
                <h4 className="font-semibold">Fond Accent</h4>
                <p className="text-sm opacity-90">Texte sur fond accent</p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
