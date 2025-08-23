import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Link, 
  Download, 
  Trash2, 
  Eye,
  Filter,
  Plus,
  FolderOpen,
  HardDrive,
  X
} from 'lucide-react'
import { ResourceWithUrl } from './__types__'
import ResourceService from '@/services/resourceService'
import { useToast } from '@/hooks/use-toast'

interface RessourcesPersonnaliseesProps {
  clientId: string
}

const RessourcesPersonnalisees: React.FC<RessourcesPersonnaliseesProps> = ({ clientId }) => {
  const [resources, setResources] = useState<ResourceWithUrl[]>([])
  const [filteredResources, setFilteredResources] = useState<ResourceWithUrl[]>([])
  const [selectedTheme, setSelectedTheme] = useState<string>('Toutes')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadZone, setShowUploadZone] = useState(false)
  const [stats, setStats] = useState({
    totalResources: 0,
    totalSize: 0,
    resourcesByTheme: {} as Record<string, number>,
    resourcesByType: {} as Record<string, number>
  })
  const { toast } = useToast()

  useEffect(() => {
    loadResources()
  }, [clientId])

  useEffect(() => {
    filterResources()
  }, [resources, selectedTheme])

  const loadResources = async () => {
    try {
      setLoading(true)
      const [resourcesData, statsData] = await Promise.all([
        ResourceService.getClientResources(clientId),
        ResourceService.getClientResourceStats(clientId)
      ])
      
      setResources(resourcesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading resources:', error)
      // En cas d'erreur, on simule des données pour le développement
      setResources([
        {
          id: '1',
          nom_ressource: 'Guide alimentation.pdf',
          type_ressource: 'pdf',
          theme: 'Alimentation',
          url_fichier: null,
          taille_fichier: 2048576,
          description: 'Guide nutritionnel personnalisé',
          created_at: '2025-01-15T10:00:00Z'
        },
        {
          id: '2',
          nom_ressource: 'Exercices cardio.mp4',
          type_ressource: 'video',
          theme: 'Entraînement',
          url_fichier: null,
          taille_fichier: 15728640,
          description: 'Vidéo d\'exercices cardio',
          created_at: '2025-01-14T15:30:00Z'
        }
      ])
      setStats({
        totalResources: 2,
        totalSize: 17777216,
        resourcesByTheme: { 'Alimentation': 1, 'Entraînement': 1 },
        resourcesByType: { 'pdf': 1, 'video': 1 }
      })
      toast({
        title: "Données simulées",
        description: "Affichage avec des ressources d'exemple pour le développement.",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterResources = () => {
    if (selectedTheme === 'Toutes') {
      setFilteredResources(resources)
    } else {
      setFilteredResources(resources.filter(r => r.theme === selectedTheme))
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        const uploadData = {
          file,
          nom_ressource: file.name,
          theme: selectedTheme === 'Toutes' ? 'Entraînement' : selectedTheme as any,
          description: ''
        }

        await ResourceService.uploadResource(clientId, uploadData)
      }

      toast({
        title: "Upload réussi",
        description: `${files.length} fichier(s) uploadé(s) avec succès.`,
      })

      await loadResources()
      setShowUploadZone(false)
    } catch (error) {
      console.error('Error uploading files:', error)
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader le(s) fichier(s).",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await ResourceService.deleteResource(resourceId)
      
      toast({
        title: "Ressource supprimée",
        description: "La ressource a été supprimée avec succès.",
      })

      await loadResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ressource.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadResource = async (resource: ResourceWithUrl) => {
    try {
      if (resource.downloadUrl) {
        const link = document.createElement('a')
        link.href = resource.downloadUrl
        link.download = resource.nom_ressource
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const blob = await ResourceService.downloadResource(resource.id)
        if (blob) {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = resource.nom_ressource
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        }
      }
    } catch (error) {
      console.error('Error downloading resource:', error)
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la ressource.",
        variant: "destructive",
      })
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-600" />
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />
      case 'link':
        return <Link className="h-5 w-5 text-blue-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getThemeColor = (theme: string) => {
    switch (theme) {
      case 'Alimentation':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Style de vie':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Ressentis':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Entraînement':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des ressources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HardDrive className="h-5 w-5 text-orange-500" />
              <span>Vue d'ensemble des ressources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalResources}</div>
                <p className="text-sm text-muted-foreground">Total ressources</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatFileSize(stats.totalSize)}</div>
                <p className="text-sm text-muted-foreground">Taille totale</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Object.keys(stats.resourcesByTheme).length}
                </div>
                <p className="text-sm text-muted-foreground">Thèmes utilisés</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.resourcesByType).length}
                </div>
                <p className="text-sm text-muted-foreground">Types de fichiers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filtres et actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtres et actions</span>
              </span>
              <Button
                onClick={() => setShowUploadZone(!showUploadZone)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showUploadZone ? 'Fermer' : 'Ajouter des ressources'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Label htmlFor="theme-filter">Thème:</Label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Toutes">Toutes</SelectItem>
                    <SelectItem value="Alimentation">Alimentation</SelectItem>
                    <SelectItem value="Style de vie">Style de vie</SelectItem>
                    <SelectItem value="Ressentis">Ressentis</SelectItem>
                    <SelectItem value="Entraînement">Entraînement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                {filteredResources.length} ressource(s) trouvée(s)
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Zone d'upload */}
      {showUploadZone && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Ajouter des ressources</CardTitle>
              <CardDescription className="text-orange-600">
                Glissez-déposez des fichiers ou cliquez pour sélectionner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                  <p className="text-orange-800 font-medium mb-2">Déposer des ressources</p>
                  <p className="text-orange-600 text-sm mb-4">
                    Ajoutez des vidéos, PDFs ou liens personnalisés pour ce client
                  </p>
                  
                  <div className="space-y-2">
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => handleFileUpload(e.target.files)}
                      disabled={uploading}
                      className="max-w-xs mx-auto"
                    />
                    
                    {uploading && (
                      <div className="flex items-center justify-center space-x-2 text-orange-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                        <span className="text-sm">Upload en cours...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Liste des ressources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-orange-500" />
              <span>Ressources personnalisées</span>
            </CardTitle>
            <CardDescription>
              Gestion des fichiers et ressources partagées avec le client
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  {selectedTheme === 'Toutes' 
                    ? 'Aucune ressource partagée' 
                    : `Aucune ressource pour le thème "${selectedTheme}"`
                  }
                </p>
                <p className="text-sm text-gray-400">
                  Commencez par ajouter des ressources personnalisées
                </p>
                <Button
                  onClick={() => setShowUploadZone(true)}
                  className="mt-4 bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter des ressources
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getFileIcon(resource.type_ressource)}
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm truncate">
                                {resource.nom_ressource}
                              </CardTitle>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={getThemeColor(resource.theme)}>
                              {resource.theme}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(resource.taille_fichier || 0)}
                            </span>
                          </div>

                          {resource.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {resource.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {new Date(resource.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadResource(resource)}
                              className="flex-1"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Télécharger
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteResource(resource.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default RessourcesPersonnalisees
