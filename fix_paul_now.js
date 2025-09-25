// SCRIPT URGENT - À exécuter dans la console du navigateur
// Ce script va corriger immédiatement le problème de Paul

console.log('🚨 CORRECTION URGENTE - Réponse de Paul');

async function fixPaulNow() {
  try {
    console.log('🔍 Recherche de Paul...');
    
    // 1. Trouver Paul
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .ilike('first_name', '%paul%')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      console.error('❌ Paul non trouvé');
      alert('Paul non trouvé dans la base de données');
      return;
    }
    
    const paul = clients[0];
    console.log('✅ Paul trouvé:', paul);
    
    // 2. Trouver son feedback récent
    const { data: paulFeedbacks, error: feedbacksError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('client_id', paul.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (feedbacksError || !paulFeedbacks || paulFeedbacks.length === 0) {
      console.error('❌ Aucun feedback de Paul trouvé');
      alert('Aucun feedback de Paul trouvé');
      return;
    }
    
    const paulFeedback = paulFeedbacks[0];
    console.log('✅ Feedback de Paul trouvé:', paulFeedback);
    
    // 3. Ajouter la réponse de Paul
    const paulResponse = [
      {
        question_id: 'paul-q1',
        question_text: 'commetn tu te sens',
        question_type: 'text',
        response: 'super merci coach !!'
      }
    ];
    
    console.log('📝 Ajout de la réponse de Paul...');
    
    const { error: updateError } = await supabase
      .from('feedbacks_hebdomadaires')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        responses: paulResponse
      })
      .eq('id', paulFeedback.id);
    
    if (updateError) {
      console.error('❌ Erreur ajout réponse:', updateError);
      alert('Erreur: ' + updateError.message);
      return;
    }
    
    console.log('✅ Réponse de Paul ajoutée avec succès !');
    alert('✅ Réponse de Paul ajoutée ! Rafraîchis la page pour voir le résultat.');
    
    // 4. Vérifier que ça a marché
    const { data: updatedFeedback, error: verifyError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('id', paulFeedback.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Erreur vérification:', verifyError);
      return;
    }
    
    console.log('🔍 Feedback mis à jour:', updatedFeedback);
    console.log('📊 Réponses de Paul:', updatedFeedback.responses);
    
    return updatedFeedback;
    
  } catch (err) {
    console.error('❌ Erreur générale:', err);
    alert('Erreur: ' + err.message);
  }
}

// Lancer la correction
fixPaulNow();
