import { supabase } from '../lib/supabase';
import { Message, Conversation } from '../types';

export const messageService = {
  async getConversations(userId: string, userRole: 'coach' | 'client') {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        clients (
          id,
          first_name,
          last_name,
          photo_url
        ),
        profiles!conversations_coach_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq(userRole === 'coach' ? 'coach_id' : 'client_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(messageData: Omit<Message, 'id' | 'timestamp'>) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversationId,
        sender_id: messageData.senderId,
        sender_type: messageData.senderType,
        content: messageData.content,
        type: messageData.type,
        resource_id: messageData.resourceId,
        exercise_id: messageData.exerciseId,
        image_url: messageData.imageUrl,
        read: false
      })
      .select()
      .single();

    if (error) throw error;

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', messageData.conversationId);

    return data;
  },

  async markAsRead(messageId: string) {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  async createConversation(clientId: string, coachId: string) {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        client_id: clientId,
        coach_id: coachId,
        unread_count: 0,
        is_priority: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};