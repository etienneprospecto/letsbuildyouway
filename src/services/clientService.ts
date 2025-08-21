import { supabase } from '../lib/supabase';
import { Client } from '../types';

export const clientService = {
  async getClients(coachId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('coach_id', coachId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getClientById(clientId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error) throw error;
    return data;
  },

  async createClient(clientData: Omit<Client, 'id'> & { coachId: string }) {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        coach_id: clientData.coachId,
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        age: clientData.age,
        photo_url: clientData.photo,
        objective: clientData.objective,
        level: clientData.level,
        mentality: clientData.mentality,
        coaching_type: clientData.coachingType,
        start_date: clientData.startDate,
        end_date: clientData.endDate,
        constraints: clientData.constraints,
        allergies: clientData.allergies,
        morphotype: clientData.morphotype,
        equipment: clientData.equipment,
        lifestyle: clientData.lifestyle,
        contact: clientData.contact,
        sports_history: clientData.sportsHistory,
        needs_attention: clientData.needsAttention || false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateClient(clientId: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        age: updates.age,
        photo_url: updates.photo,
        objective: updates.objective,
        level: updates.level,
        mentality: updates.mentality,
        coaching_type: updates.coachingType,
        end_date: updates.endDate,
        constraints: updates.constraints,
        allergies: updates.allergies,
        morphotype: updates.morphotype,
        equipment: updates.equipment,
        lifestyle: updates.lifestyle,
        contact: updates.contact,
        sports_history: updates.sportsHistory,
        needs_attention: updates.needsAttention,
        updated_at: new Date().toISOString()
      })
      .eq('id', clientId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteClient(clientId: string) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);

    if (error) throw error;
  }
};