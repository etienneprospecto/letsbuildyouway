import { supabase } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type RessourcePersonnalisee = Database['public']['Tables']['ressources_personnalisees']['Row']
type RessourcePersonnaliseeInsert = Database['public']['Tables']['ressources_personnalisees']['Insert']
type RessourcePersonnaliseeUpdate = Database['public']['Tables']['ressources_personnalisees']['Update']

export interface ResourceUploadData {
  file: File
  nom_ressource: string
  theme: 'Alimentation' | 'Style de vie' | 'Ressentis' | 'Entraînement'
  description?: string
}

export interface ResourceWithUrl extends RessourcePersonnalisee {
  downloadUrl?: string
  previewUrl?: string
}

export class ResourceService {
  private static readonly STORAGE_BUCKET = 'client-resources'
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

  // Récupérer toutes les ressources d'un client
  static async getClientResources(clientId: string): Promise<ResourceWithUrl[]> {
    try {
      const { data, error } = await supabase
        .from('ressources_personnalisees')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Générer les URLs de téléchargement pour chaque ressource
      const resourcesWithUrls = await Promise.all(
        (data || []).map(async (resource) => {
          if (resource.url_fichier) {
            const { data: urlData } = await supabase.storage
              .from(this.STORAGE_BUCKET)
              .createSignedUrl(resource.url_fichier, 3600) // 1 heure

            return {
              ...resource,
              downloadUrl: urlData?.signedUrl,
              previewUrl: this.getPreviewUrl(resource)
            }
          }
          return resource
        })
      )

      return resourcesWithUrls
    } catch (error) {
      console.error('Error fetching client resources:', error)
      throw error
    }
  }

  // Récupérer les ressources par thème
  static async getResourcesByTheme(clientId: string, theme: string): Promise<ResourceWithUrl[]> {
    try {
      const { data, error } = await supabase
        .from('ressources_personnalisees')
        .select('*')
        .eq('client_id', clientId)
        .eq('theme', theme)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Générer les URLs de téléchargement
      const resourcesWithUrls = await Promise.all(
        (data || []).map(async (resource) => {
          if (resource.url_fichier) {
            const { data: urlData } = await supabase.storage
              .from(this.STORAGE_BUCKET)
              .createSignedUrl(resource.url_fichier, 3600)

            return {
              ...resource,
              downloadUrl: urlData?.signedUrl,
              previewUrl: this.getPreviewUrl(resource)
            }
          }
          return resource
        })
      )

      return resourcesWithUrls
    } catch (error) {
      console.error('Error fetching resources by theme:', error)
      throw error
    }
  }

