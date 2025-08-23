import { supabase } from '@/lib/supabase'

export interface ProgressPhoto {
  id: string
  client_id: string
  nom_photo: string
  url_fichier: string
  description?: string
  date_prise: string
  created_at: string
}

export interface ProgressPhotoUploadData {
  file: File
  nom_photo: string
  description?: string
  date_prise?: string
}

export interface ProgressPhotoWithUrl extends ProgressPhoto {
  downloadUrl?: string
  previewUrl?: string
}

export class ProgressPhotoService {
  private static readonly STORAGE_BUCKET = 'client-resources'
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB pour les photos

  // Récupérer toutes les photos de progression d'un client
  static async getClientProgressPhotos(clientId: string): Promise<ProgressPhotoWithUrl[]> {
    try {
      const { data, error } = await supabase
        .from('photos_progression')
        .select('*')
        .eq('client_id', clientId)
        .order('date_prise', { ascending: false })

      if (error) throw error

      // Générer les URLs de téléchargement pour chaque photo
      const photosWithUrls = await Promise.all(
        (data || []).map(async (photo) => {
          if (photo.url_fichier) {
            const { data: urlData } = await supabase.storage
              .from(this.STORAGE_BUCKET)
              .createSignedUrl(photo.url_fichier, 3600) // 1 heure

            return {
              ...photo,
              downloadUrl: urlData?.signedUrl,
              previewUrl: urlData?.signedUrl
            }
          }
          return photo
        })
      )

      return photosWithUrls
    } catch (error) {
      console.error('Error fetching client progress photos:', error)
      throw error
    }
  }

  // Uploader une nouvelle photo de progression
  static async uploadProgressPhoto(clientId: string, uploadData: ProgressPhotoUploadData): Promise<ProgressPhotoWithUrl> {
    try {
      // Vérifier la taille du fichier
      if (uploadData.file.size > this.MAX_FILE_SIZE) {
        throw new Error(`Photo trop volumineuse. Taille max: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`)
      }

      // Vérifier que c'est bien une image
      if (!uploadData.file.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image')
      }

      // Générer un nom de fichier unique
      const fileExt = uploadData.file.name.split('.').pop()
      const fileName = `${clientId}/progress-photos/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      // Upload vers Supabase Storage
      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .upload(fileName, uploadData.file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Créer l'enregistrement en base
      const photoData = {
        client_id: clientId,
        nom_photo: uploadData.nom_photo,
        url_fichier: fileName,
        description: uploadData.description || null,
        date_prise: uploadData.date_prise || new Date().toISOString()
      }

      const { data: photo, error: dbError } = await supabase
        .from('photos_progression')
        .insert(photoData)
        .select()
        .single()

      if (dbError) throw dbError

      // Générer l'URL de téléchargement
      const { data: urlData } = await supabase.storage
        .from(this.STORAGE_BUCKET)
        .createSignedUrl(fileName, 3600)

      return {
        ...photo,
        downloadUrl: urlData?.signedUrl,
        previewUrl: urlData?.signedUrl
      }
    } catch (error) {
      console.error('Error uploading progress photo:', error)
      throw error
    }
  }

  // Supprimer une photo de progression
  static async deleteProgressPhoto(photoId: string): Promise<void> {
    try {
      // Récupérer l'URL du fichier avant suppression
      const { data: photo, error: fetchError } = await supabase
        .from('photos_progression')
        .select('url_fichier')
        .eq('id', photoId)
        .single()

      if (fetchError) throw fetchError

      // Supprimer le fichier du storage
      if (photo.url_fichier) {
        const { error: storageError } = await supabase.storage
          .from(this.STORAGE_BUCKET)
          .remove([photo.url_fichier])

        if (storageError) throw storageError
      }

      // Supprimer l'enregistrement en base
      const { error: dbError } = await supabase
        .from('photos_progression')
        .delete()
        .eq('id', photoId)

      if (dbError) throw dbError
    } catch (error) {
      console.error('Error deleting progress photo:', error)
      throw error
    }
  }

  // Mettre à jour une photo de progression
  static async updateProgressPhoto(photoId: string, updates: Partial<ProgressPhoto>): Promise<ProgressPhotoWithUrl> {
    try {
      const { data, error } = await supabase
        .from('photos_progression')
        .update(updates)
        .eq('id', photoId)
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
          previewUrl: urlData?.signedUrl
        }
      }

      return data
    } catch (error) {
      console.error('Error updating progress photo:', error)
      throw error
    }
  }
}

export default ProgressPhotoService
