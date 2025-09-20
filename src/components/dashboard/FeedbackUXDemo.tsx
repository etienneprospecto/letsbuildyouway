import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  Send,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Star,
  Target,
  Award,
  Zap,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Settings,
  Bell,
  Sparkles,
  Rocket,
  Heart,
  ThumbsUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FeedbackUXDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState('overview')
  const [animationSpeed, setAnimationSpeed] = useState(1)

  const demos = [
    {
      id: 'overview',
      title: 'Vue d\'ensemble',
      description: 'Découvrez les améliorations apportées à l\'UX des feedbacks',
      icon: <Sparkles className="h-5 w-5" />
    },
    {
      id: 'animations',
      title: 'Animations',
      description: 'Transitions fluides et micro-interactions',
      icon: <Zap className="h-5 w-5" />
    },
    {
      id: 'navigation',
      title: 'Navigation',
      description: 'Interface intuitive avec onglets et navigation',
      icon: <Target className="h-5 w-5" />
    },
    {
      id: 'forms',
      title: 'Formulaires',
      description: 'Formulaire de feedback optimisé et interactif',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'stats',
      title: 'Statistiques',
      description: 'Visualisation des données et progression',
      icon: <BarChart3 className="h-5 w-5" />
    }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Rocket className="h-10 w-10 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-4">UX Feedback Optimisée</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Découvrez les améliorations apportées à l'expérience utilisateur des pages feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Interface Moderne',
            description: 'Design épuré avec animations fluides',
            icon: <Sparkles className="h-6 w-6 text-blue-600" />,
            color: 'blue'
          },
          {
            title: 'Navigation Intuitive',
            description: 'Onglets et navigation optimisés',
            icon: <Target className="h-6 w-6 text-green-600" />,
            color: 'green'
          },
          {
            title: 'Formulaires Interactifs',
            description: 'Questions progressives avec validation',
            icon: <FileText className="h-6 w-6 text-purple-600" />,
            color: 'purple'
          },
          {
            title: 'Statistiques Visuelles',
            description: 'Données présentées de manière claire',
            icon: <BarChart3 className="h-6 w-6 text-orange-600" />,
            color: 'orange'
          },
          {
            title: 'Responsive Design',
            description: 'Adapté à tous les écrans',
            icon: <Settings className="h-6 w-6 text-red-600" />,
            color: 'red'
          },
          {
            title: 'Accessibilité',
            description: 'Interface accessible à tous',
            icon: <Heart className="h-6 w-6 text-pink-600" />,
            color: 'pink'
          }
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  {feature.icon}
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderAnimations = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold mb-2">Animations et Transitions</h2>
        <p className="text-muted-foreground">Découvrez les animations fluides et les micro-interactions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>Transitions de pages</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 bg-blue-50 rounded-lg"
            >
              <p className="text-sm">Animation d'entrée fluide</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 bg-green-50 rounded-lg"
            >
              <p className="text-sm">Animation décalée</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="p-4 bg-purple-50 rounded-lg"
            >
              <p className="text-sm">Animation de scale</p>
            </motion.div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Micro-interactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button 
                className="w-full hover:scale-105 transition-transform duration-200"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Bouton avec hover
              </Button>
              <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200">
                Bouton avec transition de couleur
              </Button>
              <div className="flex space-x-2">
                <Badge className="hover:scale-110 transition-transform duration-200 cursor-pointer">
                  Badge interactif
                </Badge>
                <Badge variant="outline" className="hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer">
                  Badge avec hover
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span>Barre de progression animée</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progression</span>
                <span className="text-sm text-muted-foreground">75%</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-center">
                <Button 
                  onClick={() => {
                    // Animer la barre de progression
                    const progressBar = document.querySelector('.progress-bar')
                    if (progressBar) {
                      progressBar.style.width = '100%'
                    }
                  }}
                  size="sm"
                >
                  Animer la progression
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderNavigation = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold mb-2">Navigation Intuitive</h2>
        <p className="text-muted-foreground">Interface organisée avec onglets et navigation optimisée</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Onglets de navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tab1" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Cette semaine</span>
              </TabsTrigger>
              <TabsTrigger value="tab2" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Historique</span>
              </TabsTrigger>
              <TabsTrigger value="tab3" className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>Analyses</span>
              </TabsTrigger>
              <TabsTrigger value="tab4" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="tab1" className="mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Contenu de l'onglet 1</h3>
                <p className="text-sm text-muted-foreground">Interface claire et organisée</p>
              </div>
            </TabsContent>
            <TabsContent value="tab2" className="mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Contenu de l'onglet 2</h3>
                <p className="text-sm text-muted-foreground">Navigation fluide entre les sections</p>
              </div>
            </TabsContent>
            <TabsContent value="tab3" className="mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Contenu de l'onglet 3</h3>
                <p className="text-sm text-muted-foreground">Accès rapide aux fonctionnalités</p>
              </div>
            </TabsContent>
            <TabsContent value="tab4" className="mt-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">Contenu de l'onglet 4</h3>
                <p className="text-sm text-muted-foreground">Configuration et paramètres</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <span>Recherche et filtres</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border rounded-lg text-sm">
                <option>Tous les statuts</option>
                <option>Complétés</option>
                <option>En cours</option>
                <option>Envoyés</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5 text-green-600" />
              <span>Navigation contextuelle</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">JD</span>
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">John Doe</p>
                    <p className="text-sm text-muted-foreground">Feedback du 15/01/2024</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">Feedback du 14/01/2024</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderForms = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold mb-2">Formulaires Optimisés</h2>
        <p className="text-muted-foreground">Formulaire de feedback interactif et progressif</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Formulaire de feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progression</span>
              <span className="text-sm text-muted-foreground">3 / 5 questions</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>

          {/* Navigation des questions */}
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                variant={num === 3 ? 'default' : 'outline'}
                size="sm"
                className="relative"
              >
                {num}
                {num < 3 && <CheckCircle className="h-3 w-3 ml-1 text-green-600" />}
              </Button>
            ))}
          </div>

          {/* Question actuelle */}
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-2">Question 3 sur 5</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comment évaluez-vous votre motivation cette semaine ?
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="7"
                    className="flex-1"
                  />
                  <div className="w-16 text-center">
                    <div className="text-2xl font-bold text-primary">7</div>
                    <div className="text-xs text-muted-foreground">/10</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 (Très faible)</span>
                  <span>10 (Excellent)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline">
              <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
              Précédent
            </Button>
            <Button>
              Suivant
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStats = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h2 className="text-2xl font-bold mb-2">Statistiques Visuelles</h2>
        <p className="text-muted-foreground">Données présentées de manière claire et engageante</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Série actuelle', value: '5', icon: <Target className="h-5 w-5 text-blue-600" />, color: 'blue' },
          { title: 'Complétés', value: '12', icon: <CheckCircle className="h-5 w-5 text-green-600" />, color: 'green' },
          { title: 'Score moyen', value: '8.5', icon: <Star className="h-5 w-5 text-yellow-600" />, color: 'yellow' },
          { title: 'Amélioration', value: '+2.3', icon: <TrendingUp className="h-5 w-5 text-purple-600" />, color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  {stat.icon}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Progression dans le temps</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score moyen sur 4 semaines</span>
              <span className="text-sm text-muted-foreground">8.2/10</span>
            </div>
            <div className="space-y-2">
              {[
                { week: 'Semaine 1', score: 7.5, color: 'bg-blue-500' },
                { week: 'Semaine 2', score: 8.0, color: 'bg-green-500' },
                { week: 'Semaine 3', score: 8.5, color: 'bg-yellow-500' },
                { week: 'Semaine 4', score: 8.8, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={item.week} className="flex items-center space-x-4">
                  <span className="text-sm font-medium w-20">{item.week}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                      style={{ width: `${item.score * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold w-12">{item.score}/10</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Démo UX Feedback</h1>
          <p className="text-muted-foreground">Découvrez les améliorations apportées à l'expérience utilisateur</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button size="sm">
            <Rocket className="h-4 w-4 mr-2" />
            Lancer la démo
          </Button>
        </div>
      </div>

      <Tabs value={activeDemo} onValueChange={setActiveDemo} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {demos.map((demo) => (
            <TabsTrigger key={demo.id} value={demo.id} className="flex items-center space-x-2">
              {demo.icon}
              <span className="hidden sm:inline">{demo.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="animations" className="space-y-6">
          {renderAnimations()}
        </TabsContent>

        <TabsContent value="navigation" className="space-y-6">
          {renderNavigation()}
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          {renderForms()}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {renderStats()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FeedbackUXDemo