  // Uploader une nouvelle ressource
  static async uploadResource(clientId: string, uploadData: ResourceUploadData): Promise<ResourceWithUrl> {
    try {
      // Vérifier la taille du fichier
      if (uploadData.file.size > this.MAX_FILE_SIZE) {
        throw new Error(`Fichier trop volumineux. Taille max: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`)
      }

      // Générer un nom de fichier unique
      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${clientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload vers Supabase Storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(fileName, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Créer l'enregistrement en base
      const resourceData: RessourcePersonnaliseeInsert = {
        client_id: clientId,
        nom_ressource: uploadData.nom_ressource,
        type_ressource: this.getFileType(uploadData.file),
        theme: uploadData.theme,
        url_fichier: fileName,
        taille_fichier: uploadData.file.size,
        description: uploadData.description || null
      }

      const { data: resource, error: dbError } = await supabase
        .from('ressources_personnalisees')
        .insert(resourceData)
        .select()
        .single()

      if (dbError) throw dbError

      // Générer l'URL de téléchargement
      const { data: urlData } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .createSignedUrl(fileName, 3600)

      return {
        ...resource,
        downloadUrl: urlData?.signedUrl,
        previewUrl: this.getPreviewUrl(resource)
      }
    } catch (error) {
      console.error('Error uploading resource:', error)
      throw error
    }
  }

  // Mettre à jour une ressource
  static async updateResource(resourceId: string, updates: RessourcePersonnaliseeUpdate): Promise<ResourceWithUrl> {
    try {
      const { data, error } = await supabase
        .from('ressources_personnalisees')
        .update(updates)
        .eq('id', resourceId)
        .select()
        .single()

      if (error) throw error

      // Générer l'URL de téléchargement
      if (data.url_fichier) {
        const { data: urlData } = await supabase.storage
          .from(this.STORAGE_BUCKET)
          .createSignedUrl(data.url_fichier, 3600)

        return {
          ...data,
          downloadUrl: urlData?.signedUrl,
          previewUrl: this.getPreviewUrl(data)
        }
      }

      return data
    } catch (error) {
      console.error('Error updating resource:', error)
      throw error
    }
  }

  // Supprimer une ressource
  static async deleteResource(resourceId: string): Promise<void> {
    try {
      // Récupérer l'URL du fichier avant suppression
      const { data: resource, error: fetchError } = await supabase
        .from('ressources_personnalisees')
        .select('url_fichier')
        .eq('id', resourceId)
        .single()

      if (fetchError) throw fetchError

      // Supprimer le fichier du storage
      if (resource.url_fichier) {
        const { error: storageError } = await supabase.storage
          .from(this.STORAGE_BUCKET)
          .remove([resource.url_fichier])

        if (storageError) {
          console.warn('Error deleting file from storage:', storageError)
          // On continue même si la suppression du fichier échoue
        }
      }

      // Supprimer l'enregistrement en base
      const { error: dbError } = await supabase
        .from('ressources_personnalisees')
        .delete()
        .eq('id', resourceId)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting resource:', error)
      throw error
    }
  }

  // Télécharger une ressource
  static async downloadResource(resourceId: string): Promise<Blob | null> {
    try {
      const { data: resource, error: fetchError } = await supabase
        .from('ressources_personnalisees')
        .select('url_fichier')
        .eq('id', resourceId)
        .single()

      if (fetchError || !resource.url_fichier) throw new Error('Resource not found')

      const { data, error: downloadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .download(resource.url_fichier)

      if (downloadError) throw downloadError

      return data
    } catch (error) {
      console.error('Error downloading resource:', error)
      throw error
    }
  }

  // Récupérer les statistiques des ressources d'un client
  static async getClientResourceStats(clientId: string): Promise<{
    totalResources: number
    totalSize: number
    resourcesByTheme: Record<string, number>
    resourcesByType: Record<string, number>
  }> {
    try {
      const resources = await this.getClientResources(clientId)
      
      const totalResources = resources.length
      const totalSize = resources.reduce((sum, r) => sum + (r.taille_fichier || 0), 0)
      
      const resourcesByTheme = resources.reduce((acc, r) => {
        acc[r.theme] = (acc[r.theme] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const resourcesByType = resources.reduce((acc, r) => {
        acc[r.type_ressource] = (acc[r.type_ressource] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalResources,
        totalSize,
        resourcesByTheme,
        resourcesByType
      }
    } catch (error) {
      console.error('Error calculating resource stats:', error)
      throw error
    }
  }

  // S'abonner aux changements de ressources d'un client (realtime)
  static subscribeToClientResources(clientId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`resources_client_${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ressources_personnalisees',
          filter: `client_id=eq.${clientId}`
        },
        callback
      )
      .subscribe()
  }

  // Utilitaires privés
  private static getFileType(file: File): 'video' | 'pdf' | 'link' | 'image' | 'document' {
    const type = file.type.toLowerCase()
    
    if (type.startsWith('video/')) return 'video'
    if (type === 'application/pdf') return 'pdf'
    if (type.startsWith('image/')) return 'image'
    if (type.includes('document') || type.includes('text')) return 'document'
    
    return 'document'
  }

  private static getPreviewUrl(resource: RessourcePersonnalisee): string | undefined {
    if (resource.type_ressource === 'image' && resource.url_fichier) {
      const { data } = supabase.storage
        .from(this.STORAGE_BUCKET)
        .getPublicUrl(resource.url_fichier)
      
      return data.publicUrl
    }
    return undefined
  }

  // Vérifier si le bucket storage existe
  static async checkStorageBucket(): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage.listBuckets()
      if (error) throw error
      
      return data.some(bucket => bucket.name === this.STORAGE_BUCKET)
    } catch (error) {
      console.error('Error checking storage bucket:', error)
      return false
    }
  }

  // Créer le bucket storage s'il n'existe pas
  static async createStorageBucket(): Promise<void> {
    try {
      const bucketExists = await this.checkStorageBucket()
      if (bucketExists) return

      const { error } = await supabase.storage.createBucket(this.STORAGE_BUCKET, {
        public: false,
        allowedMimeTypes: [
          'image/*',
          'video/*',
          'application/pdf',
          'text/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: this.MAX_FILE_SIZE
      })

      if (error) throw error
    } catch (error) {
      console.error('Error creating storage bucket:', error)
      throw error
    }
  }
}

export default ResourceService
