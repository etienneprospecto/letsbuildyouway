import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Video, Link, Image, Download, Eye, Heart, Search } from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'

interface Resource {
  id: string
  title: string
  description: string
  type: 'video' | 'pdf' | 'link' | 'text'
  url?: string
  content?: string
  week_start: string
  created_at: string
  is_read?: boolean
  is_favorite?: boolean
}

const ClientResources: React.FC = () => {
  const { user } = useAuth()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  // Récupérer les ressources du client
  useEffect(() => {
    const fetchResources = async () => {
      if (!user?.email) return
      
      try {
        // Récupérer l'ID du client
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('id')
          .eq('contact', user.email)
          .single()

        if (clientError) throw clientError

        // Récupérer les ressources personnalisées
        const { data, error } = await supabase
          .from('ressources_personnalisees')
          .select('*')
          .eq('client_id', clientData.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Ajouter des flags pour l'état de lecture et favoris
        const resourcesWithFlags = (data || []).map(resource => ({
          ...resource,
          is_read: false, // À implémenter avec une table de suivi
          is_favorite: false // À implémenter avec une table de favoris
        }))

        setResources(resourcesWithFlags)
      } catch (error) {
        console.error('Erreur récupération ressources:', error)
        toast({
          title: "Erreur",
          description: "Impossible de récupérer tes ressources",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [user?.email])

  // Marquer comme lu
  const handleMarkAsRead = async (resourceId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, is_read: true } : r
    ))
    
    toast({
      title: "Marqué comme lu",
      description: "Ressource marquée comme consultée"
    })
  }

  // Marquer comme favori
  const handleToggleFavorite = async (resourceId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, is_favorite: !r.is_favorite } : r
    ))
    
    const resource = resources.find(r => r.id === resourceId)
    toast({
      title: resource?.is_favorite ? "Retiré des favoris" : "Ajouté aux favoris",
      description: resource?.is_favorite 
        ? "Ressource retirée de tes favoris" 
        : "Ressource ajoutée à tes favoris"
    })
  }

  // Ouvrir/consulter une ressource
  const handleOpenResource = (resource: Resource) => {
    if (resource.url) {
      window.open(resource.url, '_blank')
    } else if (resource.content) {
      // Afficher le contenu dans une modal (à implémenter)
      console.log('Contenu de la ressource:', resource.content)
    }
    
    // Marquer comme lu
    handleMarkAsRead(resource.id)
  }

  // Filtrer les ressources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || resource.type === filterType
    return matchesSearch && matchesType
  })

  // Obtenir l'icône selon le type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'pdf': return <FileText className="h-4 w-4" />
      case 'link': return <Link className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  // Obtenir la couleur du badge selon le type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800'
      case 'pdf': return 'bg-blue-100 text-blue-800'
      case 'link': return 'bg-green-100 text-green-800'
      case 'image': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes ressources</h1>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mes ressources</h1>
        <p className="text-muted-foreground">Documents partagés par ton coach</p>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une ressource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">Tous les types</option>
          <option value="video">Vidéos</option>
          <option value="pdf">PDFs</option>
          <option value="link">Liens</option>
          <option value="image">Images</option>
          <option value="text">Textes</option>
        </select>
      </div>

      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'Aucune ressource ne correspond à tes critères'
                : 'Aucune ressource partagée par ton coach'
              }
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Ton coach partagera des ressources personnalisées pour toi
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(resource.type)}
                    <Badge className={getTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(resource.id)}
                      className={`h-8 w-8 p-0 ${resource.is_read ? 'text-blue-600' : 'text-muted-foreground'}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(resource.id)}
                      className={`h-8 w-8 p-0 ${resource.is_favorite ? 'text-red-600' : 'text-muted-foreground'}`}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  Partagé le {new Date(resource.created_at).toLocaleDateString('fr-FR')}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleOpenResource(resource)}
                    className="flex-1"
                    size="sm"
                  >
                    {resource.url ? 'Ouvrir' : 'Lire'}
                  </Button>
                  
                  {resource.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(resource.url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiques</CardTitle>
            <CardDescription>Résumé de tes ressources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{resources.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {resources.filter(r => r.is_read).length}
                </p>
                <p className="text-sm text-muted-foreground">Lues</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {resources.filter(r => r.is_favorite).length}
                </p>
                <p className="text-sm text-muted-foreground">Favoris</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((resources.filter(r => r.is_read).length / resources.length) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Progression</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ClientResources


