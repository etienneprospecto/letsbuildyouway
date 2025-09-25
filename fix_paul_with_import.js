// Script avec import de supabase
(async()=>{
  // Importer supabase depuis le module
  const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
  
  // Créer le client supabase (remplace par tes vraies clés)
  const supabase = createClient(
    'https://your-project.supabase.co', // Remplace par ton URL
    'your-anon-key' // Remplace par ta clé
  );
  
  try {
    console.log('🔍 Recherche de Paul...');
    
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .ilike('first_name', '%paul%')
      .limit(1);
    
    if (clientsError || !clients || clients.length === 0) {
      alert('Paul non trouvé');
      return;
    }
    
    const paul = clients[0];
    console.log('✅ Paul trouvé:', paul);
    
    const { data: paulFeedbacks, error: feedbacksError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('client_id', paul.id)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (feedbacksError || !paulFeedbacks || paulFeedbacks.length === 0) {
      alert('Aucun feedback de Paul trouvé');
      return;
    }
    
    const paulFeedback = paulFeedbacks[0];
    console.log('✅ Feedback de Paul trouvé:', paulFeedback);
    
    const paulResponse = [
      {
        question_id: 'paul-q1',
        question_text: 'commetn tu te sens',
        question_type: 'text',
        response: 'super merci coach !!'
      }
    ];
    
    const { error: updateError } = await supabase
      .from('feedbacks_hebdomadaires')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        responses: paulResponse
      })
      .eq('id', paulFeedback.id);
    
    if (updateError) {
      alert('Erreur: ' + updateError.message);
      return;
    }
    
    alert('✅ Réponse de Paul ajoutée ! Rafraîchis la page.');
    
  } catch (err) {
    console.error('❌ Erreur:', err);
    alert('Erreur: ' + err.message);
  }
})();
