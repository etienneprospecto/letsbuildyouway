// Script de debug spécifique pour la réponse de Paul
// À exécuter dans la console du navigateur

console.log('🔍 Debug spécifique pour la réponse de Paul');

// Test 1: Chercher tous les feedbacks de Paul
async function findPaulFeedbacks() {
  try {
    // D'abord, trouver Paul dans les clients
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .ilike('first_name', '%paul%');
    
    if (clientsError) {
      console.error('❌ Erreur recherche clients:', clientsError);
      return;
    }
    
    console.log('👤 Clients trouvés:', clients);
    
    if (clients.length === 0) {
      console.log('❌ Aucun client Paul trouvé');
      return;
    }
    
    const paul = clients[0];
    console.log('👤 Paul trouvé:', paul);
    
    // Maintenant, chercher ses feedbacks
    const { data: paulFeedbacks, error: feedbacksError } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .eq('client_id', paul.id)
      .order('created_at', { ascending: false });
    
    if (feedbacksError) {
      console.error('❌ Erreur recherche feedbacks Paul:', feedbacksError);
      return;
    }
    
    console.log('📋 Feedbacks de Paul:', paulFeedbacks);
    
    // Analyser chaque feedback de Paul
    paulFeedbacks.forEach(feedback => {
      console.log(`\n📊 Feedback ${feedback.id} de Paul:`, {
        status: feedback.status,
        week_start: feedback.week_start,
        week_end: feedback.week_end,
        responses: feedback.responses,
        responsesType: typeof feedback.responses,
        responsesLength: feedback.responses?.length || 0,
        completed_at: feedback.completed_at,
        created_at: feedback.created_at
      });
      
      // Si il y a des réponses, les afficher en détail
      if (feedback.responses && feedback.responses.length > 0) {
        console.log('📝 Réponses détaillées:', feedback.responses);
        feedback.responses.forEach((response, index) => {
          console.log(`  Réponse ${index + 1}:`, {
            question_text: response.question_text,
            response: response.response,
            question_type: response.question_type
          });
        });
      }
    });
    
    return { paul, paulFeedbacks };
    
  } catch (err) {
    console.error('❌ Erreur debug Paul:', err);
  }
}

// Test 2: Vérifier tous les feedbacks complétés récents
async function checkRecentCompletedFeedbacks() {
  try {
    const { data: completedFeedbacks, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select(`
        *,
        clients!inner(first_name, last_name)
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('❌ Erreur recherche feedbacks complétés:', error);
      return;
    }
    
    console.log('✅ Feedbacks complétés récents:', completedFeedbacks);
    
    completedFeedbacks.forEach(feedback => {
      console.log(`\n📊 Feedback complété ${feedback.id}:`, {
        client: `${feedback.clients.first_name} ${feedback.clients.last_name}`,
        status: feedback.status,
        week_start: feedback.week_start,
        week_end: feedback.week_end,
        responses: feedback.responses,
        responsesLength: feedback.responses?.length || 0,
        completed_at: feedback.completed_at
      });
    });
    
    return completedFeedbacks;
    
  } catch (err) {
    console.error('❌ Erreur recherche feedbacks complétés:', err);
  }
}

// Test 3: Vérifier la structure de la table
async function checkTableStructure() {
  try {
    // Vérifier la structure de la table feedbacks_hebdomadaires
    const { data, error } = await supabase
      .from('feedbacks_hebdomadaires')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur vérification structure table:', error);
      return;
    }
    
    if (data && data.length > 0) {
      const sample = data[0];
      console.log('🏗️ Structure de la table feedbacks_hebdomadaires:');
      console.log('Colonnes disponibles:', Object.keys(sample));
      console.log('Exemple de données:', sample);
    }
    
  } catch (err) {
    console.error('❌ Erreur vérification structure:', err);
  }
}

// Exécuter tous les tests de debug
async function runPaulDebugTests() {
  console.log('🚀 Démarrage des tests de debug pour Paul...');
  
  await checkTableStructure();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await findPaulFeedbacks();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await checkRecentCompletedFeedbacks();
  
  console.log('\n🎉 Tests de debug Paul terminés !');
}

// Lancer les tests
runPaulDebugTests();
