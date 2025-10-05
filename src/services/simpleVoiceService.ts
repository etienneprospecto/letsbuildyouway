import { supabase } from '@/lib/supabase'

export class SimpleVoiceService {
  /**
   * Upload un fichier audio vers Supabase Storage
   */
  static async uploadVoiceFile(audioBlob: Blob): Promise<string> {
    try {
      const fileName = `voice-${Date.now()}.webm`
      
      const { data, error } = await supabase.storage
        .from('voice-messages')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm',
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Erreur upload:', error)
        throw error
      }

      const { data: { publicUrl } } = supabase.storage
        .from('voice-messages')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Erreur upload voice:', error)
      throw error
    }
  }

  /**
   * Créer un message vocal simple
   */
  static async createVoiceMessage(
    conversationId: string,
    senderId: string,
    senderType: 'coach' | 'client',
    voiceUrl: string,
    duration: number
  ) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: '🎤 Message vocal',
          sender_id: senderId,
          sender_type: senderType,
          timestamp: new Date().toISOString(),
          message_type: 'voice',
          voice_url: voiceUrl,
          voice_duration: duration,
          voice_file_size: 0,
          voice_mime_type: 'audio/webm'
        })
        .select()
        .single()

      if (error) {
        console.error('Erreur création message:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Erreur création message vocal:', error)
      throw error
    }
  }

  /**
   * Envoyer un message vocal complet
   */
  static async sendVoiceMessage(
    audioBlob: Blob,
    conversationId: string,
    senderId: string,
    senderType: 'coach' | 'client'
  ) {
    try {
      // 1. Upload du fichier
      const voiceUrl = await this.uploadVoiceFile(audioBlob)
      
      // 2. Calculer la durée (approximation)
      const duration = Math.floor(audioBlob.size / 1000) // Approximation basée sur la taille
      
      // 3. Créer le message
      const message = await this.createVoiceMessage(
        conversationId,
        senderId,
        senderType,
        voiceUrl,
        duration
      )

      return message
    } catch (error) {
      console.error('Erreur envoi message vocal:', error)
      throw error
    }
  }
}
